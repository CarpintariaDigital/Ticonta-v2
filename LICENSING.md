# 🔑 Sistema de Licenciamento Criptográfico — TiConta v2

O **TiConta v2** utiliza uma arquitetura de licenciamento criptográfico offline baseada em assinaturas digitais **HMAC-SHA256**. O sistema permite ativação e validação offline (sem necessidade de conexão contínua com a internet), impedindo a adulteração de datas de expiração, planos e módulos contratados.

---

## 🏗️ Como Funciona o Licenciamento

O fluxo de licenciamento foi desenhado para garantir total autonomia às empresas em Moçambique, mesmo em zonas com conectividade instável:

```
+-----------------------------------------------------------------------------------+
| 1. ADMINISTRAÇÃO CARPINTARIA DIGITAL (EMISSÃO)                                   |
|    Dados da Empresa + Plano + Validade  ───► HMAC-SHA256(MasterKey)              |
|                                         └───► Chave: TIC-CUST123-COMP-261231-A9F3  |
+-----------------------------------------------------------------------------------+
                                          │
                                          │ (Entrega ao Cliente via WhatsApp / Email)
                                          ▼
+-----------------------------------------------------------------------------------+
| 2. INSTÂNCIA LOCAL TICONTA V2 DO CLIENTE (ATIVAÇÃO)                               |
|    - Cliente insere a chave na interface de Definições                            |
|    - Endpoint: POST /api/v1/licensing/activate-license                             |
|    - O backend valida a assinatura HMAC e desbloqueia os módulos do plano          |
+-----------------------------------------------------------------------------------+
                                          │
                                          │ (Operação Diária Offline)
                                          ▼
+-----------------------------------------------------------------------------------+
| 3. VALIDAÇÃO CONTÍNUA OFFLINE                                                     |
|    - O sistema valida a integridade da chave a cada inicialização e transação     |
|    - Exibe contagem decrescente (ex: "Faltam 15 dias para expirar a licença")     |
|    - Quando expirada: Permite consulta e exportação de dados, bloqueia novas vendas|
+-----------------------------------------------------------------------------------+
```

---

## 📦 Planos & Preços (MZN)

Todos os planos incluem suporte para moeda nacional (**Metical - MZN**), conformidade fiscal PGC-NIRF e funcionamento offline.

| Plano | Preço Mensal | Preço Anual (10% Desconto) | Módulos & Recursos Incluídos |
| :--- | :--- | :--- | :--- |
| **BÁSICO** | **500 MT** | 5.400 MT | • Ponto de Venda (POS)<br>• Gestão de Estoque e Produtos<br>• Gestão de Clientes e Fornecedores<br>• Operação Offline e Impressão Térmica |
| **PROFESSIONAL** | **1.500 MT** | 16.200 MT | • Todos os recursos do plano **Básico**<br>• Contabilidade PGC-NIRF Completa<br>• Lançamentos em Partida Dobrada & Balancetes<br>• CRM Comercial e Funil de Vendas<br>• Gestão de Despesas e Tesouraria |
| **COMPLETO** | **3.500 MT** | 37.800 MT | • Todos os recursos do plano **Professional**<br>• Gestão de Obras, Projetos e Tarefas<br>• Recursos Humanos & Folha Salarial com INSS<br>• Disparo de Faturas por WhatsApp e SMS<br>• Leitor de Código de Barras Avançado |
| **ENTERPRISE** | **Personalizado** | Sob Consulta | • Todos os recursos do plano **Completo**<br>• Multi-filiais e multi-armazéns ilimitados<br>• Base de dados dedicada ou On-Premise<br>• SLA de Suporte 24/7 com formação presencial |

---

## 🛠️ Estrutura da Chave de Licença

As chaves de licença seguem o formato padronizado:
```
TIC-<CUSTOMER_ID>-<PLAN_CODE>-<EXPIRY_YYMMDD>-<SIGNATURE_HEX>
```

* **Exemplo:** `TIC-CUST4001-COMP-261231-8E4B02F1A9`
  * `TIC`: Prefixo identificador do TiConta ERP.
  * `CUST4001`: Identificador do cliente/empresa.
  * `COMP`: Código do plano (`BAS` = Básico, `PRO` = Professional, `COMP` = Completo, `ENT` = Enterprise).
  * `261231`: Data de validade (31 de Dezembro de 2026).
  * `8E4B02F1A9`: Assinatura criptográfica calculada com `LICENSE_MASTER_KEY`.

---

## 💻 Geração de Chaves de Licença (Administrador)

### 1. Script Python de Emissão
Pode utilizar o utilitário interno em `scripts/generate_license.py`:

```python
import hmac
import hashlib
from datetime import datetime, timedelta

MASTER_KEY = "sua-chave-mestra-secreta-min-32-chars"

def generate_license(customer_id: str, plan: str, days: int = 365) -> str:
    plan_codes = {"basico": "BAS", "professional": "PRO", "completo": "COMP", "enterprise": "ENT"}
    code = plan_codes.get(plan.lower(), "BAS")
    
    expiry_date = (datetime.utcnow() + timedelta(days=days)).strftime("%y%m%d")
    payload = f"{customer_id.upper()}-{code}-{expiry_date}"
    
    signature = hmac.new(
        MASTER_KEY.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()[:10].upper()
    
    license_key = f"TIC-{payload}-{signature}"
    return license_key

# Exemplo de emissão:
chave = generate_license(customer_id="MZ400123", plan="completo", days=365)
print("Chave gerada:", chave)
```

### 2. Chamada via API REST (Admin)
`POST /api/v1/licensing/generate-key` (Requer Bearer Token com role `admin`):

```bash
curl -X POST "http://localhost:8000/api/v1/licensing/generate-key" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Construtora Maputo Lda",
    "plan": "completo",
    "days": 365
  }'
```

**Resposta de Sucesso (201 Created):**
```json
{
  "license_key": "TIC-CUST-MZ01-COMP-270815-9E2F1A8C03",
  "customer_id": "CUST-MZ01",
  "customer_name": "Construtora Maputo Lda",
  "plan": "completo",
  "modules": ["pos", "inventory", "crm", "accounting", "projects", "hr", "premium"],
  "issued_at": "2026-08-16T00:00:00Z",
  "expires_at": "2027-08-16T00:00:00Z",
  "price_mzn": "42000.00"
}
```

---

## 🎯 Ativação & Gestão da Licença pelo Cliente

### 1. Primeira Ativação
1. Aceda ao ERP em `http://localhost:3000`.
2. Navegue até **Definições > Licenciamento**.
3. Insira a chave fornecida pela Carpintaria Digital e clique em **"Ativar Licença"**.
4. O sistema valida os módulos e desbloqueia os menus imediatamente sem reiniciar.

### 2. Alteração de Plano (Upgrade / Downgrade)
Para efetuar upgrade (por exemplo, de *Básico* para *Completo*), solicite uma nova chave à equipa de suporte. Ao inserir a nova chave no mesmo ecrã de Definições, os novos módulos tornam-se imediatamente operacionais.

### 3. Renovação de Licença
Antes da expiração (o sistema avisa com 15, 7 e 3 dias de antecedência), solicite a renovação. A inserção da nova chave prolonga o prazo sem perda de dados históricos ou parametrizações fiscais.

---

## 🔌 Referência de Endpoints de Licenciamento

| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/licensing/validate-key` | **Público** | Valida sintaxe e validade de uma chave sem necessidade de login. |
| `POST` | `/api/v1/licensing/activate-license` | **Autenticado** | Aplica e vincula a licença à empresa ativa no ERP. |
| `GET` | `/api/v1/licensing/status` | **Autenticado** | Retorna o plano atual, módulos ativos e dias restantes. |
| `POST` | `/api/v1/licensing/generate-key` | **Admin** | Emite uma nova chave assinada digitalmente. |
| `GET` | `/api/v1/licensing/admin/licenses` | **Admin** | Lista todas as licenças emitidas e estados de vigência. |
| `PUT` | `/api/v1/licensing/admin/licenses/{id}/renew` | **Admin** | Estende o prazo de validade de uma licença registada. |
| `GET` | `/api/v1/licensing/admin/stats` | **Admin** | Métricas globais de faturamento e licenças ativas. |

---

## ❓ Perguntas Frequentes (FAQ)

### O que acontece se a internet cair durante o uso?
O TiConta v2 não necessita de internet para validar a licença. A verificação criptográfica é calculada localmente no próprio servidor da sua empresa.

### O que acontece quando a licença expira?
O sistema entra em **Modo Somente Leitura**:
- É possível consultar todas as faturas anteriores, relatórios contábeis, balanços e cadastros de clientes.
- É possível exportar os dados em PDF e Excel.
- Apenas a emissão de novas vendas e novos lançamentos contábeis fica suspensa até à inserção de uma chave de renovação válida.

### É seguro alterar a data do relógio do computador para burlar a licença?
Não. O TiConta v2 armazena carimbos de auditoria monotónicos em cada transação. Caso seja detetada uma regressão cronológica no relógio do sistema, o motor de auditoria sinaliza o bloqueio de segurança.
