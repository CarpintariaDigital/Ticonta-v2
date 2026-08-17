from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.models.project import ProjectStatus
from app.schemas.project import (
    ExpenseCreate,
    ExpenseResponse,
    ProjectCreate,
    ProjectResponse,
    ProjectSummaryResponse,
    ProjectUpdate,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
from app.services.projects import ProjectService

router = APIRouter(prefix="/api/v1/projects", tags=["Projetos, Obras & Serviços"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    company_id: int = Query(1),
    status: Optional[ProjectStatus] = Query(None),
    search: Optional[str] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar projetos e obras da empresa."""
    service = ProjectService(db)
    projects = service.get_projects(company_id=company_id, status=status, search=search)
    return [
        ProjectResponse(
            id=p.id,
            company_id=p.company_id,
            name=p.name,
            description=p.description,
            status=p.status,
            budget=p.budget,
            actual_cost=p.total_expenses,
            progress=p.progress_percentage,
            start_date=p.start_date,
            end_date=p.end_date,
            created_at=p.created_at,
            updated_at=p.updated_at,
            tasks=[
                TaskResponse(
                    id=t.id,
                    project_id=t.project_id,
                    title=t.title,
                    description=t.description,
                    status=t.status,
                    assigned_to_id=t.assigned_to_id,
                    assigned_to_name=t.assigned_to.username if t.assigned_to else None,
                    due_date=t.due_date,
                    created_at=t.created_at,
                )
                for t in p.tasks
            ],
            expenses=[
                ExpenseResponse(
                    id=e.id,
                    project_id=e.project_id,
                    description=e.description,
                    amount=e.amount,
                    category=e.category,
                    date=e.date,
                    created_at=e.created_at,
                )
                for e in p.expenses
            ],
        )
        for p in projects
    ]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Criar novo projeto ou obra."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ProjectService(db)
    p = service.create_project(data=data, user_id=user_id)
    return ProjectResponse(
        id=p.id,
        company_id=p.company_id,
        name=p.name,
        description=p.description,
        status=p.status,
        budget=p.budget,
        actual_cost=p.total_expenses,
        progress=p.progress_percentage,
        start_date=p.start_date,
        end_date=p.end_date,
        created_at=p.created_at,
        updated_at=p.updated_at,
        tasks=[],
        expenses=[],
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Obter detalhes do projeto com tarefas e despesas."""
    service = ProjectService(db)
    p = service.get_project_by_id(project_id=project_id, company_id=company_id)
    return ProjectResponse(
        id=p.id,
        company_id=p.company_id,
        name=p.name,
        description=p.description,
        status=p.status,
        budget=p.budget,
        actual_cost=p.total_expenses,
        progress=p.progress_percentage,
        start_date=p.start_date,
        end_date=p.end_date,
        created_at=p.created_at,
        updated_at=p.updated_at,
        tasks=[
            TaskResponse(
                id=t.id,
                project_id=t.project_id,
                title=t.title,
                description=t.description,
                status=t.status,
                assigned_to_id=t.assigned_to_id,
                assigned_to_name=t.assigned_to.username if t.assigned_to else None,
                due_date=t.due_date,
                created_at=t.created_at,
            )
            for t in p.tasks
        ],
        expenses=[
            ExpenseResponse(
                id=e.id,
                project_id=e.project_id,
                description=e.description,
                amount=e.amount,
                category=e.category,
                date=e.date,
                created_at=e.created_at,
            )
            for e in p.expenses
        ],
    )


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Atualizar projeto / orçamento."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ProjectService(db)
    p = service.update_project(project_id=project_id, data=data, user_id=user_id, company_id=company_id)
    return ProjectResponse(
        id=p.id,
        company_id=p.company_id,
        name=p.name,
        description=p.description,
        status=p.status,
        budget=p.budget,
        actual_cost=p.total_expenses,
        progress=p.progress_percentage,
        start_date=p.start_date,
        end_date=p.end_date,
        created_at=p.created_at,
        updated_at=p.updated_at,
        tasks=[],
        expenses=[],
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Excluir projeto."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ProjectService(db)
    service.delete_project(project_id=project_id, user_id=user_id, company_id=company_id)
    return None


@router.get("/{project_id}/summary", response_model=ProjectSummaryResponse)
def get_project_summary(
    project_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Resumo de orçamento, despesas reais, lucro e alertas."""
    service = ProjectService(db)
    return service.get_project_summary(project_id=project_id, company_id=company_id)


# --- TASKS ENDPOINTS ---
@router.post("/{project_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def add_project_task(
    project_id: int,
    data: TaskCreate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Adicionar tarefa ao cronograma da obra."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ProjectService(db)
    t = service.add_task(project_id=project_id, data=data, user_id=user_id, company_id=company_id)
    return TaskResponse(
        id=t.id,
        project_id=t.project_id,
        title=t.title,
        description=t.description,
        status=t.status,
        assigned_to_id=t.assigned_to_id,
        assigned_to_name=t.assigned_to.username if t.assigned_to else None,
        due_date=t.due_date,
        created_at=t.created_at,
    )


@router.put("/{project_id}/tasks/{task_id}", response_model=TaskResponse)
def update_project_task(
    project_id: int,
    task_id: int,
    data: TaskUpdate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Atualizar tarefa / estado de conclusão."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ProjectService(db)
    t = service.update_task(task_id=task_id, data=data, user_id=user_id, company_id=company_id)
    return TaskResponse(
        id=t.id,
        project_id=t.project_id,
        title=t.title,
        description=t.description,
        status=t.status,
        assigned_to_id=t.assigned_to_id,
        assigned_to_name=t.assigned_to.username if t.assigned_to else None,
        due_date=t.due_date,
        created_at=t.created_at,
    )


@router.delete("/{project_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_task(
    project_id: int,
    task_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Remover tarefa da obra."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ProjectService(db)
    service.delete_task(task_id=task_id, user_id=user_id, company_id=company_id)
    return None


# --- EXPENSES ENDPOINTS ---
@router.post("/{project_id}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_project_expense(
    project_id: int,
    data: ExpenseCreate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Lançar despesa no projeto."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ProjectService(db)
    e = service.add_expense(project_id=project_id, data=data, user_id=user_id, company_id=company_id)
    return ExpenseResponse(
        id=e.id,
        project_id=e.project_id,
        description=e.description,
        amount=e.amount,
        category=e.category,
        date=e.date,
        created_at=e.created_at,
    )


@router.get("/{project_id}/expenses", response_model=List[ExpenseResponse])
def list_project_expenses(
    project_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar despesas do projeto."""
    service = ProjectService(db)
    expenses = service.get_project_expenses(project_id=project_id, company_id=company_id)
    return [
        ExpenseResponse(
            id=e.id,
            project_id=e.project_id,
            description=e.description,
            amount=e.amount,
            category=e.category,
            date=e.date,
            created_at=e.created_at,
        )
        for e in expenses
    ]
