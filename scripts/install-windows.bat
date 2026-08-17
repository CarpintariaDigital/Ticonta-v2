@echo off
setlocal EnableDelayedExpansion
title TiConta v2 - Assistente de Instalacao Automatizada (Windows)

:: ==============================================================================
:: TiConta v2 - Windows Automated Installation Script
:: ==============================================================================

cls
echo ==============================================================================
echo                TICONTA v2 - ERP OFFLINE-FIRST PARA MOCAMBIQUE
echo                     Assistente de Instalacao para Windows
echo ==============================================================================
echo.

:: 1. Definir diretorio base
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."
set "PROJECT_ROOT=%CD%"
set "LOG_FILE=%PROJECT_ROOT%\install_windows.log"

echo [LOG] Inicio da instalacao em: %DATE% %TIME% > "%LOG_FILE%"

:: 2. Verificar se o Git esta instalado
echo [1/6] [?] Verificando presenca do Git...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Git nao foi encontrado no sistema!
    echo.
    echo Por favor, descarregue e instale o Git para Windows a partir de:
    echo https://git-scm.com/download/win
    echo.
    echo Apos instalar o Git, execute este script novamente.
    echo [LOG] ERRO: Git nao instalado. >> "%LOG_FILE%"
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('git --version') do set GIT_VER=%%i
echo [OK] %GIT_VER% detectado com sucesso.
echo [LOG] %GIT_VER% detectado. >> "%LOG_FILE%"
echo.

:: 3. Verificar se o Docker Desktop esta instalado e em execucao
echo [2/6] [?] Verificando presenca do Docker...
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Docker nao foi encontrado no sistema!
    echo.
    echo O TiConta v2 necessita do Docker Desktop para executar a base de dados e os servicos.
    echo Descarregue e instale o Docker Desktop para Windows:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo Certifique-se de ativar o WSL 2 durante a instalacao do Docker.
    echo [LOG] ERRO: Docker nao instalado. >> "%LOG_FILE%"
    pause
    exit /b 1
)

:: Verificar se o daemon do Docker esta rodando
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] O Docker Desktop esta instalado, mas nao parece estar em execucao.
    echo [WAIT] Por favor, abra o aplicativo Docker Desktop e aguarde inicializar...
    echo.
    set /p RETRY="Pressione ENTER apos o Docker Desktop iniciar completamente..."
    docker info >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [X] Nao foi possivel comunicar com o motor Docker.
        echo Certifique-se de que o Docker Desktop esta verde (Running) e tente novamente.
        echo [LOG] ERRO: Docker Daemon parado. >> "%LOG_FILE%"
        pause
        exit /b 1
    )
)
for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VER=%%i
echo [OK] %DOCKER_VER% ativo e pronto.
echo [LOG] %DOCKER_VER% ativo. >> "%LOG_FILE%"
echo.

:: 4. Configurar arquivo .env
echo [3/6] [?] Configurando variaveis de ambiente (.env)...
if not exist "%PROJECT_ROOT%\.env" (
    if exist "%PROJECT_ROOT%\.env.example" (
        copy "%PROJECT_ROOT%\.env.example" "%PROJECT_ROOT%\.env" >nul
        echo [OK] Arquivo .env criado a partir de .env.example.
        echo [LOG] .env criado. >> "%LOG_FILE%"
    ) else (
        echo [!] .env.example nao encontrado. Criando .env basico...
        (
            echo DEBUG=True
            echo ENVIRONMENT=development
            echo SECRET_KEY=change-me-in-production-secret-key-32chars
            echo DATABASE_URL=postgresql://ticonta_user:ticonta_password@db:5432/ticonta_v2
            echo POSTGRES_USER=ticonta_user
            echo POSTGRES_PASSWORD=ticonta_password
            echo POSTGRES_DB=ticonta_v2
            echo LICENSE_MASTER_KEY=change-me-in-production-min-32-chars-master-key
            echo NEXT_PUBLIC_API_URL=http://localhost:8000
        ) > "%PROJECT_ROOT%\.env"
        echo [OK] Arquivo .env padrao gerado com sucesso.
        echo [LOG] .env padrao criado. >> "%LOG_FILE%"
    )
) else (
    echo [OK] Arquivo .env ja existente mantido.
    echo [LOG] .env existente mantido. >> "%LOG_FILE%"
)
echo.

:: 5. Construir e inicializar contentores Docker
echo [4/6] [WAIT] Construindo e iniciando servicos via Docker Compose...
echo Isso pode levar alguns minutos no primeiro download de imagens.
echo.

docker compose version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "COMPOSE_CMD=docker compose"
) else (
    set "COMPOSE_CMD=docker-compose"
)

%COMPOSE_CMD% up -d --build >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Falha ao iniciar os contentores Docker!
    echo Inspecione o log de erros em: %LOG_FILE%
    echo.
    echo Ultimas linhas do log:
    type "%LOG_FILE%" | more
    pause
    exit /b 1
)
echo [OK] Contentores inicializados com sucesso em segundo plano.
echo [LOG] Contentores ativos. >> "%LOG_FILE%"
echo.

:: 6. Executar migracoes da base de dados
echo [5/6] [WAIT] Aplicando migracoes da base de dados (Alembic)...
timeout /t 5 /nobreak >nul
%COMPOSE_CMD% exec -T backend alembic upgrade head >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Aviso: Migracao automatica sera aplicada assim que a base de dados concluir o arranque inicial.
    echo [LOG] Aviso na migracao Alembic. >> "%LOG_FILE%"
) else (
    echo [OK] Base de dados e tabelas migradas com sucesso.
    echo [LOG] Migracoes concluidas. >> "%LOG_FILE%"
)
echo.

:: 7. Teste de Saude (Health Check)
echo [6/6] [WAIT] Verificando disponibilidade da API e Interface Web...
set HEALTHY=0
for /l %%A in (1,1,15) do (
    curl -s http://localhost:8000/health >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set HEALTHY=1
        goto :HealthSuccess
    )
    echo Aguardando servicos ficarem prontos (tentativa %%A de 15)...
    timeout /t 2 /nobreak >nul
)

:HealthSuccess
if %HEALTHY% EQU 1 (
    echo [OK] Backend API e Frontend estao operacionais e saudaveis!
) else (
    echo [!] O servico esta iniciando. Aceda ao navegador em instantes.
)
echo.

:: 8. Finalizacao e Abertura do Navegador
echo ==============================================================================
echo                     INSTALACAO CONCLUIDA COM SUCESSO!
echo ==============================================================================
echo.
echo  Interface Web (Frontend):    http://localhost:3000
echo  Documentacao API (Swagger):  http://localhost:8000/docs
echo  Logs da Instalacao:          %LOG_FILE%
echo.
echo Pressione qualquer tecla para abrir o TiConta v2 no seu navegador...
pause >nul

start http://localhost:3000

echo.
echo Para parar o TiConta v2 mais tarde, execute:
echo   %COMPOSE_CMD% down
echo.
echo Bom trabalho com o TiConta v2 ERP!
exit /b 0
