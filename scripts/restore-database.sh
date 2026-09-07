#!/usr/bin/env bash
# ==============================================================================
# TiConta v2 - Database Restore Script
# ==============================================================================
set -e

# --- Cores e Formatação ---
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

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${BOLD}${BLUE}             🇲🇿 TiConta v2 — Restauro da Base de Dados                        ${NC}"
echo -e "${CYAN}==============================================================================${NC}\n"

# 1. Verificar se a pasta de backups existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ ERRO: O diretório de cópias de segurança não existe: $BACKUP_DIR${NC}"
    exit 1
fi

# 2. Listar ficheiros de backup disponíveis
BACKUP_FILES=($(find "$BACKUP_DIR" -type f -name "ticonta_backup_*.sql.gz" | sort -r))

if [ ${#BACKUP_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhum ficheiro de backup (.sql.gz) encontrado em: $BACKUP_DIR${NC}"
    echo -e "Execute primeiro: ${BOLD}./scripts/backup-database.sh${NC}"
    exit 1
fi

echo -e "${BOLD}Cópias de Segurança Disponíveis:${NC}"
for i in "${!BACKUP_FILES[@]}"; do
    FILE="${BACKUP_FILES[$i]}"
    BASENAME=$(basename "$FILE")
    FILESIZE=$(du -h "$FILE" | cut -f1)
    FILEMOD=$(date -r "$FILE" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -c '%y' "$FILE" 2>/dev/null | cut -d'.' -f1 || echo "N/A")
    echo -e "  [${CYAN}$((i+1))${NC}] $BASENAME  ${YELLOW}($FILESIZE)${NC} - $FILEMOD"
done

echo ""
read -r -p "Selecione o número da cópia que deseja restaurar [1-${#BACKUP_FILES[@]}]: " CHOICE

if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#BACKUP_FILES[@]} ]; then
    echo -e "${RED}❌ Opção inválida! Operação cancelada.${NC}"
    exit 1
fi

SELECTED_FILE="${BACKUP_FILES[$((CHOICE-1))]}"
SELECTED_NAME=$(basename "$SELECTED_FILE")

echo -e "\n${RED}==============================================================================${NC}"
echo -e "${RED}${BOLD}                       ⚠️  AVISO CRÍTICO DE RESTAURO                         ${NC}"
echo -e "${RED}==============================================================================${NC}"
echo -e "O restauro irá ${BOLD}SOBRESCREVER TODOS OS DADOS ATUAIS${NC} na base '${BOLD}$DB_NAME${NC}'."
echo -e "Ficheiro selecionado: ${CYAN}$SELECTED_NAME${NC}\n"

read -r -p "Tem a certeza absoluta de que deseja avançar? Digite 'RESTAURAR' para confirmar: " CONFIRM

if [ "$CONFIRM" != "RESTAURAR" ]; then
    echo -e "${YELLOW}Operação abortada pelo utilizador.${NC}"
    exit 0
fi

# 3. Teste de integridade do ficheiro gzip
echo -e "\n⏳ [1/3] A validar integridade do ficheiro comprimido..."
if ! gzip -t "$SELECTED_FILE" 2>/dev/null; then
    echo -e "${RED}❌ ERRO: O ficheiro de backup está corrompido! Restauro cancelado.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Integridade do ficheiro verificada com sucesso.${NC}"

# 4. Execução do Restauro
echo -e "⏳ [2/3] A restaurar base de dados '$DB_NAME'..."

if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "A restaurar via contentor Docker '${BOLD}$CONTAINER_NAME${NC}'..."
    gunzip -c "$SELECTED_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1
elif command -v psql &>/dev/null; then
    echo -e "A restaurar via utilitário local '${BOLD}psql${NC}'..."
    gunzip -c "$SELECTED_FILE" | psql -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1
else
    echo -e "${RED}❌ ERRO: Nem o contentor Docker '$CONTAINER_NAME' nem o comando local 'psql' foram encontrados.${NC}"
    exit 1
fi

# 5. Verificação pós-restauro
echo -e "⏳ [3/3] A verificar consistência das tabelas..."
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    TABLES_COUNT=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
elif command -v psql &>/dev/null; then
    TABLES_COUNT=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
else
    TABLES_COUNT="OK"
fi

echo -e "\n${CYAN}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}           🎉 RESTAURO DA BASE DE DADOS CONCLUÍDO COM SUCESSO!                ${NC}"
echo -e "${CYAN}==============================================================================${NC}"
echo -e "  📁 Cópia Aplicada:    ${CYAN}$SELECTED_NAME${NC}"
echo -e "  🗄️  Base de Dados:     ${BOLD}$DB_NAME${NC}"
echo -e "  📊 Tabelas Carregadas: ${GREEN}$TABLES_COUNT tabelas ativas${NC}\n"
