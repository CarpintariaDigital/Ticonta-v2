from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import structlog

from app.audit.service import log_audit
from app.models.project import Project, ProjectExpense, ProjectStatus, ProjectTask, TaskStatus
from app.schemas.project import (
    ExpenseCreate,
    ProjectCreate,
    ProjectSummaryResponse,
    ProjectUpdate,
    TaskCreate,
    TaskUpdate,
)

logger = structlog.get_logger()


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, data: ProjectCreate, user_id: int) -> Project:
        """Cria um novo projeto / obra ou prestação de serviço."""
        project = Project(
            company_id=data.company_id,
            name=data.name,
            description=data.description,
            budget=data.budget,
            start_date=data.start_date,
            end_date=data.end_date,
            status=ProjectStatus.PLANNING,
        )
        self.db.add(project)
        self.db.flush()

        log_audit(
            db=self.db,
            company_id=data.company_id,
            action="CREATE_PROJECT",
            entity="Project",
            entity_id=project.id,
            user_id=user_id,
            new_value={"name": project.name, "budget": float(project.budget)},
        )

        self.db.commit()
        self.db.refresh(project)
        logger.info("project_created", project_id=project.id, name=project.name, budget=float(project.budget))
        return project

    def get_projects(
        self,
        company_id: int = 1,
        status: Optional[ProjectStatus] = None,
        search: Optional[str] = None,
    ) -> List[Project]:
        """Lista projetos com filtros opcionais."""
        query = self.db.query(Project).filter(Project.company_id == company_id)

        if status:
            query = query.filter(Project.status == status)
        if search:
            query = query.filter(
                (Project.name.ilike(f"%{search}%")) | (Project.description.ilike(f"%{search}%"))
            )

        return query.order_by(Project.created_at.desc()).all()

    def get_project_by_id(self, project_id: int, company_id: int = 1) -> Project:
        """Busca um projeto por ID validando empresa."""
        project = (
            self.db.query(Project)
            .filter(Project.id == project_id, Project.company_id == company_id)
            .first()
        )
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Projeto com ID {project_id} não encontrado.",
            )
        return project

    def update_project(
        self, project_id: int, data: ProjectUpdate, user_id: int, company_id: int = 1
    ) -> Project:
        """Atualiza informações e orçamento do projeto."""
        project = self.get_project_by_id(project_id, company_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(project, key, val)

        log_audit(
            db=self.db,
            company_id=company_id,
            action="UPDATE_PROJECT",
            entity="Project",
            entity_id=project.id,
            user_id=user_id,
            new_value=update_dict,
        )

        self.db.commit()
        self.db.refresh(project)
        return project

    def delete_project(self, project_id: int, user_id: int, company_id: int = 1) -> bool:
        """Exclui projeto e suas tarefas e despesas associadas."""
        project = self.get_project_by_id(project_id, company_id)
        self.db.delete(project)

        log_audit(
            db=self.db,
            company_id=company_id,
            action="DELETE_PROJECT",
            entity="Project",
            entity_id=project_id,
            user_id=user_id,
        )
        self.db.commit()
        return True

    def get_project_summary(self, project_id: int, company_id: int = 1) -> ProjectSummaryResponse:
        """
        Calcula o resumo orçamental, custo real vs planeado, lucro previsto e alertas.
        """
        project = self.get_project_by_id(project_id, company_id)

        budget = project.budget or Decimal("0.00")
        actual_cost = project.total_expenses
        remaining_budget = budget - actual_cost
        profit = remaining_budget  # Lucro operacional da obra

        budget_used_percentage = (
            float((actual_cost / budget) * Decimal("100.0")) if budget > 0 else 0.0
        )
        is_over_budget = actual_cost > budget and budget > 0
        budget_alert = budget_used_percentage >= 80.0

        total_tasks = len(project.tasks)
        completed_tasks = sum(1 for t in project.tasks if t.status == TaskStatus.COMPLETED)

        return ProjectSummaryResponse(
            project_id=project.id,
            name=project.name,
            status=project.status,
            budget=budget,
            actual_cost=actual_cost,
            remaining_budget=remaining_budget,
            profit=profit,
            budget_used_percentage=round(budget_used_percentage, 1),
            progress_percentage=project.progress_percentage,
            is_over_budget=is_over_budget,
            budget_alert=budget_alert,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
        )

    # --- TASKS METHODS ---
    def add_task(self, project_id: int, data: TaskCreate, user_id: int, company_id: int = 1) -> ProjectTask:
        """Adiciona uma nova tarefa ou marco ao cronograma da obra."""
        project = self.get_project_by_id(project_id, company_id)

        task = ProjectTask(
            project_id=project.id,
            title=data.title,
            description=data.description,
            assigned_to_id=data.assigned_to_id,
            due_date=data.due_date,
            status=TaskStatus.PENDING,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update_task(
        self, task_id: int, data: TaskUpdate, user_id: int, company_id: int = 1
    ) -> ProjectTask:
        """Atualiza estado ou atribuição de uma tarefa."""
        task = self.db.query(ProjectTask).filter(ProjectTask.id == task_id).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tarefa com ID {task_id} não encontrada.",
            )

        # Validar se o projeto pertence à empresa
        self.get_project_by_id(task.project_id, company_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(task, key, val)

        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int, user_id: int, company_id: int = 1) -> bool:
        """Remove tarefa do cronograma."""
        task = self.db.query(ProjectTask).filter(ProjectTask.id == task_id).first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada.")
        self.get_project_by_id(task.project_id, company_id)

        self.db.delete(task)
        self.db.commit()
        return True

    # --- EXPENSES METHODS ---
    def add_expense(
        self, project_id: int, data: ExpenseCreate, user_id: int, company_id: int = 1
    ) -> ProjectExpense:
        """
        Regista uma despesa direta vinculada ao projeto (Materiais, Mão de Obra, Combustível).
        """
        project = self.get_project_by_id(project_id, company_id)

        expense = ProjectExpense(
            project_id=project.id,
            description=data.description,
            amount=data.amount,
            category=data.category,
            date=data.date or date.today(),
        )
        self.db.add(expense)

        log_audit(
            db=self.db,
            company_id=company_id,
            action="ADD_PROJECT_EXPENSE",
            entity="ProjectExpense",
            entity_id=project.id,
            user_id=user_id,
            new_value={"description": expense.description, "amount": float(expense.amount)},
        )

        self.db.commit()
        self.db.refresh(expense)
        return expense

    def get_project_expenses(self, project_id: int, company_id: int = 1) -> List[ProjectExpense]:
        """Lista todas as despesas lançadas no projeto."""
        self.get_project_by_id(project_id, company_id)
        return (
            self.db.query(ProjectExpense)
            .filter(ProjectExpense.project_id == project_id)
            .order_by(ProjectExpense.date.desc(), ProjectExpense.id.desc())
            .all()
        )
