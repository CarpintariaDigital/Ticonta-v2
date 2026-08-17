from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import structlog

from app.audit.service import log_audit
from app.compliance.inss import INSSCalculator
from app.compliance.irt import IRTCalculator
from app.models.employee import Attendance, AttendanceStatus, Employee, Payroll, PayrollStatus
from app.schemas.hr import (
    AttendanceCreate,
    EmployeeCreate,
    EmployeeUpdate,
    INSSDeclarationXMLResponse,
    MonthlyPayrollSummaryResponse,
    PayrollItemResponse,
)

logger = structlog.get_logger()


class HRService:
    def __init__(self, db: Session):
        self.db = db
        self.inss_calc = INSSCalculator()
        self.irt_calc = IRTCalculator()

    # --- EMPLOYEES ---
    def create_employee(self, data: EmployeeCreate, user_id: int) -> Employee:
        """Cadastra um novo trabalhador na empresa."""
        emp = Employee(
            company_id=data.company_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            phone=data.phone,
            nuit=data.nuit,
            inss_number=data.inss_number,
            position=data.position,
            department=data.department,
            salary=data.salary,
            start_date=data.start_date or date.today(),
            active=True,
        )
        self.db.add(emp)
        self.db.flush()

        log_audit(
            db=self.db,
            company_id=data.company_id,
            action="CREATE_EMPLOYEE",
            entity="Employee",
            entity_id=emp.id,
            user_id=user_id,
            new_value={"name": emp.full_name, "salary": float(emp.salary), "position": emp.position},
        )

        self.db.commit()
        self.db.refresh(emp)
        logger.info("employee_created", employee_id=emp.id, name=emp.full_name, salary=float(emp.salary))
        return emp

    def get_employees(self, company_id: int = 1, active_only: bool = True) -> List[Employee]:
        """Lista funcionários com filtro opcional de ativos."""
        query = self.db.query(Employee).filter(Employee.company_id == company_id)
        if active_only:
            query = query.filter(Employee.active == True)
        return query.order_by(Employee.first_name.asc()).all()

    def get_employee_by_id(self, employee_id: int, company_id: int = 1) -> Employee:
        """Obtém detalhes do trabalhador."""
        emp = (
            self.db.query(Employee)
            .filter(Employee.id == employee_id, Employee.company_id == company_id)
            .first()
        )
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trabalhador ID {employee_id} não encontrado.",
            )
        return emp

    def update_employee(
        self, employee_id: int, data: EmployeeUpdate, user_id: int, company_id: int = 1
    ) -> Employee:
        """Atualiza cadastro, cargo ou salário do funcionário."""
        emp = self.get_employee_by_id(employee_id, company_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(emp, key, val)

        log_audit(
            db=self.db,
            company_id=company_id,
            action="UPDATE_EMPLOYEE",
            entity="Employee",
            entity_id=emp.id,
            user_id=user_id,
            new_value=update_dict,
        )

        self.db.commit()
        self.db.refresh(emp)
        return emp

    # --- ATTENDANCE ---
    def record_attendance(self, data: AttendanceCreate, user_id: int, company_id: int = 1) -> Attendance:
        """Regista presença, falta ou licença de um empregado para um dia."""
        self.get_employee_by_id(data.employee_id, company_id)

        # Verificar se já existe registo para o dia
        existing = (
            self.db.query(Attendance)
            .filter(Attendance.employee_id == data.employee_id, Attendance.date == data.date)
            .first()
        )
        if existing:
            existing.status = data.status
            existing.hours = data.hours
            existing.notes = data.notes
            self.db.commit()
            self.db.refresh(existing)
            return existing

        att = Attendance(
            employee_id=data.employee_id,
            date=data.date,
            status=data.status,
            hours=data.hours,
            notes=data.notes,
        )
        self.db.add(att)
        self.db.commit()
        self.db.refresh(att)
        return att

    # --- PAYROLL AUTOMATION (INSS + IRPS MOÇAMBIQUE) ---
    def calculate_salary_breakdown(self, gross_salary: Decimal) -> Dict[str, Decimal]:
        """
        Executa os cálculos regulamentares oficiais de Moçambique:
        - 3% Desconto INSS Empregado
        - 4% Contribuição INSS Patronal (Empresa)
        - Retenção na fonte IRPS (2ª Categoria)
        """
        inss_emp = self.inss_calc.calculate_employee_inss(gross_salary)
        inss_pat = self.inss_calc.calculate_employer_inss(gross_salary)

        # Rendimento coletável = Salário Bruto - 3% INSS
        taxable_income = self.irt_calc.calculate_taxable_income(gross_salary, inss_emp)
        irt_result = self.irt_calc.apply_tax_brackets(taxable_income)
        irps_due = Decimal(str(irt_result["tax_due"]))

        net_salary = gross_salary - inss_emp - irps_due

        return {
            "gross_salary": gross_salary,
            "inss_employee": inss_emp,
            "inss_employer": inss_pat,
            "irps": irps_due,
            "net_salary": net_salary,
        }

    def generate_monthly_payroll(self, company_id: int, period: str, user_id: int) -> MonthlyPayrollSummaryResponse:
        """
        Processa a folha de pagamento mensal de todos os funcionários ativos da empresa:
        - Gera registos detalhados na tabela payrolls
        - Calcula INSS (3% + 4%) e IRPS
        """
        employees = self.get_employees(company_id=company_id, active_only=True)
        if not employees:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhum trabalhador ativo encontrado para processar a folha.",
            )

        payroll_items: List[PayrollItemResponse] = []
        total_gross = Decimal("0.00")
        total_inss_emp = Decimal("0.00")
        total_inss_pat = Decimal("0.00")
        total_irps = Decimal("0.00")
        total_net = Decimal("0.00")

        for emp in employees:
            calc = self.calculate_salary_breakdown(emp.salary)

            # Verificar se folha já existe para atualizar ou criar
            existing_pay = (
                self.db.query(Payroll)
                .filter(Payroll.employee_id == emp.id, Payroll.period == period)
                .first()
            )

            if existing_pay:
                existing_pay.gross_salary = calc["gross_salary"]
                existing_pay.inss_employee = calc["inss_employee"]
                existing_pay.inss_employer = calc["inss_employer"]
                existing_pay.irps = calc["irps"]
                existing_pay.net_salary = calc["net_salary"]
                existing_pay.status = PayrollStatus.APPROVED
                pay_obj = existing_pay
            else:
                pay_obj = Payroll(
                    company_id=company_id,
                    employee_id=emp.id,
                    period=period,
                    gross_salary=calc["gross_salary"],
                    inss_employee=calc["inss_employee"],
                    inss_employer=calc["inss_employer"],
                    irps=calc["irps"],
                    other_deductions=Decimal("0.00"),
                    net_salary=calc["net_salary"],
                    status=PayrollStatus.APPROVED,
                )
                self.db.add(pay_obj)

            self.db.flush()

            total_gross += calc["gross_salary"]
            total_inss_emp += calc["inss_employee"]
            total_inss_pat += calc["inss_employer"]
            total_irps += calc["irps"]
            total_net += calc["net_salary"]

            payroll_items.append(
                PayrollItemResponse(
                    id=pay_obj.id,
                    employee_id=emp.id,
                    employee_name=emp.full_name,
                    employee_nuit=emp.nuit,
                    employee_inss=emp.inss_number,
                    position=emp.position,
                    period=period,
                    gross_salary=calc["gross_salary"],
                    inss_employee=calc["inss_employee"],
                    inss_employer=calc["inss_employer"],
                    irps=calc["irps"],
                    other_deductions=Decimal("0.00"),
                    net_salary=calc["net_salary"],
                    status=pay_obj.status,
                )
            )

        log_audit(
            db=self.db,
            company_id=company_id,
            action="GENERATE_PAYROLL",
            entity="Payroll",
            entity_id=0,
            user_id=user_id,
            new_value={
                "period": period,
                "employees_count": len(payroll_items),
                "total_gross": float(total_gross),
                "total_inss": float(total_inss_emp + total_inss_pat),
            },
        )

        self.db.commit()

        return MonthlyPayrollSummaryResponse(
            company_id=company_id,
            period=period,
            total_employees=len(payroll_items),
            total_gross=total_gross,
            total_inss_employee=total_inss_emp,
            total_inss_employer=total_inss_pat,
            total_inss_due=total_inss_emp + total_inss_pat,
            total_irps=total_irps,
            total_net_payable=total_net,
            items=payroll_items,
        )

    def get_monthly_payroll(self, company_id: int, period: str) -> MonthlyPayrollSummaryResponse:
        """Recupera resumo e itens da folha de pagamento de um mês."""
        payrolls = (
            self.db.query(Payroll)
            .filter(Payroll.company_id == company_id, Payroll.period == period)
            .all()
        )

        if not payrolls:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Nenhuma folha de pagamento processada para o período {period}.",
            )

        items: List[PayrollItemResponse] = []
        total_gross = Decimal("0.00")
        total_inss_emp = Decimal("0.00")
        total_inss_pat = Decimal("0.00")
        total_irps = Decimal("0.00")
        total_net = Decimal("0.00")

        for p in payrolls:
            total_gross += p.gross_salary
            total_inss_emp += p.inss_employee
            total_inss_pat += p.inss_employer
            total_irps += p.irps
            total_net += p.net_salary

            items.append(
                PayrollItemResponse(
                    id=p.id,
                    employee_id=p.employee_id,
                    employee_name=p.employee.full_name if p.employee else "Funcionário",
                    employee_nuit=p.employee.nuit if p.employee else None,
                    employee_inss=p.employee.inss_number if p.employee else None,
                    position=p.employee.position if p.employee else "Cargo",
                    period=p.period,
                    gross_salary=p.gross_salary,
                    inss_employee=p.inss_employee,
                    inss_employer=p.inss_employer,
                    irps=p.irps,
                    other_deductions=p.other_deductions,
                    net_salary=p.net_salary,
                    status=p.status,
                )
            )

        return MonthlyPayrollSummaryResponse(
            company_id=company_id,
            period=period,
            total_employees=len(items),
            total_gross=total_gross,
            total_inss_employee=total_inss_emp,
            total_inss_employer=total_inss_pat,
            total_inss_due=total_inss_emp + total_inss_pat,
            total_irps=total_irps,
            total_net_payable=total_net,
            items=items,
        )

    def generate_inss_declaration_xml(self, company_id: int, period: str) -> INSSDeclarationXMLResponse:
        """
        Gera arquivo XML no formato exigido pelo portal SISSMO do INSS de Moçambique.
        """
        payroll_summary = self.get_monthly_payroll(company_id, period)

        xml_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<DeclaracaoINSS versao="2.0" periodo="{period}">',
            f"  <EntidadeEmpregadora idEmpresa=\"{company_id}\">",
            f"    <TotalTrabalhadores>{payroll_summary.total_employees}</TotalTrabalhadores>",
            f"    <TotalMassaSalarial>{float(payroll_summary.total_gross):.2f}</TotalMassaSalarial>",
            f"    <TotalContribuicaoTrabalhadores>{float(payroll_summary.total_inss_employee):.2f}</TotalContribuicaoTrabalhadores>",
            f"    <TotalContribuicaoPatronal>{float(payroll_summary.total_inss_employer):.2f}</TotalContribuicaoPatronal>",
            f"    <TotalAPagar>{float(payroll_summary.total_inss_due):.2f}</TotalAPagar>",
            "    <Trabalhadores>",
        ]

        for it in payroll_summary.items:
            xml_lines.extend([
                "      <Trabalhador>",
                f"        <Nome>{it.employee_name}</Nome>",
                f"        <NumeroINSS>{it.employee_inss or '000000000'}</NumeroINSS>",
                f"        <NUIT>{it.employee_nuit or '999999999'}</NUIT>",
                f"        <SalarioBruto>{float(it.gross_salary):.2f}</SalarioBruto>",
                f"        <Desconto3Pct>{float(it.inss_employee):.2f}</Desconto3Pct>",
                f"        <Patronal4Pct>{float(it.inss_employer):.2f}</Patronal4Pct>",
                "      </Trabalhador>",
            ])

        xml_lines.extend([
            "    </Trabalhadores>",
            "  </EntidadeEmpregadora>",
            "</DeclaracaoINSS>",
        ])

        xml_content = "\n".join(xml_lines)
        filename = f"declaracao_inss_{period}.xml"

        return INSSDeclarationXMLResponse(
            company_id=company_id,
            period=period,
            xml_content=xml_content,
            filename=filename,
        )
