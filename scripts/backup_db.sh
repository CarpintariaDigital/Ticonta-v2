#!/bin/bash
# ==============================================================================
# TiConta v2 - Database Automated Backup Script
# ==============================================================================

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ticonta}"
DATE=$(date +'%Y-%m-%d_%H-%M-%S')
FILENAME="ticonta_backup_${DATE}.sql.gz"
CONTAINER_NAME="${CONTAINER_NAME:-ticonta-db}"
DB_USER="${POSTGRES_USER:-ticonta_user}"
DB_NAME="${POSTGRES_DB:-ticonta_v2}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando cópia de segurança da base de dados $DB_NAME..."

# Dump PostgreSQL via Docker ou local
if command -v docker &> /dev/null && docker ps | grep -q "$CONTAINER_NAME"; then
    docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_DIR/$FILENAME"
elif command -v pg_dump &> /dev/null; then
    pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_DIR/$FILENAME"
else
    echo "[$(date)] ERRO: Nem o contentor Docker $CONTAINER_NAME nem o comando pg_dump foram encontrados!" >&2
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup concluído com sucesso: $BACKUP_DIR/$FILENAME"
    find "$BACKUP_DIR" -type f -name "ticonta_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "[$(date)] Rotação concluída. Ficheiros com mais de $RETENTION_DAYS dias foram eliminados."
else
    echo "[$(date)] ERRO: Falha ao exportar a base de dados!" >&2
    exit 1
fi
