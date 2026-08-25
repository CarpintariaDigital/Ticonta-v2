# 🇲🇿 TiConta API — Cloudflare Worker (D1 + KV + R2)

Backend serverless de alta performance para o **TiConta ERP Moçambique**, executado no edge da Cloudflare com **D1** (SQLite Relacional), **KV** (Sessões e Cache) e **R2** (Armazenamento de Faturas PDF).

---

## 🚀 Como Inicializar e Testar Localmente

### 1. Pré-requisitos
Certifique-se de ter o Node.js 18+ instalado.

### 2. Inicializar a Base de Dados D1 Local
Execute o script D1 local para criar as tabelas:
```bash
npx wrangler d1 execute ticonta-db --local --file=./src/schema.sql
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npx wrangler dev
```
O Worker estará acessível em `http://localhost:8787` (ou porta indicada no terminal).

---

## 🌐 Deploy em Produção (Cloudflare)

### 1. Criar Recursos no Cloudflare
```bash
# Criar Base de Dados D1
npx wrangler d1 create ticonta-db

# Criar Namespace KV para Sessões
npx wrangler kv:namespace create SESSIONS

# Criar Bucket R2 para Faturas
npx wrangler r2 bucket create ticonta-storage
```

### 2. Atualizar o `wrangler.toml`
Copie os IDs gerados para o ficheiro `wrangler.toml`.

### 3. Aplicar o Schema D1 em Produção
```bash
npx wrangler d1 execute ticonta-db --remote --file=./src/schema.sql
```

### 4. Fazer Deploy
```bash
npx wrangler deploy
```

---

## 📋 Endpoints Disponíveis

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Estado do servidor e conformidade fiscal | Não |
| `POST` | `/api/auth/login` | Autenticação de utilizador e emissão de JWT | Não |
| `POST` | `/api/auth/logout` | Invalidação de sessão no KV | Sim |
| `GET` | `/api/produtos` | Lista de produtos do utilizador | Sim |
| `POST` | `/api/produtos` | Criação de novo produto | Sim |
| `GET` | `/api/clientes` | Lista de clientes | Sim |
| `POST` | `/api/clientes` | Criação de cliente com validação de NUIT (9 dígitos) | Sim |
| `GET` | `/api/vendas` | Histórico de vendas com filtros | Sim |
| `POST` | `/api/vendas` | Registo de venda, baixa de stock e gestão de fiado | Sim |
| `POST` | `/api/fiscal/iva` | Cálculo de IVA (16%), IRPS e INSS de Moçambique | Sim |
| `POST` | `/api/licencas` | Emissão de chaves HMAC-SHA256 offline | Sim |

---

## 🇲🇿 Conformidade Fiscal
- **CIVA (IVA 16%)**: Cálculo direto e dedutível.
- **IRPS / IRT**: Escalões de 2026 de Moçambique.
- **INSS**: 3% trabalhador + 4% patronal (Total 7%).
- **NUIT**: Validação estrita de 9 dígitos.
