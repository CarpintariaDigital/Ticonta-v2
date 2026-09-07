from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
import structlog

from app.audit.service import log_audit
from app.compliance.pgc import PGC_CHART_OF_ACCOUNTS, is_valid_account, validate_account_code
from app.models.account import Account, JournalEntry
from app.models.sale import Sale
from app.schemas.accounting import (
    AccountCreate,
    BalanceSheetResponse,
    IncomeStatementResponse,
    JournalEntryCreate,
    TrialBalanceItem,
    TrialBalanceResponse,
)

logger = structlog.get_logger()


class AccountingService:
    def __init__(self, db: Session):
        self.db = db

    def seed_pgc_chart_of_accounts(self, company_id: int = 1) -> int:
        """Inicializa o plano de contas oficial PGC-NIRF de Moçambique para a empresa."""
        existing_count = self.db.query(Account).filter(Account.company_id == company_id).count()
        if existing_count > 0:
            return existing_count

        created = 0
        for item in PGC_CHART_OF_ACCOUNTS:
            account = Account(
                company_id=company_id,
                account_code=item["code"],
                account_name=item["name"],
                account_type=item["type"],
                is_header=item["is_header"],
                debit_balance=Decimal("0.00"),
                credit_balance=Decimal("0.00"),
            )
            self.db.add(account)
            created += 1

        self.db.commit()
        logger.info("pgc_chart_seeded", count=created, company_id=company_id)
        return created

    def get_chart_of_accounts(self, company_id: int = 1) -> List[Account]:
        """Retorna o plano de contas da empresa, populando o padrão PGC se vazio."""
        accounts = (
            self.db.query(Account)
            .filter(Account.company_id == company_id)
            .order_by(Account.account_code.asc())
            .all()
        )
        if not accounts:
            self.seed_pgc_chart_of_accounts(company_id)
            accounts = (
                self.db.query(Account)
                .filter(Account.company_id == company_id)
                .order_by(Account.account_code.asc())
                .all()
            )
        return accounts

    def get_account_by_id(self, account_id: int, company_id: int = 1) -> Account:
        """Obtém detalhes de uma conta específica."""
        account = (
            self.db.query(Account)
            .filter(Account.id == account_id, Account.company_id == company_id)
            .first()
        )
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conta ID {account_id} não encontrada.",
            )
        return account

    def create_account(self, data: AccountCreate, user_id: int) -> Account:
        """Cria uma nova conta contábil customizada."""
        if not validate_account_code(data.account_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Código de conta '{data.account_code}' inválido para o padrão PGC Moçambique (ex: 1.1.3).",
            )

        existing = (
            self.db.query(Account)
            .filter(
                Account.company_id == data.company_id,
                Account.account_code == data.account_code,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Conta com código {data.account_code} já existe nesta empresa.",
            )

        account = Account(
            company_id=data.company_id,
            account_code=data.account_code,
            account_name=data.account_name,
            account_type=data.account_type.lower(),
            is_header=data.is_header,
            parent_id=data.parent_id,
            debit_balance=Decimal("0.00"),
            credit_balance=Decimal("0.00"),
        )
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)

        log_audit(
            db=self.db,
            company_id=data.company_id,
            action="CREATE_ACCOUNT",
            entity="Account",
            entity_id=account.id,
            user_id=user_id,
            new_value={"code": account.account_code, "name": account.account_name},
        )
        return account

    def generate_entry_number(self, company_id: int) -> str:
        """Gera número sequencial do diário contábil no formato JE-YYYY-NNNNN."""
        year = datetime.utcnow().year
        prefix = f"JE-{year}-"
        last_entry = (
            self.db.query(JournalEntry)
            .filter(
                JournalEntry.company_id == company_id,
                JournalEntry.entry_number.like(f"{prefix}%"),
            )
            .order_by(JournalEntry.id.desc())
            .first()
        )
        if last_entry and last_entry.entry_number.startswith(prefix):
            try:
                seq = int(last_entry.entry_number.split("-")[-1]) + 1
            except ValueError:
                seq = 1
        else:
            seq = 1
        return f"{prefix}{seq:05d}"

    def create_journal_entry(
        self,
        data: JournalEntryCreate,
        user_id: int,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> JournalEntry:
        """
        Criação de lançamento no diário aplicando o método das partidas dobradas (Double-Entry):
        - Débito = Crédito
        - Atualização dos saldos das contas debitada e creditada
        """
        if data.amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O valor do lançamento deve ser estritamente maior que zero.",
            )

        debit_acc = self.get_account_by_id(data.debit_account_id, data.company_id)
        credit_acc = self.get_account_by_id(data.credit_account_id, data.company_id)

        if debit_acc.is_header or credit_acc.is_header:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é permitido lançar em contas agregadoras (is_header=True).",
            )

        entry_number = self.generate_entry_number(data.company_id)

        # Atualizar saldos
        debit_acc.debit_balance = (debit_acc.debit_balance or Decimal("0.00")) + data.amount
        credit_acc.credit_balance = (credit_acc.credit_balance or Decimal("0.00")) + data.amount

        entry = JournalEntry(
            company_id=data.company_id,
            entry_date=data.entry_date or datetime.utcnow(),
            entry_number=entry_number,
            debit_account_id=debit_acc.id,
            credit_account_id=credit_acc.id,
            amount=data.amount,
            description=data.description,
            reference_type=data.reference_type,
            reference_id=data.reference_id,
            created_by_id=user_id,
        )
        self.db.add(entry)
        self.db.flush()

        log_audit(
            db=self.db,
            company_id=data.company_id,
            action="CREATE_JOURNAL_ENTRY",
            entity="JournalEntry",
            entity_id=entry.id,
            user_id=user_id,
            new_value={
                "entry_number": entry_number,
                "amount": float(data.amount),
                "debit": debit_acc.account_code,
                "credit": credit_acc.account_code,
            },
            ip_address=client_ip,
            user_agent=user_agent,
        )

        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_journal_entries(
        self,
        company_id: int = 1,
        skip: int = 0,
        limit: int = 50,
        account_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[JournalEntry]:
        """Listagem de lançamentos do razão / diário com paginação."""
        query = self.db.query(JournalEntry).filter(JournalEntry.company_id == company_id)

        if account_id:
            query = query.filter(
                (JournalEntry.debit_account_id == account_id)
                | (JournalEntry.credit_account_id == account_id)
            )
        if start_date:
            query = query.filter(JournalEntry.entry_date >= start_date)
        if end_date:
            query = query.filter(JournalEntry.entry_date <= end_date)

        return query.order_by(JournalEntry.entry_date.desc(), JournalEntry.id.desc()).offset(skip).limit(limit).all()

    def get_trial_balance(self, company_id: int = 1, as_of_date: Optional[date] = None) -> TrialBalanceResponse:
        """
        Gera o Balancete de Verificação (Trial Balance) PGC-NIRF:
        - Listagem de todas as contas movimentadas ou existentes
        - Total de Débitos = Total de Créditos
        """
        accounts = self.get_chart_of_accounts(company_id)
        items: List[TrialBalanceItem] = []

        sum_total_debits = Decimal("0.00")
        sum_total_credits = Decimal("0.00")

        for acc in accounts:
            deb = acc.debit_balance or Decimal("0.00")
            cred = acc.credit_balance or Decimal("0.00")

            if deb == 0 and cred == 0 and acc.is_header:
                continue

            sum_total_debits += deb
            sum_total_credits += cred

            # Saldo final por natureza da conta
            bal = acc.current_balance
            if acc.account_type.lower() in ["asset", "expense", "activo", "gasto"]:
                debit_bal = bal if bal > 0 else Decimal("0.00")
                credit_bal = abs(bal) if bal < 0 else Decimal("0.00")
            else:
                credit_bal = bal if bal > 0 else Decimal("0.00")
                debit_bal = abs(bal) if bal < 0 else Decimal("0.00")

            items.append(
                TrialBalanceItem(
                    account_code=acc.account_code,
                    account_name=acc.account_name,
                    account_type=acc.account_type,
                    total_debit=deb,
                    total_credit=cred,
                    debit_balance=debit_bal,
                    credit_balance=credit_bal,
                )
            )

        is_balanced = abs(sum_total_debits - sum_total_credits) < Decimal("0.01")
        target_date_str = as_of_date.isoformat() if as_of_date else datetime.utcnow().date().isoformat()

        return TrialBalanceResponse(
            date=target_date_str,
            items=items,
            sum_total_debits=sum_total_debits,
            sum_total_credits=sum_total_credits,
            is_balanced=is_balanced,
        )

    def get_income_statement(
        self,
        company_id: int = 1,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> IncomeStatementResponse:
        """
        Demonstração de Resultados do Exercício (DRE) Moçambique:
        - Classe 7 (Rendimentos) - Classe 6 (Gastos) = Resultado Líquido
        """
        accounts = self.get_chart_of_accounts(company_id)

        revenues_breakdown: List[Dict[str, Any]] = []
        expenses_breakdown: List[Dict[str, Any]] = []

        total_revenues = Decimal("0.00")
        total_expenses = Decimal("0.00")
        cmvmc = Decimal("0.00")

        for acc in accounts:
            bal = acc.current_balance
            if acc.account_type.lower() in ["revenue", "rendimento"]:
                if bal != 0 or not acc.is_header:
                    revenues_breakdown.append({
                        "code": acc.account_code,
                        "name": acc.account_name,
                        "amount": float(bal),
                    })
                    total_revenues += bal
            elif acc.account_type.lower() in ["expense", "gasto"]:
                if bal != 0 or not acc.is_header:
                    expenses_breakdown.append({
                        "code": acc.account_code,
                        "name": acc.account_name,
                        "amount": float(bal),
                    })
                    total_expenses += bal
                    if acc.account_code.startswith("6.1"):
                        cmvmc += bal

        gross_profit = total_revenues - cmvmc
        operating_profit = total_revenues - total_expenses
        net_income = operating_profit  # Antes de IRPC / impostos

        return IncomeStatementResponse(
            period_from=date_from.isoformat() if date_from else "2026-01-01",
            period_to=date_to.isoformat() if date_to else datetime.utcnow().date().isoformat(),
            total_revenues=total_revenues,
            total_expenses=total_expenses,
            gross_profit=gross_profit,
            operating_profit=operating_profit,
            net_income=net_income,
            revenues_breakdown=revenues_breakdown,
            expenses_breakdown=expenses_breakdown,
        )

    def get_balance_sheet(self, company_id: int = 1, as_of_date: Optional[date] = None) -> BalanceSheetResponse:
        """
        Balanço Patrimonial (Balance Sheet) PGC-NIRF:
        - Activo Total = Passivo Total + Capital Próprio (+ Resultado do Exercício)
        """
        accounts = self.get_chart_of_accounts(company_id)
        dre = self.get_income_statement(company_id)

        assets_breakdown: List[Dict[str, Any]] = []
        liabilities_breakdown: List[Dict[str, Any]] = []
        equity_breakdown: List[Dict[str, Any]] = []

        total_assets = Decimal("0.00")
        total_liabilities = Decimal("0.00")
        total_equity = Decimal("0.00")

        for acc in accounts:
            bal = acc.current_balance
            if acc.account_type.lower() in ["asset", "activo"]:
                if bal != 0 or not acc.is_header:
                    assets_breakdown.append({
                        "code": acc.account_code,
                        "name": acc.account_name,
                        "amount": float(bal),
                    })
                    total_assets += bal
            elif acc.account_type.lower() in ["liability", "passivo"]:
                if bal != 0 or not acc.is_header:
                    liabilities_breakdown.append({
                        "code": acc.account_code,
                        "name": acc.account_name,
                        "amount": float(bal),
                    })
                    total_liabilities += bal
            elif acc.account_type.lower() in ["equity", "capital"]:
                if bal != 0 or not acc.is_header:
                    equity_breakdown.append({
                        "code": acc.account_code,
                        "name": acc.account_name,
                        "amount": float(bal),
                    })
                    total_equity += bal

        retained_earnings = dre.net_income
        total_equity_with_income = total_equity + retained_earnings
        is_balanced = abs(total_assets - (total_liabilities + total_equity_with_income)) < Decimal("0.01")

        target_date_str = as_of_date.isoformat() if as_of_date else datetime.utcnow().date().isoformat()

        return BalanceSheetResponse(
            as_of_date=target_date_str,
            total_assets=total_assets,
            total_liabilities=total_liabilities,
            total_equity=total_equity_with_income,
            retained_earnings=retained_earnings,
            is_balanced=is_balanced,
            assets_breakdown=assets_breakdown,
            liabilities_breakdown=liabilities_breakdown,
            equity_breakdown=equity_breakdown,
        )


def get_or_create_account(
    db: Session,
    company_id: int,
    account_code: str,
    account_name: str,
    account_type: str,
) -> Account:
    """Helper de compatibilidade para criar/recuperar conta contábil."""
    account = (
        db.query(Account)
        .filter(Account.company_id == company_id, Account.account_code == account_code)
        .first()
    )
    if not account:
        account = Account(
            company_id=company_id,
            account_code=account_code,
            account_name=account_name,
            account_type=account_type,
            debit_balance=Decimal("0.00"),
            credit_balance=Decimal("0.00"),
        )
        db.add(account)
        db.flush()
    return account


def create_sale_journal_entry(
    db: Session,
    sale: Sale,
    user_id: int,
) -> Optional[JournalEntry]:
    """Cria lançamento contábil automático para a Venda."""
    service = AccountingService(db)
    service.seed_pgc_chart_of_accounts(sale.company_id)

    if sale.payment_method.lower() in ["cash", "dinheiro"]:
        debit_acc = get_or_create_account(db, sale.company_id, "1.1.1", "Caixa Geral (Sede)", "asset")
    elif sale.payment_method.lower() in ["mpesa", "emola", "card", "bank_transfer"]:
        debit_acc = get_or_create_account(db, sale.company_id, "1.2.2", "Carteiras Móveis (M-Pesa / e-Mola)", "asset")
    else:
        debit_acc = get_or_create_account(db, sale.company_id, "4.1.1", "Clientes Conta Corrente", "asset")

    credit_acc = get_or_create_account(db, sale.company_id, "7.1.1", "Vendas Mercado Nacional (Moçambique)", "revenue")

    entry_data = JournalEntryCreate(
        company_id=sale.company_id,
        debit_account_id=debit_acc.id,
        credit_account_id=credit_acc.id,
        amount=sale.net_amount,
        description=f"Lançamento automático da Factura {sale.invoice_number}",
        reference_type="SALE",
        reference_id=sale.id,
        entry_date=sale.sale_date,
    )
    return service.create_journal_entry(entry_data, user_id)
