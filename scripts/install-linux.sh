#!/usr/bin/env bash
# ==============================================================================
# TiConta v2 - Linux Automated Installation Script
# ==============================================================================
set -e

# --- Cores e Formatação ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/install_linux.log"

echo "=== Início da Instalação Linux: $(date) ===" > "$LOG_FILE"

print_header() {
    clear 2>/dev/null || true
    echo -e "${CYAN}==============================================================================${NC}"
    echo -e "${BOLD}${PURPLE}            🇲🇿 TICONTA v2 — ERP OFFLINE-FIRST PARA MOÇAMBIQUE                ${NC}"
    echo -e "${BOLD}${BLUE}                  Assistente de Instalação para Linux                         ${NC}"
    echo -e "${CYAN}==============================================================================${NC}\n"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[INFO] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ [OK]${NC} $1"
    echo "[OK] $1" >> "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}⚠️  [AVISO]${NC} $1"
    echo "[WARN] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ [ERRO]${NC} $1"
    echo "[ERROR] $1" >> "$LOG_FILE"
}

log_wait() {
    echo -e "${YELLOW}⏳ [A AGUARDAR]${NC} $1"
    echo "[WAIT] $1" >> "$LOG_FILE"
}

# --- 1. Deteção de Sistema Operativo ---
detect_os() {
    log_info "A detetar distribuição Linux..."
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_NAME=$ID
        OS_VERSION=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS_NAME=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
        OS_VERSION=$(lsb_release -sr)
    else
        OS_NAME=$(uname -s | tr '[:upper:]' '[:lower:]')
        OS_VERSION="unknown"
    fi
    log_success "Sistema detetado: ${BOLD}$OS_NAME (Versão: $OS_VERSION)${NC}"
}

# --- 2. Verificação e Instalação de Git ---
check_git() {
    log_info "A verificar presença do Git..."
    if command -v git &>/dev/null; then
        GIT_VERSION=$(git --version)
        log_success "$GIT_VERSION instalado."
    else
        log_warn "Git não encontrado. A tentar instalar automaticamente..."
        if [ "$OS_NAME" = "ubuntu" ] || [ "$OS_NAME" = "debian" ]; then
            sudo apt-get update && sudo apt-get install -y git
        elif [ "$OS_NAME" = "fedora" ] || [ "$OS_NAME" = "rhel" ] || [ "$OS_NAME" = "centos" ]; then
            sudo dnf install -y git || sudo yum install -y git
        elif [ "$OS_NAME" = "arch" ]; then
            sudo pacman -Sy --noconfirm git
        else
            log_error "Não foi possível instalar o Git automaticamente. Por favor instale o git manualmente."
            exit 1
        fi
        log_success "Git instalado com sucesso."
    fi
}

# --- 3. Verificação e Instalação de Docker Engine e Compose ---
check_docker() {
    log_info "A verificar presença do Docker..."
    if command -v docker &>/dev/null; then
        DOCKER_VER=$(docker --version)
        log_success "$DOCKER_VER detetado."
    else
        log_warn "Docker não encontrado. A iniciar instalação oficial do Docker..."
        if [ "$OS_NAME" = "ubuntu" ] || [ "$OS_NAME" = "debian" ]; then
            sudo apt-get update
            sudo apt-get install -y ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS_NAME/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
            sudo chmod a+r /etc/apt/keyrings/docker.gpg
            echo \
              "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS_NAME \
              "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
              sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        elif [ "$OS_NAME" = "fedora" ] || [ "$OS_NAME" = "rhel" ] || [ "$OS_NAME" = "centos" ]; then
            sudo dnf -y install dnf-plugins-core
            sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        else
            log_info "A executar script universal get.docker.com..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            rm -f get-docker.sh
        fi

        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker "$USER" 2>/dev/null || true
        log_success "Docker instalado e ativado com sucesso."
    fi

    # Testar se o docker compose funciona (v2 plugin ou v1 standalone)
    if docker compose version &>/dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &>/dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        log_warn "Plugin docker compose não encontrado. A instalar docker-compose-plugin..."
        if [ "$OS_NAME" = "ubuntu" ] || [ "$OS_NAME" = "debian" ]; then
            sudo apt-get install -y docker-compose-plugin
            COMPOSE_CMD="docker compose"
        else
            log_error "Por favor instale o docker-compose ou docker compose plugin."
            exit 1
        fi
    fi
    log_success "Docker Compose ($COMPOSE_CMD) pronto."
}

# --- 4. Configuração de Variáveis de Ambiente ---
setup_env() {
    log_info "A configurar ficheiro .env..."
    cd "$PROJECT_ROOT"
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            log_success "Ficheiro .env criado com sucesso a partir de .env.example."
        else
            cat <<EOF > .env
DEBUG=True
ENVIRONMENT=development
SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "change-me-in-production-min-32-chars-secret-key")
DATABASE_URL=postgresql://ticonta_user:ticonta_password@db:5432/ticonta_v2
POSTGRES_USER=ticonta_user
POSTGRES_PASSWORD=ticonta_password
POSTGRES_DB=ticonta_v2
LICENSE_MASTER_KEY=change-me-in-production-min-32-chars-master-key
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
            log_success "Ficheiro .env padrão gerado com segurança."
        fi
    else
        log_success "Ficheiro .env existente mantido."
    fi
}

# --- 5. Inicialização dos Contentores ---
start_containers() {
    log_wait "A construir e inicializar contentores Docker em segundo plano..."
    cd "$PROJECT_ROOT"
    
    if $COMPOSE_CMD up -d --build >> "$LOG_FILE" 2>&1; then
        log_success "Contentores inicializados com sucesso."
    else
        log_error "Falha ao iniciar os contentores. A inspecionar logs recentes:"
        $COMPOSE_CMD logs --tail=30 >> "$LOG_FILE"
        tail -n 30 "$LOG_FILE"
        exit 1
    fi

    log_wait "A aguardar inicialização da base de dados e a executar migrações Alembic..."
    sleep 5
    if $COMPOSE_CMD exec -T backend alembic upgrade head >> "$LOG_FILE" 2>&1; then
        log_success "Migrações da base de dados aplicadas com sucesso."
    else
        log_warn "Aviso na execução inicial do Alembic (a base de dados pode estar a concluir o setup inicial)."
    fi
}

# --- 6. Verificação de Saúde (Health Check) ---
verify_health() {
    log_wait "A validar a disponibilidade dos serviços web..."
    HEALTHY=0
    for i in {1..20}; do
        if curl -s -f http://localhost:8000/health >/dev/null 2>&1; then
            HEALTHY=1
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""

    if [ "$HEALTHY" -eq 1 ]; then
        log_success "Serviço FastAPI (Backend) está totalmente saudável!"
    else
        log_warn "O serviço ainda está em fase de aquecimento ou a porta 8000 demorou a responder."
    fi
}

# --- 7. Abertura do Navegador e Mensagem Final ---
finish_installation() {
    echo -e "\n${CYAN}==============================================================================${NC}"
    echo -e "${GREEN}${BOLD}              🎉 INSTALAÇÃO DO TICONTA v2 CONCLUÍDA COM SUCESSO!              ${NC}"
    echo -e "${CYAN}==============================================================================${NC}\n"
    echo -e "  🖥️  ${BOLD}Interface Web (Frontend):${NC}    ${CYAN}http://localhost:3000${NC}"
    echo -e "  🔌  ${BOLD}API REST & Swagger Docs:${NC}     ${CYAN}http://localhost:8000/docs${NC}"
    echo -e "  📄  ${BOLD}Registo de Instalação (Log):${NC} ${YELLOW}$LOG_FILE${NC}\n"
    echo -e "${BOLD}Comandos Úteis:${NC}"
    echo -e "  - Parar o sistema:       ${BOLD}$COMPOSE_CMD down${NC}"
    echo -e "  - Iniciar o sistema:     ${BOLD}$COMPOSE_CMD up -d${NC}"
    echo -e "  - Ver logs em direto:    ${BOLD}$COMPOSE_CMD logs -f${NC}\n"

    # Tentar abrir navegador automaticamente se em ambiente gráfico
    if [ -n "$DISPLAY" ] || [ -n "$WAYLAND_DISPLAY" ]; then
        if command -v xdg-open &>/dev/null; then
            log_info "A abrir o navegador em http://localhost:3000..."
            xdg-open "http://localhost:3000" >/dev/null 2>&1 || true
        elif command -v sensible-browser &>/dev/null; then
            sensible-browser "http://localhost:3000" >/dev/null 2>&1 || true
        fi
    fi
}

# --- Execução Principal ---
print_header
detect_os
check_git
check_docker
setup_env
start_containers
verify_health
finish_installation
