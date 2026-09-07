#!/usr/bin/env python3
"""
TiConta v2 - License Key Generator CLI Utility
Usage:
    python scripts/generate_license.py --customer "MZ400123" --plan completo --days 365
"""

import argparse
import hashlib
import hmac
import os
import sys
from datetime import datetime, timedelta

MASTER_KEY = os.environ.get("LICENSE_MASTER_KEY", "change-me-in-production-min-32-chars-master-key")

PLAN_CODES = {
    "basico": "BAS",
    "professional": "PRO",
    "completo": "COMP",
    "enterprise": "ENT",
}


def generate_key(customer_id: str, plan: str, days: int, master_key: str) -> str:
    plan_code = PLAN_CODES.get(plan.lower(), "BAS")
    expiry_date = (datetime.utcnow() + timedelta(days=days)).strftime("%y%m%d")
    payload = f"{customer_id.upper().strip()}-{plan_code}-{expiry_date}"

    signature = hmac.new(
        master_key.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()[:10].upper()

    return f"TIC-{payload}-{signature}"


def main():
    parser = argparse.ArgumentParser(description="Gerador de Licenças Criptográficas TiConta v2")
    parser.add_argument("--customer", required=True, help="ID ou NUIT do cliente (ex: MZ400123)")
    parser.add_argument("--plan", default="completo", choices=["basico", "professional", "completo", "enterprise"], help="Plano contratado")
    parser.add_argument("--days", type=int, default=365, help="Número de dias de validade")
    parser.add_argument("--key", default=MASTER_KEY, help="Master Secret Key")

    args = parser.parse_args()

    lic_key = generate_key(args.customer, args.plan, args.days, args.key)
    exp_date = (datetime.utcnow() + timedelta(days=args.days)).strftime("%d/%m/%Y")

    print("\n" + "=" * 50)
    print(" 🇲🇿 TICONTA V2 — EMISSÃO DE LICENÇA")
    print("=" * 50)
    print(f" Cliente:    {args.customer.upper()}")
    print(f" Plano:      {args.plan.upper()}")
    print(f" Validade:   {args.days} dias (Até {exp_date})")
    print(f" CHAVE:      \033[1;32m{lic_key}\033[0m")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()
