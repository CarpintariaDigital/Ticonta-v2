# 🚀 TiConta v2 — Quick Reference (Copiar/Colar Prompts)

## 📋 Index Rápido
- [Setup Inicial](#setup-inicial)
- [Semana 1: Core](#semana-1-core)
- [Semana 2: Auth](#semana-2-auth)
- [Semana 3+: Módulos](#semana-3-módulos)
- [Fase 4+: Compliance & Deployment](#fase-4-compliance--deployment)
- [Workflow Diário](#-workflow-diário)
- [Timeline Estimado](#-timeline-estimado)

---

## Setup Inicial

```bash
# Terminal
mkdir ticonta-v2 && cd ticonta-v2
git init

# Backend
mkdir backend frontend
cd backend
python3 -m venv venv
source venv/bin/activate
mkdir -p app/core app/models app/schemas app/services app/routes app/tests

# Frontend
cd ../frontend
npx create-next-app@latest . --typescript --tailwind

# Voltar
cd ..
```

---

## Semana 1: Core

### 1.1️⃣ Backend Setup

**Arquivo:** `backend/main.py`

```markdown
Criar a estrutura base do FastAPI para TiConta v2 com:

1. main.py com:
   - FastAPI app setup
   - Middleware (CORS, TrustedHost, Logging, Rate Limit)
   - Health check endpoint
   - Global error handlers

2. app/core/config.py com:
   - Pydantic Settings com Env variables
   - Database URL, SECRET_KEY, JWT config
   - Environment (dev, staging, prod)

3. app/core/database.py com:
   - SQLAlchemy engine setup
   - Session maker
   - Base model para ORM
   - get_db dependency FastAPI

4. app/core/security.py com:
   - hash_password() bcrypt
   - verify_password()
   - create_access_token() 15min
   - create_refresh_token() 7dias
   - verify_token()
   - get_current_user() dependency
   - HTTPBearer scheme

5. requirements.txt com:
   - fastapi==0.104.1
   - uvicorn[standard]==0.24.0
   - sqlalchemy==2.0.23
   - pydantic==2.5.0
   - pydantic-settings==2.1.0
   - python-multipart==0.0.6
   - pyJWT==2.8.1
   - bcrypt==4.1.1
   - python-dotenv==1.0.0
   - alembic==1.13.0
   - structlog==24.1.0
   - pytest==7.4.3
   - pytest-asyncio==0.21.1
   - httpx==0.25.2

Stack: Python 3.11+, PostgreSQL 15+, Alembic, Pytest, Uvicorn, Structlog

Estrutura:
backend/
├── main.py
├── requirements.txt
├── .env.example
├── app/core/
│   ├── config.py
│   ├── database.py
│   └── security.py

Output:
- main.py, config.py, database.py, security.py
- requirements.txt
- .env.example

Não incluir: Routes específicas, Models, Business logic
```

---

### 1.2️⃣ Frontend Setup

**Arquivo:** `frontend/package.json`

```markdown
Criar estrutura inicial Next.js 14 para TiConta v2:

1. package.json com:
   - next@14.0.0
   - react@18.2.0
   - tailwindcss@3.4.0
   - shadcn-ui setup
   - zustand
   - dexie
   - react-hook-form
   - zod
   - @tanstack/react-query
   - recharts
   - lucide-react
   - next-pwa

2. Estrutura:
   - src/app (App Router)
   - src/components/ui (shadcn)
   - src/services
   - src/hooks
   - src/store
   - src/types
   - src/lib
   - public/

3. Configurar:
   - next.config.js
   - tailwind.config.js
   - postcss.config.js
   - tsconfig.json
   - .env.example

4. Layout base:
   - RootLayout com Providers
   - Global styles
   - Tailwind dark mode por defecto
   - PWA manifest

Stack: Next.js 14, TypeScript, Tailwind, shadcn/ui, Zustand, Dexie, React Hook Form + Zod, TanStack Query

Output:
- package.json
- Estrutura de pastas
- Arquivos de config
- RootLayout com Providers
- Exemplos componentes shadcn

Não incluir: Lógica de módulos, Componentes de negócio, SyncEngine
```

---

### 1.3️⃣ Database Schema

**Arquivo:** `backend/migrations/versions/0001_initial_schema.py`

```markdown
Criar migration Alembic (0001_initial_schema.py) com tabelas:

1. users (id PK, username unique, email unique, pin_hash, role, is_active, timestamps)
2. companies (id PK, name, nuit unique, email, phone, address, city, province, logo_url, currency, timestamps)
3. customers (id PK, company_id FK, name, nuit, email, phone, address, city, debt_amount, total_spent, timestamps)
4. products (id PK, company_id FK, name, sku unique, description, category, unit_price, cost_price, quantity, iva_rate, active, timestamps)
5. sales (id PK, company_id FK, customer_id FK nullable, user_id FK, invoice_number unique, total_amount, tax_amount, discount_amount, net_amount, payment_method, payment_status, sale_date, timestamps)
6. sale_items (id PK, sale_id FK, product_id FK, quantity, unit_price, tax_rate, created_at)
7. accounts (id PK, company_id FK, account_code unique, account_name, account_type, is_header, parent_id FK self, debit_balance, credit_balance, timestamps)
8. journal_entries (id PK, company_id FK, entry_date, entry_number unique, debit_account_id FK, credit_account_id FK, amount, description, reference_type, reference_id, created_by_id FK, created_at)
9. audit_log (id PK, company_id FK, user_id FK, action, entity, entity_id, old_value JSON, new_value JSON, ip_address, user_agent, timestamp)
10. projects (id PK, company_id FK, name, status, budget, actual_cost, start_date, end_date, timestamps)
11. employees (id PK, company_id FK, first_name, last_name, email, phone, nuit, position, salary, start_date, timestamps)

Índices:
- sales(company_id, sale_date)
- journal_entries(company_id, entry_date)
- audit_log(company_id, timestamp)
- customers(company_id)
- products(company_id)

Output:
- Migration file 0001_initial_schema.py
- Todas tabelas com relationships
- Índices otimizados
- Constraints (PK, FK, unique)

Stack: SQLAlchemy ORM, Alembic, PostgreSQL 15+
```

---

### 1.4️⃣ Validação do Ambiente

```bash
cd backend
pip install -r requirements.txt
python main.py
# API disponível em http://localhost:8000

# Novo terminal
cd frontend
npm install
npm run dev
# Interface disponível em http://localhost:3000
```

---

## Semana 2: Auth

### 2.1️⃣ Backend Auth

**Arquivos:** `backend/app/models/user.py`, `services/auth.py`, `routes/auth.py`, `schemas/user.py`

```markdown
Implementar sistema de autenticação completo:

Arquivos:

1. models/user.py
   - User ORM model com relationships (sales, journal_entries, audit_logs)
   - Methods: is_admin(), has_role(role)

2. schemas/user.py
   - UserCreate (username, pin, role)
   - UserLogin (username, pin)
   - UserResponse (id, username, role, created_at)
   - TokenResponse (access_token, refresh_token, expires_in)

3. services/auth.py
   - AuthService class:
     - register_user(username, pin, role)
     - authenticate_user(username, pin)
     - create_tokens(user_id, username, roles)
     - refresh_access_token(refresh_token)
     - get_user_by_username(username)

4. routes/auth.py
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - POST /api/v1/auth/refresh
   - GET /api/v1/auth/me (require_role)

Auth Flow:
- User login com username + PIN
- PIN hasheado com bcrypt, comparado
- Se válido: access token (15min) + refresh token (7dias)
- Access token tem: user_id, username, roles, exp
- Cada request valida access token
- Se expirado: frontend usa refresh token

Security:
- PIN nunca armazenado em texto
- Tokens assinados HS256
- Rate limit login (5 tentativas / 15min)
- Log tentativas falhadas

Testing (test_auth.py):
- Register, Login correto/errado, Token refresh, Token expirado

Output:
- models/user.py
- schemas/user.py
- services/auth.py
- routes/auth.py
- tests/test_auth.py
- Updated security.py

Stack: PyJWT, Bcrypt, Pydantic, SQLAlchemy, Pytest
```

---

### 2.2️⃣ Frontend Auth

**Arquivos:** `frontend/src/app/(auth)/`, `services/auth.ts`, `hooks/useAuth.ts`, `store/auth.store.ts`

```markdown
Implementar autenticação frontend:

1. app/(auth)/login/page.tsx
   - Form username + PIN
   - Validação Zod
   - Submit para /api/auth/login
   - Guardar tokens (localStorage/cookie)
   - Redirecionar /dashboard

2. app/(auth)/register/page.tsx
   - Form registo
   - Validações
   - Submit para /api/auth/register

3. services/auth.ts
   - login(username, pin)
   - register(username, pin)
   - logout()
   - refreshToken()

4. store/auth.store.ts (Zustand)
   - State: user, isAuthenticated, loading
   - Actions: login(), logout(), setUser()

5. hooks/useAuth.ts
   - useAuth() hook
   - Returns: user, isLoading, error, login(), logout()

6. middleware.ts
   - Proteger rotas /dashboard
   - Verificar token validade
   - Redirecionar se não autenticado

7. app/api/auth/route.ts
   - POST /api/auth/login (proxy backend)
   - POST /api/auth/register
   - POST /api/auth/refresh

Componentes:
- LoginForm.tsx (TextField username, PasswordField PIN, Submit button)
- ProtectedRoute.tsx (Wrapper rotas privadas)
- AuthProvider.tsx (Context + axios interceptors)

Security:
- Tokens em HttpOnly cookies (ou localStorage + CSRF)
- Auto-logout se token expirado
- Interceptar 401 responses

Output:
- app/(auth)/ pages
- services/auth.ts
- hooks/useAuth.ts
- store/auth.store.ts
- middleware.ts
- API routes
- Componentes UI

Stack: Next.js middleware, Zustand, Axios, Zod, React Hook Form
```

---

## Semana 3+: Módulos

### 3.1️⃣ Backend POS & 3.2️⃣ Frontend POS
* Implementação do Ponto de Venda, leitor de código de barras, pagamentos multicanal (Dinheiro, M-Pesa, Cartão), emissão de faturas e recibos térmicos ESC/POS.

### 3.3️⃣ Backend Contabilidade & 3.4️⃣ Frontend Contabilidade
* Implementação do Plano Geral de Contas (PGC-NIRF), lançamentos por partida dobrada, Balancete de Verificação, DRE e Balanço Patrimonial.

---

## Fase 4+: Compliance & Deployment

Prompts e configurações implementadas no TiConta v2:
- **Compliance Fiscal:** IVA (16%), IRPS/IRT, INSS (3% + 4%) e PITA (Moçambique).
- **Certificação & Faturação:** E-Invoice / Certificação de software fiscal.
- **Auditoria:** Trilha de auditoria completa em conformidade com ISO 27001.
- **SyncEngine:** Motor Offline-First com IndexedDB (Dexie.js) e sincronização assíncrona.
- **Infraestrutura:** Docker Compose, Nginx Reverse Proxy, Let's Encrypt SSL e CI/CD GitHub Actions.

---

## 🔄 Workflow Diário

1. **Selecionar módulo/funcionalidade:** Consulte o roteiro e especificações da API.
2. **Implementar alterações:** Seguir as normas de estilo (Black no backend, Prettier/ESLint no frontend).
3. **Executar testes automatizados:**
   ```bash
   # Backend
   cd backend && ./venv/bin/pytest -v
   # Frontend
   cd frontend && npm run test
   ```
4. **Commit convencional:**
   ```bash
   git commit -m "feat(modulo): descricao da funcionalidade"
   ```

---

## 📊 Timeline & Roadmap

- **Semana 1:** Setup + Database Schema
- **Semana 2:** Autenticação JWT + Gestão de Permissões
- **Semana 3:** Ponto de Venda (POS) + Gestão de Estoque
- **Semana 4:** Contabilidade PGC-NIRF + Balancetes
- **Semana 5:** CRM + Projetos e Obras
- **Semana 6:** Recursos Humanos (INSS) + Relatórios
- **Semana 7:** Compliance Fiscal + Auditoria
- **Semana 8:** SyncEngine (Modo Offline)
- **Semana 9:** Docker + Produção e Licenciamento Criptográfico

---

**Versão:** 2.0 (Agosto 2026)  
**Propriedade:** Carpintaria Digital — Maputo, Moçambique
