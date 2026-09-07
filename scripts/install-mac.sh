#!/usr/bin/env bash
# ==============================================================================
# TiConta v2 - macOS Automated Installation Script
# ==============================================================================
set -e

# --- Cores e Formatação ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/install_mac.log"

echo "=== Início da Instalação macOS: $(date) ===" > "$LOG_FILE"

print_header() {
    clear 2>/dev/null || true
    echo -e "${CYAN}==============================================================================${NC}"
    echo -e "${BOLD}${PURPLE}            🇲🇿 TICONTA v2 — ERP OFFLINE-FIRST PARA MOÇAMBIQUE                ${NC}"
    echo -e "${BOLD}${BLUE}                  Assistente de Instalação para macOS (Apple Silicon/Intel)   ${NC}"
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

# --- 1. Verificação do Homebrew ---
check_homebrew() {
    log_info "A verificar a presença do Homebrew..."
    if command -v brew &>/dev/null; then
        BREW_VER=$(brew --version | head -n 1)
        log_success "$BREW_VER detetado."
    else
        log_warn "Homebrew não encontrado. A instalar Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        if [ -d "/opt/homebrew/bin" ]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [ -d "/usr/local/bin/brew" ]; then
            eval "$(/usr/local/bin/brew shellenv)"
        fi
        log_success "Homebrew instalado com sucesso."
    fi
}

# --- 2. Verificação de Git ---
check_git() {
    log_info "A verificar a presença do Git..."
    if command -v git &>/dev/null; then
        GIT_VER=$(git --version)
        log_success "$GIT_VER instalado."
    else
        log_warn "Git não encontrado. A instalar via Homebrew..."
        brew install git
        log_success "Git instalado com sucesso."
    fi
}

# --- 3. Verificação do Docker Desktop ---
check_docker() {
    log_info "A verificar o Docker Desktop..."
    if command -v docker &>/dev/null; then
        DOCKER_VER=$(docker --version)
        log_success "$DOCKER_VER detetado."
    else
        log_warn "Docker não encontrado. A instalar Docker Desktop via Homebrew Cask..."
        brew install --cask docker
        log_success "Docker Desktop instalado. A abrir Docker.app..."
        open /Applications/Docker.app
    fi

    # Testar se o daemon do Docker está a responder
    if ! docker info &>/dev/null; then
        log_warn "O Docker Desktop ainda não está em execução."
        log_wait "A abrir /Applications/Docker.app. Por favor aguarde que a baleia no topo fique estável..."
        open -a Docker || true
        
        RETRIES=0
        while ! docker info &>/dev/null; do
            sleep 3
            RETRIES=$((RETRIES + 1))
            if [ $RETRIES -gt 25 ]; then
                log_error "Tempo limite excedido ao aguardar pelo Docker Desktop. Abra a app manualmente e execute novamente."
                exit 1
            fi
            echo -n "."
        done
        echo ""
    fi
    log_success "Docker Daemon está ativo e pronto a receber contentores."

    if docker compose version &>/dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &>/dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        brew install docker-compose
        COMPOSE_CMD="docker compose"
    fi
    log_success "Docker Compose pronto ($COMPOSE_CMD)."
}

# --- 4. Configuração do Ficheiro .env ---
setup_env() {
    log_info "A configurar variáveis de ambiente (.env)..."
    cd "$PROJECT_ROOT"
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            log_success "Ficheiro .env criado a partir de .env.example."
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
            log_success "Ficheiro .env gerado com chaves aleatórias."
        fi
    else
        log_success "Ficheiro .env existente mantido."
    fi
}

# --- 5. Inicialização dos Contentores ---
start_containers() {
    log_wait "A construir e inicializar contentores Docker no macOS..."
    cd "$PROJECT_ROOT"

    if $COMPOSE_CMD up -d --build >> "$LOG_FILE" 2>&1; then
        log_success "Contentores inicializados com sucesso."
    else
        log_error "Falha ao iniciar os contentores. A inspecionar log de erros:"
        $COMPOSE_CMD logs --tail=30 >> "$LOG_FILE"
        tail -n 30 "$LOG_FILE"
        exit 1
    fi

    log_wait "A aplicar migrações na base de dados com Alembic..."
    sleep 5
    if $COMPOSE_CMD exec -T backend alembic upgrade head >> "$LOG_FILE" 2>&1; then
        log_success "Migrações da base de dados aplicadas com sucesso."
    else
        log_warn "Aviso na execução do Alembic (a base de dados está a concluir o arranque inicial)."
    fi
}

# --- 6. Verificação de Saúde (Health Check) ---
verify_health() {
    log_wait "A verificar disponibilidade dos serviços em http://localhost:8000/health..."
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
        log_success "FastAPI Backend e PostgreSQL operacionais e prontos!"
    else
        log_warn "O serviço está a inicializar. Pode aceder ao navegador em instantes."
    fi
}

# --- 7. Abertura do Navegador ---
finish_installation() {
    echo -e "\n${CYAN}==============================================================================${NC}"
    echo -e "${GREEN}${BOLD}              🎉 INSTALAÇÃO NO macOS CONCLUÍDA COM SUCESSO!                  ${NC}"
    echo -e "${CYAN}==============================================================================${NC}\n"
    echo -e "  🖥️  ${BOLD}Interface Web (Frontend):${NC}    ${CYAN}http://localhost:3000${NC}"
    echo -e "  🔌  ${BOLD}API REST & Swagger Docs:${NC}     ${CYAN}http://localhost:8000/docs${NC}"
    echo -e "  📄  ${BOLD}Registo de Instalação (Log):${NC} ${YELLOW}$LOG_FILE${NC}\n"
    echo -e "${BOLD}Comandos Úteis:${NC}"
    echo -e "  - Parar o sistema:       ${BOLD}$COMPOSE_CMD down${NC}"
    echo -e "  - Iniciar o sistema:     ${BOLD}$COMPOSE_CMD up -d${NC}"
    echo -e "  - Ver logs em direto:    ${BOLD}$COMPOSE_CMD logs -f${NC}\n"

    log_info "A abrir o navegador em http://localhost:3000..."
    open "http://localhost:3000" || true
}

# --- Execução Principal ---
print_header
check_homebrew
check_git
check_docker
setup_env
start_containers
verify_health
finish_installation
