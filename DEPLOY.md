# 🚀 Guia de Deploy em Produção — TiConta v2

Este guia cobre as melhores práticas e procedimentos passo a passo para colocar o **TiConta v2** em produção de forma segura, escalável e com alta disponibilidade.

---

## 📑 Índice
1. [Opção 1: Servidor VPS Ubuntu (Recomendado para Máximo Controlo & Economia)](#opção-1-deploy-em-vps-ubuntu-2204--2404-lts)
2. [Opção 2: Deploy Rápido no Railway.app (5 Minutos)](#opção-2-deploy-no-railwayapp)
3. [Opção 3: Deploy no Render.com](#opção-3-deploy-no-rendercom)
4. [Configuração do Reverse Proxy Nginx](#configuração-do-reverse-proxy-nginx)
5. [Automação de Certificado SSL (Let's Encrypt / Certbot)](#automação-de-certificados-ssl-com-certbot)
6. [Estratégia e Script Automatizado de Backup da Base de Dados](#estratégia-e-automação-de-backups)
7. [Comandos de Monitorização & Logs](#monitorização-e-manutenção)
8. [Resolução de Problemas em Produção](#resolução-de-problemas-em-produção)

---

## Opção 1: Deploy em VPS Ubuntu (22.04 / 24.04 LTS)

### Requisitos Mínimos do Servidor
* **CPU:** 2 vCPU
* **Memória RAM:** 2 GB (4 GB recomendado)
* **Disco:** 25 GB SSD/NVMe
* **Sistema Operativo:** Ubuntu 22.04 LTS ou Ubuntu 24.04 LTS
* **Domínio ou Subdomínio:** ex: `erp.suaempresa.co.mz` e `api.suaempresa.co.mz`

---

### Passo 1: Atualização e Instalação de Pacotes Essenciais

Conecte-se ao seu servidor via SSH:

```bash
ssh root@seu-servidor-ip

# Atualizar repositórios do sistema
sudo apt update && sudo apt upgrade -y

# Instalar utilitários essenciais, Git, Nginx e Certbot
sudo apt install -y git curl ufw nginx certbot python3-certbot-nginx htop
```

### Passo 2: Instalação do Docker e Docker Compose

```bash
# Adicionar chave oficial do Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine e plugins
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Habilitar o Docker para iniciar com o sistema
sudo systemctl enable docker
sudo systemctl start docker
```

### Passo 3: Clonagem do Projeto e Configuração de Produção

```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/ticonta-v2
cd /var/www/ticonta-v2

# Clonar o repositório
sudo git clone https://github.com/carpintaria-digital/ticonta-v2.git .

# Criar o ficheiro de variáveis de ambiente de produção
sudo cp .env.example .env
sudo nano .env
```

> [!IMPORTANT]
> **Configurações Críticas para Produção no `.env`:**
> - Defina `DEBUG=False` e `ENVIRONMENT=production`.
> - Gere um `SECRET_KEY` forte com: `openssl rand -hex 32`.
> - Altere senhas padrão de base de dados (`POSTGRES_PASSWORD`).
> - Configure o `LICENSE_MASTER_KEY` e dados fiscais da empresa (`COMPANY_NUIT`).
> - Configure `NEXT_PUBLIC_API_URL=https://api.suaempresa.co.mz` (ou sub-caminho).

### Passo 4: Inicialização dos Contentores e Migrações

```bash
# Construir imagens e iniciar contentores
sudo docker compose up -d --build

# Executar migrações do banco de dados PostgreSQL
sudo docker compose exec backend alembic upgrade head
```

---

## Configuração do Reverse Proxy Nginx

Crie a configuração do Nginx para encaminhar o tráfego externo para o Frontend (porta 3000) e Backend (porta 8000).

Crie o ficheiro de configuração:
```bash
sudo nano /etc/nginx/sites-available/ticonta
```

Cole a seguinte configuração completa:

```nginx
# ==============================================================================
# TiConta v2 - Nginx Production Configuration
# ==============================================================================

# Limitar tamanho máximo de upload (para anexos, comprovativos e fotos)
client_max_body_size 25M;

# 1. Redirecionamento de tráfego HTTP para HTTPS (Automático via Certbot)
server {
    listen 80;
    listen [::]:80;
    server_name erp.suaempresa.co.mz api.suaempresa.co.mz;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# 2. Frontend Web Application (Next.js)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name erp.suaempresa.co.mz;

    # Certificados SSL (preenchidos após execução do Certbot)
    ssl_certificate /etc/letsencrypt/live/erp.suaempresa.co.mz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/erp.suaempresa.co.mz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Cabeçalhos de Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval';" always;

    # Proxy para o contentor Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Backend REST API (FastAPI)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.suaempresa.co.mz;

    ssl_certificate /etc/letsencrypt/live/erp.suaempresa.co.mz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/erp.suaempresa.co.mz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts para relatórios e exportações de grande volume
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

Ative o site e teste a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/ticonta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Automação de Certificados SSL com Certbot

Gere certificados SSL gratuitos e renováveis automaticamente:

```bash
# Obter e instalar certificados SSL para ambos os domínios
sudo certbot --nginx -d erp.suaempresa.co.mz -d api.suaempresa.co.mz

# Testar a renovação automática
sudo certbot renew --dry-run
```

O Certbot adiciona automaticamente um temporizador `systemd` para renovar os certificados antes de expirarem.

---

## Opção 2: Deploy no Railway.app

O Railway é uma excelente opção para hospedagem em nuvem PaaS gerenciada com provisionamento automático de PostgreSQL.

```bash
# 1. Instalar a CLI do Railway
npm i -g @railway/cli

# 2. Iniciar sessão
railway login

# 3. Inicializar projeto na pasta raiz
cd ticonta-v2
railway init

# 4. Adicionar base de dados PostgreSQL gerenciada
railway add -d postgres

# 5. Fazer deploy da aplicação
railway up
```

No painel do Railway:
1. Configure as variáveis de ambiente a partir do seu `.env.example`.
2. Configure a porta pública do Frontend (`PORT=3000`) e do Backend (`PORT=8000`).
3. Associe os seus domínios personalizados com SSL automático fornecido pela Cloudflare/Railway.

---

## Opção 3: Deploy no Render.com

1. Crie uma conta em [render.com](https://render.com).
2. **Base de Dados:** Crie um novo *PostgreSQL Database* gerenciado e copie a `Internal Database URL`.
3. **Backend Service:**
   * Crie um *Web Service*, conecte o repositório GitHub `ticonta-v2`.
   * **Root Directory:** `backend`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
   * **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   * **Environment Variables:** Adicione `DATABASE_URL`, `SECRET_KEY`, `LICENSE_MASTER_KEY`, etc.
4. **Frontend Service:**
   * Crie um *Web Service* (Node), conecte o mesmo repositório.
   * **Root Directory:** `frontend`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
   * **Environment Variables:** `NEXT_PUBLIC_API_URL=https://seu-backend-render.onrender.com`.

---

## Estratégia e Automação de Backups

Proteja os dados fiscais e operacionais da sua empresa com cópias de segurança diárias com retenção de 30 dias.

Crie o script de backup em `/var/www/ticonta-v2/scripts/backup_db.sh`:

```bash
#!/bin/bash
# ==============================================================================
# TiConta v2 - Script Automatizado de Backup PostgreSQL
# ==============================================================================

BACKUP_DIR="/var/backups/ticonta"
DATE=$(date +'%Y-%m-%d_%H-%M-%S')
FILENAME="ticonta_backup_${DATE}.sql.gz"
CONTAINER_NAME="ticonta-db"
DB_USER="ticonta_user"
DB_NAME="ticonta_v2"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Executar dump comprimido direto do contentor
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_DIR/$FILENAME"

# Verificar status de saída
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup concluído com sucesso: $BACKUP_DIR/$FILENAME"
    
    # Remover cópias com mais de 30 dias
    find "$BACKUP_DIR" -type f -name "ticonta_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "[$(date)] Rotação de backups concluída. Cópias antigas limpas."
else
    echo "[$(date)] ERRO ao realizar o backup da base de dados!" >&2
    exit 1
fi
```

Torne o script executável e configure o agendador Cron:

```bash
sudo chmod +x /var/www/ticonta-v2/scripts/backup_db.sh

# Adicionar ao Crontab do sistema para rodar todos os dias às 02:00 da manhã
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/ticonta-v2/scripts/backup_db.sh >> /var/log/ticonta_backup.log 2>&1") | crontab -
```

---

## Monitorização e Manutenção

Comandos diários úteis para monitorizar a integridade do sistema:

```bash
# 1. Verificar consumo de CPU, Memória e Rede de cada contentor
docker stats

# 2. Inspecionar logs em tempo real do Backend
docker compose logs -f --tail=100 backend

# 3. Inspecionar logs do Frontend
docker compose logs -f --tail=100 frontend

# 4. Inspecionar logs de requisições do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 5. Reiniciar todos os serviços com segurança
docker compose restart
```

---

## Resolução de Problemas em Produção

| Problema | Causa Mais Provável | Solução |
| :--- | :--- | :--- |
| **Erro 502 Bad Gateway (Nginx)** | O contentor do backend ou frontend caiu ou ainda está a inicializar. | Verifique com `docker compose ps` e inspecione `docker compose logs backend`. |
| **Erro de Migração (Alembic)** | Incompatibilidade de schema ou base de dados não acessível. | Execute `docker compose exec backend alembic current` e `alembic upgrade head`. |
| **Memória Esgotada (OOM Killed)** | Servidor com menos de 2GB RAM sem Swap configurado. | Crie um arquivo swap de 2GB: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`. |
| **Falha de Upload de Ficheiros** | Diretiva `client_max_body_size` insuficiente no Nginx. | Adicione `client_max_body_size 25M;` no bloco `http` ou `server` do ficheiro `/etc/nginx/sites-available/ticonta`. |
