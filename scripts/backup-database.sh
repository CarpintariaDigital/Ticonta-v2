#!/usr/bin/env bash
# ==============================================================================
# TiConta v2 - Automated Database Backup Script
# ==============================================================================
set -e

# --- Configurações & Cores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Carregar variáveis do .env se existir
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$PROJECT_ROOT/.env"
    set +a
fi

BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/storage/backups}"
CONTAINER_NAME="${CONTAINER_NAME:-ticonta-db}"
DB_USER="${POSTGRES_USER:-ticonta_user}"
DB_NAME="${POSTGRES_DB:-ticonta_v2}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE_STR=$(date +'%Y-%m-%d_%H-%M-%S')
FILENAME="ticonta_backup_${DATE_STR}.sql.gz"
TARGET_PATH="$BACKUP_DIR/$FILENAME"
LOG_FILE="$BACKUP_DIR/backup.log"

DRY_RUN=false
if [[ "$1" == "--dry-run" ]] || [[ "$1" == "-d" ]]; then
    DRY_RUN=true
fi

# Criar pasta de destino
mkdir -p "$BACKUP_DIR"

log() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$msg"
    echo "$msg" >> "$LOG_FILE"
}

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${BOLD}${BLUE}             🇲🇿 TiConta v2 — Cópia de Segurança da Base de Dados              ${NC}"
echo -e "${CYAN}==============================================================================${NC}"

if [ "$DRY_RUN" = true ]; then
    log "${YELLOW}[DRY-RUN] Simulação de backup iniciada.${NC}"
    log "${BLUE}Destino:${NC} $TARGET_PATH"
    log "${BLUE}Contentor:${NC} $CONTAINER_NAME | ${BLUE}Utilizador:${NC} $DB_USER | ${BLUE}Base de Dados:${NC} $DB_NAME"
    log "${GREEN}✅ [DRY-RUN] Verificações concluídas com sucesso.${NC}"
    exit 0
fi

log "⏳ A iniciar exportação da base de dados '${BOLD}$DB_NAME${NC}'..."

# 1. Execução do dump PostgreSQL (Docker ou local pg_dump)
SUCCESS=false

if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log "A utilizar contentor Docker ativo: ${BOLD}$CONTAINER_NAME${NC}"
    if docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --clean | gzip > "$TARGET_PATH"; then
        SUCCESS=true
    fi
elif command -v pg_dump &>/dev/null; then
    log "A utilizar utilitário local: ${BOLD}pg_dump${NC}"
    if pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --clean | gzip > "$TARGET_PATH"; then
        SUCCESS=true
    fi
else
    log "${RED}❌ ERRO: Nem o contentor Docker '$CONTAINER_NAME' nem o comando local 'pg_dump' estão acessíveis!${NC}"
    exit 1
fi

# 2. Verificação de integridade
if [ "$SUCCESS" = true ] && [ -s "$TARGET_PATH" ]; then
    FILESIZE=$(du -h "$TARGET_PATH" | cut -f1)
    log "${GREEN}✅ Backup concluído com sucesso!${NC}"
    log "   📁 Ficheiro: ${BOLD}$TARGET_PATH${NC}"
    log "   📦 Tamanho:  ${BOLD}$FILESIZE${NC}"

    # 3. Rotação de backups antigos (Políticas de Retenção de 30 dias)
    log "⏳ A executar rotação de cópias com mais de ${RETENTION_DAYS} dias..."
    REMOVED_COUNT=$(find "$BACKUP_DIR" -type f -name "ticonta_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" | wc -l)
    find "$BACKUP_DIR" -type f -name "ticonta_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
    log "${GREEN}✅ Rotação concluída. ${REMOVED_COUNT} ficheiro(s) antigo(s) removido(s).${NC}"
else
    log "${RED}❌ ERRO: O ficheiro de backup gerado está vazio ou o processo falhou!${NC}"
    rm -f "$TARGET_PATH"
    exit 1
fi

echo -e "\n${GREEN}Para agendar este backup diariamente via Crontab (todos os dias às 02:00):${NC}"
echo -e "  ${BOLD}0 2 * * * $PROJECT_ROOT/scripts/backup-database.sh >> $BACKUP_DIR/cron.log 2>&1${NC}\n"
