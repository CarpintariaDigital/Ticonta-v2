#!/usr/bin/env python3
"""
TiConta v2 - License Key Generator CLI Utility
==============================================================================
Ferramenta administrativa para emissão e validação de chaves criptográficas
de licenciamento (HMAC-SHA256) em Moçambique.

Uso Posicional:
    python scripts/generate-license.py "Loja ABC Lda" professional
    python scripts/generate-license.py "Supermercado Maputo" complete 180
    python scripts/generate-license.py "Padaria Estrela" basic 365

Uso com Argumentos Nomeados:
    python scripts/generate-license.py --customer "Loja ABC" --plan complete --days 365 --json
"""

import argparse
import hashlib
import hmac
import json
import os
import random
import string
import sys
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

# Chave Mestra padrão para ambiente local / produção via ENV
MASTER_KEY = os.environ.get("LICENSE_MASTER_KEY", "change-me-in-production-min-32-chars-master-key")

# Definição oficial de planos, módulos e preços mensais (MZN)
PRICING: Dict[str, Dict[str, Any]] = {
    "basic": {
        "code": "BAS",
        "name": "BÁSICO",
        "price_monthly": Decimal("500.00"),
        "modules": ["pos", "customers", "inventory", "offline_sync"],
        "description": "Básico para micro-comércio e operadores de caixa",
    },
    "professional": {
        "code": "PRO",
        "name": "PROFISSIONAL",
        "price_monthly": Decimal("1500.00"),
        "modules": ["pos", "customers", "inventory", "crm", "financial", "accounting", "reports", "offline_sync"],
        "description": "Profissional para PMEs com contabilidade PGC-NIRF e CRM",
    },
    "complete": {
        "code": "COMP",
        "name": "COMPLETO",
        "price_monthly": Decimal("3500.00"),
        "modules": [
            "pos",
            "customers",
            "inventory",
            "crm",
            "financial",
            "accounting",
            "projects",
            "hr",
            "manufacturing",
            "premium_delivery",
            "barcode_scanner",
            "offline_sync",
        ],
        "description": "Completo para indústrias, marcenarias, obras e RH com INSS",
    },
    "enterprise": {
        "code": "ENT",
        "name": "ENTERPRISE",
        "price_monthly": Decimal("7500.00"),
        "modules": ["*"],
        "description": "Enterprise com multi-filiais, suporte 24/7 e customizações",
    },
}

# Aliases em português para facilitar a digitação
PLAN_ALIASES = {
    "basico": "basic",
    "bas": "basic",
    "profissional": "professional",
    "pro": "professional",
    "completo": "complete",
    "comp": "complete",
    "enterprise": "enterprise",
    "ent": "enterprise",
}


def normalize_plan(plan_str: str) -> str:
    """Normaliza o nome do plano para o padrão interno."""
    clean = plan_str.lower().strip()
    return PLAN_ALIASES.get(clean, clean)


def generate_signature(payload_str: str, master_key: str) -> str:
    """Gera assinatura HMAC-SHA256 truncada em 8 caracteres hexadecimais maiúsculos."""
    sig = hmac.new(
        master_key.encode("utf-8"),
        payload_str.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return sig[:8].upper()


def generate_license_key(
    customer_name: str,
    plan: str,
    days: int = 365,
    customer_id: Optional[str] = None,
    master_key: str = MASTER_KEY,
) -> Dict[str, Any]:
    """
    Gera uma chave criptográfica no padrão:
    TIC-XXXXX-PLAN-YYMMDD-SIGNATURE
    """
    plan_norm = normalize_plan(plan)
    if plan_norm not in PRICING:
        valid_plans = ", ".join(PRICING.keys())
        raise ValueError(f"Plano inválido: '{plan}'. Opções disponíveis: {valid_plans}")

    # Gerar ou validar ID único do cliente (5 caracteres alfanuméricos)
    if customer_id:
        cust_id = customer_id.upper().strip()[:8]
    else:
        cust_id = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))

    issued_at = datetime.utcnow()
    expires_at = issued_at + timedelta(days=days)
    yymmdd = expires_at.strftime("%y%m%d")
    plan_code = PRICING[plan_norm]["code"]

    # Montagem do payload criptográfico
    payload_base = f"TIC-{cust_id}-{plan_code}-{yymmdd}"
    signature = generate_signature(payload_base, master_key)
    license_key = f"{payload_base}-{signature}"

    # Cálculo financeiro
    monthly_price = PRICING[plan_norm]["price_monthly"]
    months = Decimal(str(max(1, round(days / 30.0))))
    estimated_total = monthly_price * months

    return {
        "license_key": license_key,
        "customer_id": cust_id,
        "customer_name": customer_name,
        "plan": plan_norm,
        "plan_name": PRICING[plan_norm]["name"],
        "modules": PRICING[plan_norm]["modules"],
        "issued_at": issued_at.isoformat() + "Z",
        "expires_at": expires_at.isoformat() + "Z",
        "expires_formatted": expires_at.strftime("%d/%m/%Y"),
        "days": days,
        "price_monthly_mzn": float(monthly_price),
        "total_estimated_mzn": float(estimated_total),
    }


def main():
    parser = argparse.ArgumentParser(
        description="🇲🇿 TiConta v2 — Gerador Administrativo de Licenças Criptográficas",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    # Suporte a argumentos posicionais
    parser.add_argument("pos_customer", nargs="?", default=None, help="Nome do cliente (ex: 'Loja ABC Lda')")
    parser.add_argument("pos_plan", nargs="?", default=None, help="Plano contratado: basic, professional, complete, enterprise")
    parser.add_argument("pos_days", nargs="?", type=int, default=None, help="Dias de validade (padrão: 365)")

    # Argumentos nomeados
    parser.add_argument("-c", "--customer", help="Nome da empresa ou cliente")
    parser.add_argument("-p", "--plan", help="Plano (basic, professional, complete, enterprise)")
    parser.add_argument("-d", "--days", type=int, default=365, help="Duração em dias da licença (padrão: 365)")
    parser.add_argument("--id", help="Identificador único customizado do cliente (ex: MZ400)")
    parser.add_argument("--key", default=MASTER_KEY, help="Master Secret Key para assinatura HMAC")
    parser.add_argument("--json", action="store_true", help="Retornar saída puramente em JSON")

    args = parser.parse_args()

    # Prioridade de argumentos: Posicional > Nomeado > Padrão
    customer = args.pos_customer or args.customer
    plan = args.pos_plan or args.plan
    days = args.pos_days if args.pos_days is not None else args.days

    if not customer:
        print("\033[1;31m❌ ERRO: O nome do cliente é obrigatório.\033[0m", file=sys.stderr)
        print("\nExemplo de uso:")
        print("  python scripts/generate-license.py \"Mercearia Central Lda\" professional 365\n")
        parser.print_help()
        sys.exit(1)

    if not plan:
        plan = "complete"

    try:
        result = generate_license_key(
            customer_name=customer,
            plan=plan,
            days=days,
            customer_id=args.id,
            master_key=args.key,
        )
    except Exception as e:
        print(f"\033[1;31m❌ ERRO: {e}\033[0m", file=sys.stderr)
        sys.exit(1)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    # Apresentação formatada no Terminal
    print("\n" + "\033[1;36m=" * 65 + "\033[0m")
    print("\033[1;35m       🇲🇿 TICONTA v2 — EMISSÃO DE LICENÇA CRIPTOGRÁFICA\033[0m")
    print("\033[1;36m=" * 65 + "\033[0m")
    print(f"  🏢 \033[1mCliente:\033[0m            {result['customer_name']}")
    print(f"  🆔 \033[1mID Cliente:\033[0m         {result['customer_id']}")
    print(f"  📦 \033[1mPlano:\033[0m              \033[1;32m{result['plan_name']}\033[0m ({result['plan'].upper()})")
    print(f"  📅 \033[1mValidade:\033[0m           {result['days']} dias (Até {result['expires_formatted']})")
    print(f"  💰 \033[1mPreço Mensal:\033[0m       {result['price_monthly_mzn']:,.2f} MZN")
    print(f"  💵 \033[1mTotal Estimado:\033[0m     {result['total_estimated_mzn']:,.2f} MZN")
    print(f"  🧩 \033[1mMódulos Ativos:\033[0m     {', '.join(result['modules'])}")
    print("\033[1;36m-" * 65 + "\033[0m")
    print(f"  🔑 \033[1mCHAVE DE ATIVAÇÃO:\033[0m")
    print(f"     \033[1;42;30m {result['license_key']} \033[0m")
    print("\033[1;36m=" * 65 + "\033[0m\n")


if __name__ == "__main__":
    main()
