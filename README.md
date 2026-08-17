<div align="center">

# 🇲🇿 TiConta v2
### *ERP Integrado Offline-First & Sistema de Gestão Comercial para Moçambique*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/Licença-Proprietária-blueviolet?style=for-the-badge)](./LICENSING.md)

<p align="center">
  <b>Concebido para a realidade empresarial moçambicana: Funciona 100% sem Internet, sincroniza na nuvem quando conectado e cumpre rigorosamente as normas fiscais e contabilísticas (PGC-NIRF, IVA 16%, INSS, IRPS).</b>
</p>

[Instalação Rápida](#-início-rápido) • [Funcionalidades](#-principais-funcionalidades) • [Manuais de Utilizador](#-documentação--manuais) • [Documentação da API](#-documentação--manuais) • [Licenciamento](#-planos--licenciamento) • [Suporte](#-suporte--contacto)

---

</div>

## 🌟 Visão Geral

O **TiConta v2** é a segunda geração da plataforma ERP líder de gestão comercial e contabilística desenvolvida especificamente para micro, pequenas, médias e grandes empresas em Moçambique.

Combinando uma interface web de alta performance (**Next.js 14**) com uma API robusta e veloz (**FastAPI + PostgreSQL/SQLite**), o TiConta v2 elimina as paragens de negócio causadas por falhas de conectividade ou quebras de energia.

```
       [ Dispositivos POS / Lojas / Estações ]
        ├── Modo 100% Offline (IndexedDB / Dexie.js)
        ├── Emissão Instantânea de Faturas e Recibos Térmicos
        └── Fila de Sincronização Assíncrona com Resolução de Conflitos
                          │ (Ao Restabelecer Conexão)
                          ▼
             [ Backend FastAPI + PostgreSQL ]
        ├── Validação Fiscal PGC-NIRF & Fecho Contabilístico
        ├── Gestão Integrada de Estoque, CRM, Obras & Folha INSS
        └── Disparo Multicanal (WhatsApp, SMS, E-mail)
```

---

## ✨ Principais Funcionalidades

| Módulo | Destaques |
| :--- | :--- |
| ⚡ **Offline-First com Auto-Sync** | Opere sem interrupções. Todas as operações de caixa, faturas e clientes são salvas localmente e sincronizadas em segundo plano com idempotência e carimbo de data/hora seguro. |
| 🇲🇿 **Compliance Fiscal & PGC-NIRF** | Plano Geral de Contas de Moçambique, cálculo automatizado de IVA a 16%, retenção na fonte IRPS, geração de Balancetes, DRE, Balanço Patrimonial e mapas para o INSS. |
| 🛒 **Ponto de Venda (POS)** | Interface táctil rápida com suporte a leitor de código de barras (físico ou câmera), atalhos de teclado, múltiplos métodos de pagamento (Dinheiro, POS/Cartão, M-Pesa, E-Mola) e impressão térmica (58mm/80mm). |
| 👥 **CRM & Funil Comercial** | Gestão de leads e oportunidades por etapas (Lead, Proposta, Negociação, Ganho), agendamento de interações e métricas de conversão comercial. |
| 🏗️ **Projetos, Obras & Serviços** | Acompanhamento orçamental vs. custos reais, atribuição de tarefas e monitorização de despesas e margens operacionais por obra. |
| 👔 **Recursos Humanos & Salários** | Cadastro de pessoal com NUIT e INSS, registo de faltas/assiduidade, cálculo de remunerações líquidas e exportação de declarações mensais. |
| 📱 **Comunicação Multicanal** | Envio de comprovativos de venda e faturas em PDF temporário via **WhatsApp API** e **SMS**, além de e-mail digital. |
| 🔒 **Segurança & Auditoria** | Autenticação JWT com controlo de acesso baseado em papéis (RBAC: Admin, Manager, Accountant, Cashier), rate limiting e trilha de auditoria completa. |

---

## 🚀 Início Rápido

Escolha a opção mais adequada ao seu cenário:

### Opção 1: Docker Compose (Recomendado - 5 Minutos)

```bash
# 1. Clonar o repositório
git clone https://github.com/carpintaria-digital/ticonta-v2.git
cd ticonta-v2

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Inicializar os serviços via Docker
docker-compose up -d

# 4. Executar as migrações da base de dados
docker-compose exec backend alembic upgrade head

# 5. Aceder à aplicação
# Frontend: http://localhost:3000
# Backend API & Swagger: http://localhost:8000/docs
```

### Opção 2: Instalador Desktop (Windows / macOS / Linux)
Descarregue o pacote de instalação executável tudo-em-um a partir da nossa [página de lançamentos](https://github.com/carpintaria-digital/ticonta-v2/releases) ou siga as instruções detalhadas em [INSTALLATION.md](./INSTALLATION.md).

### Opção 3: Execução Manual para Desenvolvedores
Para configurar um ambiente de desenvolvimento local granular, consulte o guia passo a passo em [INSTALLATION.md](./INSTALLATION.md#opção-3-instalação-manual-desenvolvedores).

---

## 📚 Documentação & Manuais

Consulte os guias completos disponíveis no repositório:

- 📖 **[Manual do Utilizador (Português)](./docs/USER_MANUAL_PT.md)** — Guia prático de utilização de todos os 13 módulos do sistema.
- 📖 **[User Manual (English)](./docs/USER_MANUAL_EN.md)** — Comprehensive user guide in English.
- ⚡ **[Guia Rápido & Prompts (Quick Reference)](./docs/QUICK_REFERENCE.md)** — Roteiro de implementação rápida e prompts de desenvolvimento.
- ⚙️ **[Guia de Instalação Completo](./INSTALLATION.md)** — Instruções detalhadas para Docker, Instaladores e Setup manual.
- 🌐 **[Guia de Deploy em Produção](./DEPLOY.md)** — Deploy em VPS Ubuntu com Nginx, Certbot SSL, Railway e Render.
- 🔌 **[Referência da API REST](./docs/API_DOCUMENTATION.md)** — Documentação técnica completa de todos os endpoints e esquemas JSON.
- 🔑 **[Sistema de Licenciamento](./LICENSING.md)** — Arquitetura de assinaturas criptográficas HMAC-SHA256 e gestão de planos.
- 🤝 **[Guia de Contribuição](./CONTRIBUTING.md)** — Normas de código, testes unitários e submissão de pull requests.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [TanStack Query](https://tanstack.com/query), [Dexie.js / IndexedDB](https://dexie.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), [Python 3.11+](https://www.python.org/), [SQLAlchemy](https://www.sqlalchemy.org/), [Alembic](https://alembic.sqlalchemy.org/), [Pydantic v2](https://docs.pydantic.dev/), [Structlog](https://www.structlog.org/) |
| **Bases de Dados** | [PostgreSQL 15+](https://www.postgresql.org/) (Produção/Servidor) e [SQLite](https://www.sqlite.org/) (Standalone local) |
| **Infraestrutura** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/), [Nginx](https://nginx.org/), [Let's Encrypt / Certbot](https://certbot.eff.org/) |
| **Integrações** | Twilio WhatsApp API & SMS, Cloudflare R2 / AWS S3, SMTP |

---

## 💳 Planos & Licenciamento

O TiConta v2 opera através de uma chave de ativação criptográfica offline. Conheça as categorias de plano:

| Plano | Preço Mensal | Principais Funcionalidades |
| :--- | :--- | :--- |
| **BÁSICO** | **500 MT** | POS & Vendas, Controlo de Estoque básico, Gestão de Clientes, Modo Offline. |
| **PROFESSIONAL** | **1.500 MT** | Tudo do Básico + Contabilidade PGC-NIRF completa, CRM Comercial, Módulo de Despesas e Balancetes. |
| **COMPLETO** | **3.500 MT** | Tudo do Professional + Gestão de Obras/Projetos, Recursos Humanos com Folha INSS, WhatsApp/SMS e Suporte Prioritário. |
| **ENTERPRISE** | **Sob Consulta** | Multi-filiais ilimitadas, base de dados dedicada, integrações à medida via API e formação presencial. |

Para mais detalhes sobre ativação, renovação e geração de chaves, consulte [LICENSING.md](./LICENSING.md).

---

## 💬 Suporte & Contacto

Tem dúvidas sobre a implementação ou necessita de assistência técnica?

- 📧 **E-mail de Suporte:** [suporte@ticonta.co.mz](mailto:suporte@ticonta.co.mz)
- 💬 **WhatsApp de Atendimento:** [+258 84 123 4567](https://wa.me/258841234567)
- 🌐 **Portal & Comunidade:** [https://ticonta.co.mz](https://ticonta.co.mz)
- 🏢 **Desenvolvido por:** [Carpintaria Digital](https://carpintariadigital.co.mz) — Maputo, Moçambique

---

## 📄 Licença

Copyright © 2024–2026 **Carpintaria Digital**. Todos os direitos reservados.  
O código fonte deste projeto é de propriedade proprietária da Carpintaria Digital. O uso, distribuição ou modificação não autorizada está sujeito às condições da licença comercial do TiConta v2.
