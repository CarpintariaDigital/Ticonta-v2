# 🛠️ Scripts Utilitários e de Automação — TiConta v2

Esta pasta contém os scripts oficiais de instalação automatizada, gestão de backups, restauro, licenciamento criptográfico e desinstalação para o **TiConta v2 ERP**.

---

## 📑 Lista de Scripts

| Script | Sistema / Plataforma | Descrição |
| :--- | :--- | :--- |
| **[`install-windows.bat`](#1-install-windowsbat)** | 🪟 Windows (10 / 11) | Assistente interativo de instalação automatizada via Docker Desktop. |
| **[`install-linux.sh`](#2-install-linuxsh)** | 🐧 Linux (Ubuntu/Debian/RHEL/Arch) | Deteção automática do SO, instalação de dependências e setup com 1 clique. |
| **[`install-mac.sh`](#3-install-macsh)** | 🍏 macOS (Apple Silicon / Intel) | Instalação automatizada via Homebrew e Docker Desktop. |
| **[`generate-license.py`](#4-generate-licensepy)** | 🐍 Python 3.11+ / Multiplataforma | Gerador administrativo de chaves de licença com assinatura HMAC-SHA256. |
| **[`backup-database.sh`](#5-backup-databasesh)** | 🐧 / 🍏 Bash | Cópia de segurança comprimida (.sql.gz) com política de retenção de 30 dias. |
| **[`restore-database.sh`](#6-restore-databasesh)** | 🐧 / 🍏 Bash | Assistente interativo para restaurar a base de dados a partir de um backup. |
| **[`uninstall.sh`](#7-uninstallsh)** | 🐧 / 🍏 Bash | Paragem de contentores e limpeza seletiva de volumes e ficheiros temporários. |

---

## 1. `install-windows.bat`

Script em lote para Windows que valida o ambiente, configura o `.env`, inicia os contentores Docker e abre o navegador automaticamente.

### Como Executar:
* Dê duplo clique no ficheiro `install-windows.bat` ou abra o Prompt de Comando (CMD) como Administrador:
```cmd
cd ticonta-v2\scripts
install-windows.bat
```

---

## 2. `install-linux.sh`

Script em Bash com deteção de distribuição (Ubuntu, Debian, Fedora, RHEL, CentOS, Arch), instalação automática de dependências, migrações Alembic e teste de saúde (*health check*).

### Como Executar:
```bash
cd ticonta-v2
chmod +x scripts/install-linux.sh
./scripts/install-linux.sh
```

---

## 3. `install-mac.sh`

Script para macOS com integração ao Homebrew e suporte nativo para processadores Apple Silicon (M1/M2/M3/M4) e Intel.

### Como Executar:
```bash
cd ticonta-v2
chmod +x scripts/install-mac.sh
./scripts/install-mac.sh
```

---

## 4. `generate-license.py`

Ferramenta CLI para os administradores da Carpintaria Digital emitirem licenças criptográficas para clientes em Moçambique.

### Sintaxe Posicional Rápida:
```bash
# Formato: python scripts/generate-license.py "<NOME_CLIENTE>" <PLANO> [DIAS]
python scripts/generate-license.py "Mercearia Boa Esperança Lda" professional 365
python scripts/generate-license.py "Fábrica de Móveis Matola" complete 180
python scripts/generate-license.py "Quiosque Central" basic 30
```

### Sintaxe com Flags & JSON:
```bash
python scripts/generate-license.py --customer "Supermercado Maputo" --plan complete --days 365 --json
```

### Planos Suportados:
- `basic` / `basico`: 500 MT/mês
- `professional` / `profissional`: 1.500 MT/mês
- `complete` / `completo`: 3.500 MT/mês
- `enterprise`: 7.500 MT/mês

---

## 5. `backup-database.sh`

Exporta a base de dados PostgreSQL para `storage/backups/ticonta_backup_YYYY-MM-DD_HH-MM-SS.sql.gz` e remove cópias com mais de 30 dias.

### Execução Manual ou Simulação:
```bash
# Execução normal:
./scripts/backup-database.sh

# Modo de teste / simulação (Dry Run):
./scripts/backup-database.sh --dry-run
```

### Agendamento Diário no Crontab (02:00 AM):
```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /caminho/para/ticonta-v2/scripts/backup-database.sh >> /caminho/para/ticonta-v2/storage/backups/cron.log 2>&1") | crontab -
```

---

## 6. `restore-database.sh`

Lista todos os ficheiros de backup disponíveis por ordem cronológica e orienta o utilizador no restauro seguro da base de dados.

### Como Executar:
```bash
./scripts/restore-database.sh
```

---

## 7. `uninstall.sh`

Remove os contentores Docker do TiConta v2, oferecendo a opção de manter ou eliminar os dados da base de dados e os ficheiros de configuração.

### Como Executar:
```bash
./scripts/uninstall.sh
```
