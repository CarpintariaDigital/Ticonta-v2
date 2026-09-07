from typing import Any, Dict, List, Optional
import re

# Plano Geral de Contabilidade - PGC-NIRF / Setor Empresarial de Moçambique
PGC_CHART_OF_ACCOUNTS: List[Dict[str, Any]] = [
    # CLASSE 1: MEIOS FINANCEIROS LÍQUIDOS (ACTIVO)
    {"code": "1.1", "name": "Caixa", "type": "asset", "is_header": True},
    {"code": "1.1.1", "name": "Caixa Geral (Sede)", "type": "asset", "is_header": False},
    {"code": "1.1.2", "name": "Caixa Pequeno / Fundo Maneio", "type": "asset", "is_header": False},
    {"code": "1.2", "name": "Bancos e Carteiras Digitais", "type": "asset", "is_header": True},
    {"code": "1.2.1", "name": "Depósitos à Ordem MZN", "type": "asset", "is_header": False},
    {"code": "1.2.2", "name": "Carteiras Móveis (M-Pesa / e-Mola)", "type": "asset", "is_header": False},
    {"code": "1.2.3", "name": "Depósitos em Moeda Estrangeira (USD/ZAR)", "type": "asset", "is_header": False},

    # CLASSE 2: INVENTÁRIOS E ACTIVOS BIOLÓGICOS (ACTIVO)
    {"code": "2.1", "name": "Mercadorias", "type": "asset", "is_header": True},
    {"code": "2.1.1", "name": "Mercadorias em Armazém Geral", "type": "asset", "is_header": False},
    {"code": "2.2", "name": "Matérias-Primas e Consumíveis", "type": "asset", "is_header": False},

    # CLASSE 3: INVESTIMENTOS DE CAPITAL (ACTIVO NÃO CORRENTE)
    {"code": "3.1", "name": "Activos Tangíveis", "type": "asset", "is_header": True},
    {"code": "3.1.1", "name": "Equipamento Básico e Ferramental", "type": "asset", "is_header": False},
    {"code": "3.1.2", "name": "Equipamento de Transporte (Viaturas)", "type": "asset", "is_header": False},
    {"code": "3.1.3", "name": "Equipamento Administrativo e Informático", "type": "asset", "is_header": False},

    # CLASSE 4: CONTAS A RECEBER, A PAGAR E OUTRAS OPERAÇÕES
    {"code": "4.1", "name": "Clientes", "type": "asset", "is_header": True},
    {"code": "4.1.1", "name": "Clientes Conta Corrente", "type": "asset", "is_header": False},
    {"code": "4.1.2", "name": "Clientes Cobrança Duvidosa", "type": "asset", "is_header": False},
    {"code": "4.2", "name": "Fornecedores", "type": "liability", "is_header": True},
    {"code": "4.2.1", "name": "Fornecedores Conta Corrente", "type": "liability", "is_header": False},
    {"code": "4.4", "name": "Estado e Outros Entes Públicos", "type": "liability", "is_header": True},
    {"code": "4.4.1", "name": "IVA Liquidado (16%)", "type": "liability", "is_header": False},
    {"code": "4.4.2", "name": "IVA Dedutível", "type": "asset", "is_header": False},
    {"code": "4.4.3", "name": "IRPS / IRPC Retido na Fonte", "type": "liability", "is_header": False},
    {"code": "4.4.4", "name": "INSS a Pagar (4% Empresa + 3% Trab.)", "type": "liability", "is_header": False},
    {"code": "4.6", "name": "Pessoal / Empregados", "type": "liability", "is_header": True},
    {"code": "4.6.1", "name": "Remunerações a Pagar", "type": "liability", "is_header": False},

    # CLASSE 5: CAPITAL PRÓPRIO
    {"code": "5.1", "name": "Capital Social Realizado", "type": "equity", "is_header": False},
    {"code": "5.5", "name": "Reservas Legais", "type": "equity", "is_header": False},
    {"code": "5.9", "name": "Resultados Transitados", "type": "equity", "is_header": False},

    # CLASSE 6: GASTOS E PERDAS (DESPESAS)
    {"code": "6.1", "name": "Custo das Mercadorias Vendidas (CMVMC)", "type": "expense", "is_header": False},
    {"code": "6.2", "name": "Gastos com o Pessoal (Salários + INSS)", "type": "expense", "is_header": False},
    {"code": "6.3", "name": "Fornecimentos e Serviços de Terceiros (FST)", "type": "expense", "is_header": True},
    {"code": "6.3.1", "name": "Água, Electricidade e Combustíveis", "type": "expense", "is_header": False},
    {"code": "6.3.2", "name": "Rendas e Alugueres", "type": "expense", "is_header": False},
    {"code": "6.3.3", "name": "Comunicações e Internet", "type": "expense", "is_header": False},
    {"code": "6.8", "name": "Outros Gastos e Perdas Operacionais", "type": "expense", "is_header": False},

    # CLASSE 7: RENDIMENTOS E GANHOS (RECEITAS)
    {"code": "7.1", "name": "Vendas de Mercadorias", "type": "revenue", "is_header": True},
    {"code": "7.1.1", "name": "Vendas Mercado Nacional (Moçambique)", "type": "revenue", "is_header": False},
    {"code": "7.2", "name": "Prestações de Serviços", "type": "revenue", "is_header": False},
    {"code": "7.8", "name": "Outros Rendimentos e Ganhos Operacionais", "type": "revenue", "is_header": False},

    # CLASSE 8: RESULTADOS
    {"code": "8.1", "name": "Resultados Operacionais", "type": "equity", "is_header": True},
    {"code": "8.8", "name": "Resultado Líquido do Exercício", "type": "equity", "is_header": False},
]


def validate_account_code(account_code: str) -> bool:
    """
    Valida se o código da conta segue a estrutura PGC Moçambique (ex: 1.1, 1.1.1, 7.1.1).
    """
    pattern = r"^[1-8](\.[0-9]+)*$"
    return bool(re.match(pattern, account_code.strip()))


def is_valid_account(account_code: str) -> bool:
    """Verifica se o código da conta existe no plano padronizado PGC Moçambique."""
    if not validate_account_code(account_code):
        return False
    return any(acc["code"] == account_code.strip() for acc in PGC_CHART_OF_ACCOUNTS)


def get_pgc_account_definition(account_code: str) -> Optional[Dict[str, Any]]:
    """Recupera metadados do PGC para a conta fornecida."""
    for acc in PGC_CHART_OF_ACCOUNTS:
        if acc["code"] == account_code.strip():
            return acc
    return None
