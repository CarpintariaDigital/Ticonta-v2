# 🔌 Referência Completa da API REST — TiConta v2

A API REST do **TiConta v2** foi desenvolvida com o framework **FastAPI**, oferecendo alta performance, validação rigorosa de esquemas via **Pydantic v2** e documentação interativa OpenAPI/Swagger.

---

## 🌐 Informações Gerais & Base URL

* **Ambiente de Desenvolvimento:** `http://localhost:8000`
* **Documentação Interativa (Swagger UI):** `http://localhost:8000/docs`
* **Especificação OpenAPI JSON:** `http://localhost:8000/openapi.json`
* **Formato de Dados:** `application/json` (Encoding: `UTF-8`)
* **Tratamento de Datas:** Padrão ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)

---

## 🔐 Autenticação & Autorização

O TiConta v2 utiliza **JSON Web Tokens (JWT)** para autenticação em rotas protegidas.  
Para aceder aos endpoints privados, envie o cabeçalho HTTP:

```http
Authorization: Bearer <SEU_ACCESS_TOKEN>
```

### Papéis de Acesso (RBAC):
* `admin`: Acesso irrestrito a todos os endpoints, auditoria e licenciamento.
* `manager`: Gestão comercial, cancelamentos, CRM e aprovação de custos.
* `accountant`: Diário de lançamentos, balancetes e fechos fiscais.
* `cashier`: Operação do terminal POS e emissão de faturas.

---

## 1. Módulo de Autenticação (`/api/v1/auth`)

### 1.1 Iniciar Sessão / Obter Token
* **Método:** `POST`
* **Caminho:** `/api/v1/auth/login`
* **Acesso:** Público (com Rate Limiting de 5 tentativas por 15 min por IP)
* **Status:** `200 OK` / `401 Unauthorized` / `429 Too Many Requests`

#### Corpo da Requisição:
```json
{
  "username": "admin",
  "pin": "1234"
}
```

#### Resposta de Exemplo:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "email": "admin@ticonta.co.mz"
  }
}
```

---

### 1.2 Renovar Access Token
* **Método:** `POST`
* **Caminho:** `/api/v1/auth/refresh`
* **Acesso:** Público
* **Status:** `200 OK` / `401 Unauthorized`

#### Corpo da Requisição:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 Obter Perfil do Utilizador Autenticado
* **Método:** `GET`
* **Caminho:** `/api/v1/auth/me`
* **Acesso:** Autenticado (Bearer)
* **Status:** `200 OK`

---

## 2. Módulo de Vendas & POS (`/api/v1/sales`)

### 2.1 Registar Nova Venda / Emitir Fatura
* **Método:** `POST`
* **Caminho:** `/api/v1/sales`
* **Acesso:** Autenticado
* **Status:** `201 Created` / `400 Bad Request`

#### Corpo da Requisição:
```json
{
  "company_id": 1,
  "customer_id": 10,
  "payment_method": "cash",
  "notes": "Venda balcão",
  "items": [
    {
      "product_id": 1,
      "product_name": "Refrigerante 500ml",
      "quantity": 2.0,
      "unit_price": "50.00",
      "tax_rate": "16.0"
    },
    {
      "product_id": 2,
      "product_name": "Pão de Forma",
      "quantity": 1.0,
      "unit_price": "80.00",
      "tax_rate": "16.0"
    }
  ]
}
```

#### Resposta de Exemplo:
```json
{
  "id": 105,
  "invoice_number": "FT 2026/00105",
  "company_id": 1,
  "customer_id": 10,
  "total_amount": "180.00",
  "tax_amount": "28.80",
  "discount_amount": "0.00",
  "net_amount": "208.80",
  "payment_method": "cash",
  "payment_status": "paid",
  "sale_date": "2026-08-16T10:30:00Z",
  "items": [
    {
      "id": 210,
      "product_id": 1,
      "quantity": 2.0,
      "unit_price": "50.00",
      "tax_rate": "16.0",
      "subtotal": "100.00"
    }
  ]
}
```

---

### 2.2 Listar Vendas com Filtros
* **Método:** `GET`
* **Caminho:** `/api/v1/sales?skip=0&limit=50&payment_method=cash`
* **Acesso:** Autenticado
* **Status:** `200 OK`

---

### 2.3 Resumo de Receita Diária
* **Método:** `GET`
* **Caminho:** `/api/v1/sales/today/total?company_id=1`
* **Acesso:** Autenticado
* **Status:** `200 OK`

---

### 2.4 Gerar Texto de Impressão Térmica ESC/POS
* **Método:** `POST`
* **Caminho:** `/api/v1/sales/{sale_id}/print`
* **Acesso:** Autenticado
* **Status:** `200 OK` (Media type: `text/plain; charset=utf-8`)

---

## 3. Módulo de CRM & Funil Comercial (`/api/v1/crm`)

### 3.1 Listar Oportunidades / Leads
* **Método:** `GET`
* **Caminho:** `/api/v1/crm/leads?stage=proposal&search=Maputo`
* **Acesso:** Autenticado
* **Status:** `200 OK`

---

### 3.2 Registar Novo Lead
* **Método:** `POST`
* **Caminho:** `/api/v1/crm/leads`
* **Acesso:** Autenticado
* **Status:** `201 Created`

#### Corpo da Requisição:
```json
{
  "company_id": 1,
  "name": "Sociedade Mineira do Norte",
  "contact_name": "Eng. Carlos Silva",
  "email": "carlos.silva@mineramz.com",
  "phone": "+258841234567",
  "stage": "new",
  "estimated_value": "450000.00",
  "source": "Website"
}
```

---

### 3.3 Mover Estágio do Lead no Pipeline
* **Método:** `POST`
* **Caminho:** `/api/v1/crm/leads/{lead_id}/stage`
* **Acesso:** Autenticado
* **Status:** `200 OK`

#### Corpo da Requisição:
```json
{
  "stage": "won",
  "notes": "Contrato assinado após negociação final."
}
```

---

## 4. Módulo de Contabilidade PGC-NIRF (`/api/v1/accounting`)

### 4.1 Obter Plano Geral de Contas
* **Método:** `GET`
* **Caminho:** `/api/v1/accounting/chart-of-accounts?company_id=1`
* **Acesso:** Autenticado
* **Status:** `200 OK`

---

### 4.2 Lançamento Manual no Diário (Partida Dobrada)
* **Método:** `POST`
* **Caminho:** `/api/v1/accounting/journal-entries`
* **Acesso:** Autenticado (Role: `admin` ou `accountant`)
* **Status:** `201 Created`

#### Corpo da Requisição:
```json
{
  "company_id": 1,
  "entry_date": "2026-08-16T00:00:00Z",
  "debit_account_id": 12,
  "credit_account_id": 1,
  "amount": "15000.00",
  "description": "Pagamento de Renda das Instalações - Agosto 2026",
  "reference_type": "expense",
  "reference_id": 45
}
```

---

### 4.3 Balancete de Verificação (Trial Balance)
* **Método:** `GET`
* **Caminho:** `/api/v1/accounting/trial-balance?company_id=1&as_of_date=2026-08-31`
* **Acesso:** Autenticado
* **Status:** `200 OK`

---

### 4.4 Demonstração de Resultados (DRE) & Balanço Patrimonial
* **Método:** `GET`
* **Caminho:** `/api/v1/accounting/income-statement` e `/api/v1/accounting/balance-sheet`
* **Acesso:** Autenticado
* **Status:** `200 OK`

---

## 5. Módulo de Projetos & Obras (`/api/v1/projects`)

### 5.1 Criar Novo Projeto / Obra
* **Método:** `POST`
* **Caminho:** `/api/v1/projects`
* **Acesso:** Autenticado
* **Status:** `201 Created`

#### Corpo da Requisição:
```json
{
  "company_id": 1,
  "name": "Construção de Pavilhão Industrial - Matola",
  "description": "Estrutura metálica e pavimentação de 800m2",
  "budget": "1200000.00",
  "start_date": "2026-09-01",
  "end_date": "2026-12-15"
}
```

---

### 5.2 Adicionar Despesa / Custo ao Projeto
* **Método:** `POST`
* **Caminho:** `/api/v1/projects/{project_id}/expenses`
* **Acesso:** Autenticado
* **Status:** `201 Created`

---

## 6. Recursos Humanos & Salários (`/api/v1/hr`)

### 6.1 Registar Empregado
* **Método:** `POST`
* **Caminho:** `/api/v1/hr/employees`
* **Acesso:** Autenticado
* **Status:** `201 Created`

#### Corpo da Requisição:
```json
{
  "company_id": 1,
  "first_name": "Américo",
  "last_name": "Mabote",
  "email": "americo.mabote@empresa.co.mz",
  "phone": "+258849876543",
  "nuit": "100987654",
  "inss_number": "INSS-789012",
  "position": "Encarregado Geral",
  "department": "Operações",
  "salary": "35000.00",
  "start_date": "2026-01-15"
}
```

---

### 6.2 Processar Folha Salarial do Mês (INSS & IRPS)
* **Método:** `POST`
* **Caminho:** `/api/v1/hr/payroll/generate`
* **Acesso:** Autenticado
* **Status:** `200 OK`

---

## 7. Módulo de Licenciamento (`/api/v1/licensing`)

| Método | Caminho | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/licensing/validate-key` | Nenhuma (Pública) | Valida integridade e prazo de uma chave. |
| `POST` | `/api/v1/licensing/activate-license` | Bearer Token | Associa a chave à empresa ativa. |
| `GET` | `/api/v1/licensing/status` | Bearer Token | Retorna plano, módulos e dias restantes. |
| `POST` | `/api/v1/licensing/generate-key` | Bearer (Admin) | Emite uma nova licença com assinatura HMAC. |
| `GET` | `/api/v1/licensing/admin/licenses` | Bearer (Admin) | Lista todas as licenças emitidas. |
| `PUT` | `/api/v1/licensing/admin/licenses/{id}/renew` | Bearer (Admin) | Estende a validade de uma licença. |
| `GET` | `/api/v1/licensing/admin/stats` | Bearer (Admin) | Estatísticas de faturação global de licenças. |

---

## 8. Módulo de Comunicação & Premium (`/api/v1/document-delivery`)

### 8.1 Disparo de Fatura por WhatsApp
* **Método:** `POST`
* **Caminho:** `/api/v1/document-delivery/send-whatsapp`
* **Acesso:** Autenticado
* **Corpo:**
```json
{
  "sale_id": 105,
  "phone": "+258841234567"
}
```

---

## 9. Códigos de Status HTTP Padronizados

| Código | Significado | Descrição |
| :--- | :--- | :--- |
| `200 OK` | Sucesso | Requisição processada com sucesso. |
| `201 Created` | Criado | Recurso criado com sucesso. |
| `204 No Content` | Sem Conteúdo | Operação executada (ex: exclusão). |
| `400 Bad Request` | Requisição Inválida | Erro de validação de dados nos campos enviados. |
| `401 Unauthorized` | Não Autenticado | Token JWT em falta ou inválido. |
| `403 Forbidden` | Proibido | Utilizador sem permissão suficiente (RBAC). |
| `404 Not Found` | Não Encontrado | Recurso solicitado não existe. |
| `429 Too Many Requests` | Limite Excedido | Rate limit de segurança atingido. |
| `500 Server Error` | Erro Interno | Erro inesperado do servidor. |
