from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.project import ProjectStatus, TaskStatus


# Task Schemas
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assigned_to_id: Optional[int] = None
    due_date: Optional[date] = None


class TaskResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    assigned_to_id: Optional[int] = None
    assigned_to_name: Optional[str] = None
    due_date: Optional[date] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Expense Schemas
class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=2, max_length=255)
    amount: Decimal = Field(..., gt=0, description="Valor do gasto em MZN")
    category: str = Field(default="material", description="material, labor, equipment, transport, other")
    date: Optional[date] = None


class ExpenseResponse(BaseModel):
    id: int
    project_id: int
    description: str
    amount: Decimal
    category: str
    date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Project Schemas
class ProjectCreate(BaseModel):
    company_id: int = Field(default=1)
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    budget: Decimal = Field(default=Decimal("0.00"), ge=0, description="Orçamento total aprovado")
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    budget: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectSummaryResponse(BaseModel):
    project_id: int
    name: str
    status: ProjectStatus
    budget: Decimal
    actual_cost: Decimal
    remaining_budget: Decimal
    profit: Decimal
    budget_used_percentage: float
    progress_percentage: float
    is_over_budget: bool
    budget_alert: bool  # True se > 80% do orçamento consumido
    total_tasks: int
    completed_tasks: int


class ProjectResponse(BaseModel):
    id: int
    company_id: int
    name: str
    description: Optional[str] = None
    status: ProjectStatus
    budget: Decimal
    actual_cost: Decimal = Decimal("0.00")
    progress: float = 0.0
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskResponse] = []
    expenses: List[ExpenseResponse] = []

    model_config = ConfigDict(from_attributes=True)
