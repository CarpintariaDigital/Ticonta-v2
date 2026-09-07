from datetime import date, datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data, require_role
from app.schemas.accounting import (
    AccountCreate,
    AccountResponse,
    BalanceSheetResponse,
    IncomeStatementResponse,
    JournalEntryCreate,
    JournalEntryResponse,
    TrialBalanceResponse,
)
from app.services.accounting import AccountingService

router = APIRouter(prefix="/api/v1/accounting", tags=["Contabilidade (PGC-NIRF)"])


@router.get("/chart-of-accounts", response_model=List[AccountResponse])
def get_chart_of_accounts(
    company_id: int = Query(1, description="ID da empresa"),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar plano geral de contas da empresa (PGC Moçambique)."""
    service = AccountingService(db)
    return service.get_chart_of_accounts(company_id=company_id)


@router.post("/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    data: AccountCreate,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Criar conta contábil personalizada."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = AccountingService(db)
    return service.create_account(data=data, user_id=user_id)


@router.get("/accounts/{account_id}", response_model=AccountResponse)
def get_account_details(
    account_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Buscar detalhes e saldo de uma conta específica."""
    service = AccountingService(db)
    return service.get_account_by_id(account_id=account_id, company_id=company_id)


@router.get("/journal-entries", response_model=List[JournalEntryResponse])
def list_journal_entries(
    company_id: int = Query(1),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    account_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar lançamentos do diário/razão contábil."""
    service = AccountingService(db)
    entries = service.get_journal_entries(
        company_id=company_id,
        skip=skip,
        limit=limit,
        account_id=account_id,
        start_date=start_date,
        end_date=end_date,
    )
    result = []
    for e in entries:
        result.append(
            JournalEntryResponse(
                id=e.id,
                company_id=e.company_id,
                entry_date=e.entry_date,
                entry_number=e.entry_number,
                debit_account_id=e.debit_account_id,
                debit_account_code=e.debit_account.account_code if e.debit_account else None,
                debit_account_name=e.debit_account.account_name if e.debit_account else None,
                credit_account_id=e.credit_account_id,
                credit_account_code=e.credit_account.account_code if e.credit_account else None,
                credit_account_name=e.credit_account.account_name if e.credit_account else None,
                amount=e.amount,
                description=e.description,
                reference_type=e.reference_type,
                reference_id=e.reference_id,
                created_by_id=e.created_by_id,
                created_at=e.created_at,
            )
        )
    return result


@router.post("/journal-entries", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    data: JournalEntryCreate,
    request: Request,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Criar lançamento contábil manual por partida dobrada."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent")

    service = AccountingService(db)
    entry = service.create_journal_entry(
        data=data,
        user_id=user_id,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    return JournalEntryResponse(
        id=entry.id,
        company_id=entry.company_id,
        entry_date=entry.entry_date,
        entry_number=entry.entry_number,
        debit_account_id=entry.debit_account_id,
        debit_account_code=entry.debit_account.account_code if entry.debit_account else None,
        debit_account_name=entry.debit_account.account_name if entry.debit_account else None,
        credit_account_id=entry.credit_account_id,
        credit_account_code=entry.credit_account.account_code if entry.credit_account else None,
        credit_account_name=entry.credit_account.account_name if entry.credit_account else None,
        amount=entry.amount,
        description=entry.description,
        reference_type=entry.reference_type,
        reference_id=entry.reference_id,
        created_by_id=entry.created_by_id,
        created_at=entry.created_at,
    )


@router.get("/trial-balance", response_model=TrialBalanceResponse)
def get_trial_balance(
    company_id: int = Query(1),
    as_of_date: Optional[date] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Gerar Balancete de Verificação (Trial Balance)."""
    service = AccountingService(db)
    return service.get_trial_balance(company_id=company_id, as_of_date=as_of_date)


@router.get("/income-statement", response_model=IncomeStatementResponse)
def get_income_statement(
    company_id: int = Query(1),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Gerar Demonstração de Resultados do Exercício (DRE / Income Statement)."""
    service = AccountingService(db)
    return service.get_income_statement(
        company_id=company_id,
        date_from=date_from,
        date_to=date_to,
    )


@router.get("/balance-sheet", response_model=BalanceSheetResponse)
def get_balance_sheet(
    company_id: int = Query(1),
    as_of_date: Optional[date] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Gerar Balanço Patrimonial (Balance Sheet)."""
    service = AccountingService(db)
    return service.get_balance_sheet(company_id=company_id, as_of_date=as_of_date)
