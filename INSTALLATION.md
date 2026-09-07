# 🛠️ Guia de Instalação do TiConta v2

Este documento apresenta três métodos para instalar e colocar em funcionamento o **TiConta v2 ERP**:
1. **[Opção 1: Instalador Desktop Tudo-em-Um (Recomendado para Usuários Finais)](#opção-1-instalador-desktop-tudo-em-um)**
2. **[Opção 2: Docker Compose (Recomendado para Servidores e Testes Rápidos)](#opção-2-docker-compose-em-5-minutos)**
3. **[Opção 3: Instalação Manual (Para Desenvolvedores)](#opção-3-instalação-manual-desenvolvedores)**

---

## Opção 1: Instalador Desktop Tudo-em-Um

Ideal para computadores de caixa, balcão e escritórios sem conhecimentos técnicos. O instalador configura automaticamente a base de dados SQLite local, o motor FastAPI e a interface gráfica.

### 1. Download do Pacote
Aceda à página oficial de lançamentos e transfira o pacote correspondente ao seu sistema operativo:

* 🪟 **Windows 10 / 11 (64-bit):** [TiConta-v2-Setup-x64.exe](https://github.com/carpintaria-digital/ticonta-v2/releases/latest/download/TiConta-v2-Setup-x64.exe)
* 🍏 **macOS (Apple Silicon & Intel):** [TiConta-v2.dmg](https://github.com/carpintaria-digital/ticonta-v2/releases/latest/download/TiConta-v2.dmg)
* 🐧 **Linux (.deb / AppImage):** [ticonta-v2-linux-x86_64.AppImage](https://github.com/carpintaria-digital/ticonta-v2/releases/latest/download/ticonta-v2-linux-x86_64.AppImage)

### 2. Passos de Instalação

#### No Windows:
1. Dê duplo clique sobre `TiConta-v2-Setup-x64.exe`.
2. Caso surja o aviso do Windows SmartScreen, clique em **"Mais informações"** e de seguida em **"Executar de qualquer modo"**.
3. Siga o assistente de instalação clicando em **Seguinte** e selecione a pasta de destino (padrão: `C:\Program Files\TiConta v2`).
4. Marque a opção **"Criar ícone no Ambiente de Trabalho"** e clique em **Instalar**.
5. Concluída a instalação, clique em **Concluir** para iniciar o TiConta v2.

#### No macOS:
1. Abra o ficheiro `TiConta-v2.dmg`.
2. Arraste o ícone do **TiConta v2** para a pasta **Aplicações** (`Applications`).
3. Ao abrir pela primeira vez, se solicitado, autorize em *Definições do Sistema > Privacidade e Segurança*.

#### No Linux:
```bash
chmod +x ticonta-v2-linux-x86_64.AppImage
./ticonta-v2-linux-x86_64.AppImage
```

### 3. Verificação
Abra o seu navegador web ou a janela do aplicativo em:
👉 **`http://localhost:3000`**

Deverá visualizar o ecrã de boas-vindas do TiConta v2 pronto para criar a primeira conta de administrador ou iniciar sessão.

---

## Opção 2: Docker Compose (Em 5 Minutos)

Ideal para servidores locais (LAN), servidores em nuvem (VPS) ou avaliações completas em ambiente isolado.

### Pré-requisitos
- [Docker Engine](https://docs.docker.com/engine/install/) (v24.0 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20 ou superior)
- Git instalado

### Passo a Passo

```bash
# 1. Clonar o repositório oficial
git clone https://github.com/carpintaria-digital/ticonta-v2.git
cd ticonta-v2

# 2. Criar o ficheiro de configuração .env a partir do modelo
cp .env.example .env

# (Opcional) Edite as variáveis com o seu editor de preferência:
# nano .env

# 3. Construir e inicializar todos os contentores em segundo plano (-d)
docker-compose up -d --build

# 4. Executar as migrações automáticas da base de dados PostgreSQL
docker-compose exec backend alembic upgrade head

# 5. Verificar o estado dos contentores
docker-compose ps
```

### Acessos do Sistema
- 🖥️ **Interface Web (Frontend):** [http://localhost:3000](http://localhost:3000)
- 🔌 **API REST (Backend Docs Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **Base de Dados PostgreSQL:** Porta `5432` (`localhost:5432`)

---

## Opção 3: Instalação Manual (Desenvolvedores)

Ideal para programadores que pretendem contribuir ou personalizar o código-fonte.

### Pré-requisitos
- **Python 3.11+** com `pip` e `virtualenv`
- **Node.js 18+** ou **Node.js 20 LTS** com `npm`
- **PostgreSQL 15+** ou **SQLite** (já integrado no Python)

---

### Configuração do Backend (FastAPI)

```bash
# 1. Navegar para a pasta do backend
cd backend

# 2. Criar e ativar o ambiente virtual Python
python3 -m venv venv

# No Linux / macOS:
source venv/bin/activate

# No Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# 3. Atualizar o pip e instalar as dependências
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-test.txt

# 4. Configurar as variáveis de ambiente
cp .env.example .env

# 5. Executar as migrações do Alembic para criar as tabelas
alembic upgrade head

# 6. Iniciar o servidor de desenvolvimento FastAPI com Hot-Reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### Configuração do Frontend (Next.js 14)

Abra um novo terminal:

```bash
# 1. Navegar para a pasta do frontend
cd frontend

# 2. Instalar as dependências do projeto
npm install

# 3. Iniciar o servidor de desenvolvimento Next.js
npm run dev
```

Abra o seu navegador em [http://localhost:3000](http://localhost:3000).

---

## Ficheiro de Configuração `.env`

O ficheiro `.env` centraliza todas as definições operacionais da aplicação:

```ini
# ==============================================================================
# FASTAPI & CORE
# ==============================================================================
DEBUG=True
ENVIRONMENT=development
SECRET_KEY=change-me-in-production-min-32-chars-secret-key-ticonta
ALGORITHM=HS256
LOG_LEVEL=INFO
BACKEND_PORT=8000
FRONTEND_PORT=3000

# ==============================================================================
# BASE DE DADOS
# ==============================================================================
# Para PostgreSQL:
DATABASE_URL=postgresql://ticonta_user:ticonta_password@localhost:5432/ticonta_v2

# Para SQLite local:
# DATABASE_URL=sqlite:///./ticonta.db

# ==============================================================================
# SEGURANÇA & TOKENS JWT
# ==============================================================================
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ==============================================================================
# COMPLIANCE FISCAL MOÇAMBIQUE
# ==============================================================================
COMPANY_NAME=Empresa Demonstração Lda
COMPANY_NUIT=400123456
DEFAULT_CURRENCY=MZN
STANDARD_VAT_RATE=16.0

# ==============================================================================
# SISTEMA DE LICENCIAMENTO (HMAC-SHA256)
# ==============================================================================
LICENSE_MASTER_KEY=change-me-in-production-min-32-chars-master-key
LICENSE_COMPANY_ID=TIC-MZ-001

# ==============================================================================
# INTEGRAÇÕES PREMIUM (WHATSAPP & SMS)
# ==============================================================================
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_SMS_NUMBER=+15005550006

# ==============================================================================
# SERVIÇO DE E-MAIL (SMTP)
# ==============================================================================
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 🔍 Resolução de Problemas (Troubleshooting)

### 1. Porta já em uso (`Port already in use`)
* **Sintoma:** Erro `Address already in use: 8000` ou `Port 3000 is in use`.
* **Solução:**
  * No Linux/macOS: Encontre o processo ocupando a porta com `lsof -i :8000` ou `lsof -i :3000` e encerre-o com `kill -9 <PID>`.
  * No Windows: Execute `netstat -ano | findstr :8000` e finalize a tarefa pelo Gestor de Tarefas.
  * Em alternativa, configure outra porta no ficheiro `.env` (ex: `BACKEND_PORT=8001`).

### 2. Falha de ligação à Base de Dados (`Database connection failed`)
* **Sintoma:** Erro `psycopg2.OperationalError: could not connect to server: Connection refused`.
* **Solução:**
  * Certifique-se de que o serviço PostgreSQL está ativo: `sudo systemctl status postgresql` ou `docker-compose ps db`.
  * Valide se o utilizador, senha e nome da base de dados no ficheiro `.env` coincidem com a base criada.
  * Para desenvolvimento rápido sem configurar PostgreSQL, utilize SQLite mudando a linha no `.env`:  
    `DATABASE_URL=sqlite:///./ticonta.db`.

### 3. Módulo não encontrado / Dependências em falta (`Cannot find module`)
* **Backend:** Certifique-se de que o ambiente virtual está ativo (`(venv)`) e execute `pip install -r requirements.txt`.
* **Frontend:** Apague a pasta `node_modules` e reinstale com `rm -rf node_modules package-lock.json && npm install`.

### 4. Erros de Certificado SSL em Desenvolvimento
* **Sintoma:** O navegador recusa chamadas HTTP a partir de contextos HTTPS ou alerta de certificado auto-assinado.
* **Solução:** Em ambiente local de desenvolvimento, utilize sempre `http://localhost:3000` e `http://localhost:8000`. Em ambiente de produção, configure o Let's Encrypt / Certbot conforme demonstrado em [DEPLOY.md](./DEPLOY.md).
