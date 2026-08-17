#!/usr/bin/env bash
# ==============================================================================
# TiConta v2 - Uninstallation & Cleanup Script
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

echo -e "${RED}==============================================================================${NC}"
echo -e "${RED}${BOLD}            ⚠️  TICONTA v2 — ASSISTENTE DE DESINSTALAÇÃO & LIMPEZA           ${NC}"
echo -e "${RED}==============================================================================${NC}\n"

echo -e "Este script irá parar os contentores do TiConta v2 e limpar os recursos do sistema.\n"

if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD=""
fi

# 1. Parar contentores
if [ -n "$COMPOSE_CMD" ]; then
    echo -e "⏳ [1/4] A parar e remover contentores Docker..."
    cd "$PROJECT_ROOT"
    $COMPOSE_CMD down --remove-orphans || true
    echo -e "${GREEN}✅ Contentores parados e removidos.${NC}"
else
    echo -e "${YELLOW}⚠️ Docker Compose não detetado. A ignorar paragem de contentores.${NC}"
fi

# 2. Perguntar sobre remoção de volumes e dados persistentes
echo -e "\n${YELLOW}------------------------------------------------------------------------------${NC}"
echo -e "${BOLD}Deseja eliminar permanentemente os Volumes da Base de Dados PostgreSQL?${NC}"
echo -e "${RED}ATENÇÃO: Todas as faturas, lançamentos contábeis e cadastros serão PERDIDOS!${NC}"
echo -e "${YELLOW}------------------------------------------------------------------------------${NC}"
read -r -p "Eliminar dados da base de dados? (s/N): " REMOVE_VOLUMES

if [[ "$REMOVE_VOLUMES" =~ ^[sS]$ ]] || [[ "$REMOVE_VOLUMES" =~ ^[yY]$ ]]; then
    if [ -n "$COMPOSE_CMD" ]; then
        echo -e "⏳ A remover volumes Docker..."
        $COMPOSE_CMD down -v || true
        echo -e "${GREEN}✅ Volumes Docker eliminados.${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Volumes mantidos para utilização futura.${NC}"
fi

# 3. Perguntar sobre ficheiros de configuração locais (.env)
echo -e "\n${YELLOW}------------------------------------------------------------------------------${NC}"
echo -e "${BOLD}Deseja remover os ficheiros locais de ambiente (.env)?${NC}"
echo -e "${YELLOW}------------------------------------------------------------------------------${NC}"
read -r -p "Eliminar ficheiros .env? (s/N): " REMOVE_ENV

if [[ "$REMOVE_ENV" =~ ^[sS]$ ]] || [[ "$REMOVE_ENV" =~ ^[yY]$ ]]; then
    rm -f "$PROJECT_ROOT/.env" "$PROJECT_ROOT/backend/.env" "$PROJECT_ROOT/frontend/.env.local"
    echo -e "${GREEN}✅ Ficheiros .env removidos.${NC}"
else
    echo -e "${BLUE}ℹ️  Ficheiros .env mantidos.${NC}"
fi

# 4. Limpeza de ficheiros temporários e logs
echo -e "\n⏳ A limpar ficheiros temporários, caches e relatórios de logs..."
rm -f "$PROJECT_ROOT/install_linux.log" "$PROJECT_ROOT/install_mac.log" "$PROJECT_ROOT/install_windows.log"
find "$PROJECT_ROOT" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find "$PROJECT_ROOT" -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
echo -e "${GREEN}✅ Ficheiros temporários e caches limpos.${NC}"

echo -e "\n${CYAN}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}                   DESINSTALAÇÃO E LIMPEZA CONCLUÍDAS                         ${NC}"
echo -e "${CYAN}==============================================================================${NC}"
echo -e "O TiConta v2 foi desinstalado com sucesso do seu ambiente Docker local.\n"
