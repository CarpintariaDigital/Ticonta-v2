# 🚀 TiConta v2 — Sistema de Gestão Integrado para Moçambique

ERP modular, offline-first, com compliance fiscal Moçambique.

## Stack

**Backend:**
- FastAPI 0.104+
- Python 3.11+
- PostgreSQL 15+
- SQLAlchemy 2.0
- Alembic migrations

**Frontend:**
- Next.js 14 (App Router)
- React 18.2+
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state)
- Dexie.js (offline/IndexedDB)

## Quick Start

### Backend

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Database migrations
alembic upgrade head

# Run server
python main.py
# http://localhost:8000/docs (Swagger)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

## Prompts para Desenvolver

Ver: `/areas/ticonta-prompts-stack-completo.md`
Quick reference: `TICONTA_QUICK_REFERENCE.md`

## Estrutura

```
ticonta-v2/
├── backend/           # FastAPI + compliance
├── frontend/          # Next.js PWA
├── infra/            # Docker + CI/CD (depois)
└── docs/             # Documentação
```

## Fases de Desenvolvimento

- **Semana 1:** Setup + Auth ✓
- **Semana 2:** POS + Contabilidade
- **Semana 3:** CRM + Projetos
- **Semana 4:** RH + Compliance
- **Semana 5:** SyncEngine + Deploy

## License

MIT

---

**Status:** Em desenvolvimento 🚧
**Maintenance:** Atualizar conforme novas versões
EOF
