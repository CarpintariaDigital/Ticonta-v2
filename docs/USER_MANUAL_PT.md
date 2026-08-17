# 📖 MANUAL DO UTILIZADOR — TICONTA v2 ERP
### *Guia Completo de Operação, Gestão Comercial e Conformidade Fiscal para Moçambique*

---

<div align="center">

```
========================================================================================
    __  _ _____            __             ___ 
   / /_(_) ___/__  ____  / /_____ _     |__ \
  / __/ / /__ / _ \/ __ \/ __/ __ `/     __/ /
 / /_/ / /__/ /  __/ / / / /_/ /_/ /     / __/ 
 \__/_/\___/_/\___/_/ /_/\__/\__,_/     /____/ 
                                               
           SISTEMA INTEGRADO DE GESTÃO EMPRESARIAL OFFLINE-FIRST
========================================================================================
```

**Versão da Plataforma:** 2.0.0 LTS  
**Ambiente de Operação:** Moçambique (Metical - MZN • IVA 16% • PGC-NIRF • INSS)  
**Propriedade Intelectual:** Carpintaria Digital — Maputo, Moçambique  

</div>

---

## 📑 ÍNDICE GERAL

1. [1. INTRODUÇÃO](#1-introdução)
   - [1.1 O que é o TiConta v2](#11-o-que-é-o-ticonta-v2)
   - [1.2 Requisitos Mínimos do Sistema](#12-requisitos-mínimos-do-sistema)
   - [1.3 Suporte de Navegadores & Dispositivos](#13-suporte-de-navegadores--dispositivos)
   - [1.4 Primeiros Passos em 3 Etapas](#14-primeiros-passos-em-3-etapas)
2. [2. SETUP INICIAL & CONFIGURAÇÃO](#2-setup-inicial--configuração)
   - [2.1 Acesso e Primeiro Login](#21-acesso-e-primeiro-login)
   - [2.2 Configuração da Empresa (Logo, NUIT, Sede Fiscal)](#22-configuração-da-empresa-logo-nuit-sede-fiscal)
   - [2.3 Gestão de Utilizadores e Atribuição de Perfis (Roles)](#23-gestão-de-utilizadores-e-atribuição-de-perfis-roles)
3. [3. PONTO DE VENDA (POS) & FATURAÇÃO](#3-ponto-de-venda-pos--faturação)
   - [3.1 Interface do POS e Venda Rápida Passo a Passo](#31-interface-do-pos-e-venda-rápida-passo-a-passo)
   - [3.2 Identificação de Cliente & Emissão com NUIT](#32-identificação-de-cliente--emissão-com-nuit)
   - [3.3 Aplicação de Descontos e Promoções](#33-aplicação-de-descontos-e-promoções)
   - [3.4 Métodos de Pagamento (Dinheiro, Cartão/POS, M-Pesa, e-Mola)](#34-métodos-de-pagamento-dinheiro-cartãopos-m-pesa-e-mola)
   - [3.5 Emissão de Recibos (Térmico ESC/POS, Email, WhatsApp)](#35-emissão-de-recibos-térmico-escpos-email-whatsapp)
   - [3.6 Devoluções, Cancelamentos e Reposição de Stock](#36-devoluções-cancelamentos-e-reposição-de-stock)
   - [3.7 Consulta do Histórico de Vendas Diárias](#37-consulta-do-histórico-de-vendas-diárias)
4. [4. GESTÃO DE CLIENTES & CRM COMERCIAL](#4-gestão-de-clientes--crm-comercial)
   - [4.1 Cadastro e Edição de Clientes](#41-cadastro-e-edição-de-clientes)
   - [4.2 Ficha Completa 360º do Cliente (Histórico, Débitos e Saldo)](#42-ficha-completa-360º-do-cliente-histórico-débitos-e-saldo)
   - [4.3 Funil Comercial & Pipeline de Oportunidades](#43-funil-comercial--pipeline-de-oportunidades)
   - [4.4 Quadro Kanban de Leads (Novo → Proposta → Ganho/Perdido)](#44-quadro-kanban-de-leads-novo--proposta--ganhoperdido)
   - [4.5 Histórico de Contactos, Notas e Follow-ups](#45-histórico-de-contactos-notas-e-follow-ups)
5. [5. GESTÃO FINANCEIRA & TESOURARIA](#5-gestão-financeira--tesouraria)
   - [5.1 Registo de Despesas e Saídas de Caixa](#51-registo-de-despesas-e-saídas-de-caixa)
   - [5.2 Plano de Categorias de Gastos](#52-plano-de-categorias-de-gastos)
   - [5.3 Abertura e Fecho Diário de Caixa (Tolerância e Quebras)](#53-abertura-e-fecho-diário-de-caixa-tolerância-e-quebras)
   - [5.4 Reconciliação Bancária & Extratos de Contas](#54-reconciliação-bancária--extratos-de-contas)
   - [5.5 Relatórios de Fluxo de Caixa](#55-relatórios-de-fluxo-de-caixa)
6. [6. CONTABILIDADE GERAL (PGC-NIRF MOÇAMBIQUE)](#6-contabilidade-geral-pgc-nirf-moçambique)
   - [6.1 Estrutura do Plano Geral de Contas (Classes 1 a 7)](#61-estrutura-do-plano-geral-de-contas-classes-1-a-7)
   - [6.2 Lançamentos em Partida Dobrada (Débito vs. Crédito)](#62-lançamentos-em-partida-dobrada-débito-vs-crédito)
   - [6.3 Balancete de Verificação (Trial Balance)](#63-balancete-de-verificação-trial-balance)
   - [6.4 Demonstração de Resultados do Exercício (DRE)](#64-demonstração-de-resultados-do-exercício-dre)
   - [6.5 Balanço Patrimonial Oficial](#65-balanço-patrimonial-oficial)
7. [7. GESTÃO DE PROJETOS, OBRAS & SERVIÇOS](#7-gestão-de-projetos-obras--serviços)
   - [7.1 Criação de Obras e Parametrização Orçamental](#71-criação-de-obras-e-parametrização-orçamental)
   - [7.2 Gestão de Tarefas & Milestones (To Do, In Progress, Done)](#72-gestão-de-tarefas--milestones-to-do-in-progress-done)
   - [7.3 Imputação Direta de Custos e Materiais à Obra](#73-imputação-direta-de-custos-e-materiais-à-obra)
   - [7.4 Alertas Automáticos de Desvio Orçamental](#74-alertas-automáticos-de-desvio-orçamental)
   - [7.5 Relatório de Rentabilidade por Empreitada](#75-relatório-de-rentabilidade-por-empreitada)
8. [8. RECURSOS HUMANOS & SALÁRIOS (INSS & IRPS)](#8-recursos-humanos--salários-inss--irps)
   - [8.1 Registo Completo de Colaboradores](#81-registo-completo-de-colaboradores)
   - [8.2 Controlo de Assiduidade e Faltas (Attendance)](#82-controlo-de-assiduidade-e-faltas-attendance)
   - [8.3 Processamento Automático de Salários](#83-processamento-automático-de-salários)
   - [8.4 Cálculos de INSS (3% Trabalhador + 4% Patronal) e Retenção IRPS](#84-cálculos-de-inss-3-trabalhador--4-patronal-e-retenção-irps)
   - [8.5 Emissão de Recibos de Vencimento e Mapas para Banco](#85-emissão-de-recibos-de-vencimento-e-mapas-para-banco)
9. [9. RELATÓRIOS & ANÁLISE DE NEGÓCIO](#9-relatórios--análise-de-negócio)
   - [9.1 Relatórios Pré-definidos de Vendas, Fisco e Stock](#91-relatórios-pré-definidos-de-vendas-fisco-e-stock)
   - [9.2 Filtros Avançados e Segmentação por Período](#92-filtros-avançados-e-segmentação-por-período)
   - [9.3 Exportação em Massa (PDF, Excel .xlsx e CSV)](#93-exportação-em-massa-pdf-excel-xlsx-e-csv)
   - [9.4 Agendamento Automático de Relatórios por Email](#94-agendamento-automático-de-relatórios-por-email)
10. [10. DEFINIÇÕES, SEGURANÇA & CÓPIAS DE SEGURANÇA](#10-definições-segurança--cópias-de-segurança)
    - [10.1 Gestão de Perfis de Acesso e Permissões](#101-gestão-de-perfis-de-acesso-e-permissões)
    - [10.2 Ativação e Renovação de Licença TiConta v2](#102-ativação-e-renovação-de-licença-ticonta-v2)
    - [10.3 Cópias de Segurança (Backup Manual e Restauro)](#103-cópias-de-segurança-backup-manual-e-restauro)
    - [10.4 Segurança, PIN de Acesso e Auditoria](#104-segurança-pin-de-acesso-e-auditoria)
11. [11. MODO OFFLINE & MOTOR DE SINCRONIZAÇÃO](#11-modo-offline--motor-de-sincronização)
    - [11.1 Como Funciona a Operação Sem Internet](#111-como-funciona-a-operação-sem-internet)
    - [11.2 Indicadores de Estado da Ligação](#112-indicadores-de-estado-da-ligação)
    - [11.3 Fila de Sincronização Local (IndexedDB)](#113-fila-de-sincronização-local-indexeddb)
    - [11.4 Resolução Automática de Conflitos](#114-resolução-automática-de-conflitos)
12. [12. MÓDULOS & FUNCIONALIDADES PREMIUM](#12-módulos--funcionalidades-premium)
    - [12.1 Envio Digital por WhatsApp e SMS (Twilio Integration)](#121-envio-digital-por-whatsapp-e-sms-twilio-integration)
    - [12.2 Leitor de Códigos de Barras por Câmara e Hardware](#122-leitor-de-códigos-de-barras-por-câmara-e-hardware)
    - [12.3 Acesso à API REST para Integrações Externas](#123-acesso-à-api-rest-para-integrações-externas)
13. [13. DICAS PRÁTICAS & RECOMENDAÇÕES](#13-dicas-práticas--recomendações)
14. [14. RESOLUÇÃO DE PROBLEMAS (TROUBLESHOOTING & FAQ)](#14-resolução-de-problemas-troubleshooting--faq)
15. [15. CONTACTOS, SUPORTE TÉCNICO & FORMAÇÃO](#15-contactos-suporte-técnico--formação)

---

# 1. INTRODUÇÃO

## 1.1 O que é o TiConta v2
O **TiConta v2** é a plataforma ERP líder de mercado em Moçambique, concebida de raiz para responder aos desafios reais de conectividade, fiscalidade e gestão empresarial no nosso país. 

Diferente dos sistemas tradicionais que bloqueiam quando a internet falha ou a energia oscila, o TiConta v2 funciona segundo a arquitetura **Offline-First**:
* Permite registar vendas, emitir faturas, consultar estoque e dar entrada de despesas **sem qualquer dependência de sinal de internet**.
* Quando o computador ou tablet deteta rede (Wi-Fi, cabo ou dados móveis), todos os dados são sincronizados de forma transparente e segura com o servidor central.
* Está 100% calibrado para o **Plano Geral de Contabilidade (PGC-NIRF)**, taxa de **IVA a 16%**, retenção na fonte de **IRPS** e declarações de segurança social do **INSS**.

---

## 1.2 Requisitos Mínimos do Sistema

| Componente | Requisito Mínimo (Balcão / Caixa) | Recomendado (Servidor / Escritório) |
| :--- | :--- | :--- |
| **Processador (CPU)** | Intel Core i3 (2.0 GHz) ou equivalente | Intel Core i5 / i7 / AMD Ryzen 5 / Apple M-Series |
| **Memória RAM** | 4 GB | 8 GB ou 16 GB |
| **Armazenamento** | 20 GB de espaço livre em disco SSD | 100 GB SSD NVMe |
| **Sistema Operativo** | Windows 10/11 (64-bit), Ubuntu 22+, macOS 12+ | Ubuntu Server 22.04/24.04 LTS / Debian 12 |
| **Impressora Térmica** | ESC/POS 58mm ou 80mm (USB/Bluetooth/Rede) | ESC/POS 80mm com Guilhotina automática |
| **Resolução de Ecrã** | 1366 x 768 píxeis | 1920 x 1080 píxeis (Full HD) ou Superior |

---

## 1.3 Suporte de Navegadores & Dispositivos

O TiConta v2 é uma aplicação web progressiva (PWA). Pode ser executada diretamente no navegador ou instalada como aplicação no Ambiente de Trabalho:
* 🌐 **Google Chrome:** Versão 100 ou superior (**Recomendado**).
* 🌐 **Microsoft Edge:** Versão 100 ou superior.
* 🌐 **Mozilla Firefox:** Versão 105 ou superior.
* 🌐 **Apple Safari:** Versão 15 ou superior (macOS e iPadOS).
* 📱 **Tablets e Telemóveis Android/iOS:** Suporte tátil completo com leitor de códigos de barras via câmara integrada.

---

## 1.4 Primeiros Passos em 3 Etapas

```
 +---------------------------------------------------------------------------------+
 |  ETAPA 1: Acesso Inicial                                                        |
 |  Abra o navegador no endereço http://localhost:3000 ou link do seu servidor.    |
 +---------------------------------------------------------------------------------+
                                         │
                                         ▼
 +---------------------------------------------------------------------------------+
 |  ETAPA 2: Criação do Administrador                                              |
 |  Defina o Utilizador Master (ex: admin), email e o PIN numérico seguro.         |
 +---------------------------------------------------------------------------------+
                                         │
                                         ▼
 +---------------------------------------------------------------------------------+
 |  ETAPA 3: Ativação da Licença e Dados Fiscais                                   |
 |  Insira o NUIT da empresa e cole a sua chave de licença TiConta v2.             |
 +---------------------------------------------------------------------------------+
```

---

# 2. SETUP INICIAL & CONFIGURAÇÃO

## 2.1 Acesso e Primeiro Login
Ao abrir o sistema pela primeira vez, o assistente inteligente de arranque guia-o na configuração fundamental:
1. Abra o navegador web e digite o endereço local `http://localhost:3000`.
2. No ecrã de boas-vindas, insira o seu **Nome de Utilizador** pretendido e defina um **PIN de Acesso** (código de 4 a 6 dígitos).
3. Insira o seu **E-mail Institucional** para recuperação de credenciais.
4. Clique no botão **"Criar Conta & Iniciar"**.

```
+-------------------------------------------------------------+
|                      🇲🇿 TICONTA v2                          |
|             Criação da Primeira Conta Master                |
|                                                             |
|  Nome de Utilizador: [ admin                              ] |
|  E-mail:             [ director@minhaempresa.co.mz        ] |
|  PIN de Acesso:      [ ****                               ] |
|  Confirmar PIN:      [ ****                               ] |
|                                                             |
|                    [ CRIAR CONTA & ENTRAR ]                 |
+-------------------------------------------------------------+
```

> 💡 **Dica de Segurança:** Não utilize PINs óbvios como `1234` ou `0000`. O PIN funciona como assinatura digital para autorizar operações de caixa e fechos contabilísticos.

---

## 2.2 Configuração da Empresa (Logo, NUIT, Sede Fiscal)
Para que as faturas e recibos saiam com validade fiscal segundo a lei moçambicana, preencha os dados da sua empresa:
1. Aceda ao menu lateral esquerdo em **Definições > Empresa**.
2. Preencha os campos obrigatórios:
   * **Denominação Social:** Nome registado da empresa (ex: *Carpintaria e Móveis de Maputo, Lda*).
   * **NUIT:** 9 dígitos fiscais atribuídos pela Autoridade Tributária de Moçambique.
   * **Endereço Completo:** Avenida, Rua, Número e Bairro.
   * **Cidade e Província:** Selecione a localização (ex: *Cidade de Maputo*, *Matola*, *Beira*, *Nampula*).
   * **Regime de IVA:** Selecione **Geral (Taxa de 16%)** ou **Isento** (Artigo 9º do Código do IVA).
   * **Logótipo:** Clique em "Carregar Logótipo" para selecionar uma imagem (PNG/JPG) que aparecerá no cabeçalho das faturas e orçamentos.
3. Clique em **"Guardar Alterações"**.

---

## 2.3 Gestão de Utilizadores e Atribuição de Perfis (Roles)
Cada colaborador deve ter o seu próprio utilizador para efeitos de auditoria:
1. Aceda a **Definições > Utilizadores** e clique em **"Adicionar Utilizador"**.
2. Indique o nome do operador, email e PIN inicial.
3. Atribua o nível de acesso (**Perfil / Role**):
   * **Admin (Administrador):** Controlo total do sistema, configurações fiscais, auditoria e licenciamento.
   * **Manager (Gerente):** Acesso a relatórios de gestão, aprovação de despesas e anulação de vendas.
   * **Accountant (Contabilista):** Acesso total ao módulo de Contabilidade, Diários, DRE e Balancetes.
   * **Cashier (Operador de Caixa):** Acesso restrito ao POS, emissão de faturas e abertura/fecho do seu próprio caixa.
4. Clique em **"Gravar Utilizador"**.

---

# 3. PONTO DE VENDA (POS) & FATURAÇÃO

## 3.1 Interface do POS e Venda Rápida Passo a Passo
O módulo de POS foi desenhado para ser o mais veloz e simples do mercado:

```
+-----------------------------------------------------------------------------------+
| 🔍 [ Pesquisar produto por nome, código SKU ou código de barras...            ]    |
+-----------------------------------------------------------------------------------+
| PRODUTOS DISPONÍVEIS                       | CARRINHO DE COMPRAS                  |
| +-----------------+  +-----------------+   | Cliente: Consumidor Final [ Alterar ]|
| | 🍞 Pão de Forma |  | 🥤 Refri 500ml  |   | ------------------------------------ |
| | Preço: 80.00 MT |  | Preço: 50.00 MT |   | 2x Pão de Forma (80 MT)   160.00 MT  |
| +-----------------+  +-----------------+   | 1x Refri 500ml (50 MT)     50.00 MT  |
| +-----------------+  +-----------------+   | ------------------------------------ |
| | 🍚 Arroz 5Kg    |  | 🧴 Óleo 1L      |   | Subtotal:                 210.00 MT  |
| | Preço: 350.0 MT |  | Preço: 140.0 MT |   | IVA (16% incluído):        28.96 MT  |
| +-----------------+  +-----------------+   | TOTAL A PAGAR:            210.00 MT  |
|                                            | ------------------------------------ |
|                                            | [💵 Dinheiro] [📱 M-Pesa] [💳 Cartão]|
|                                            | [     🖨️ CONCLUIR VENDA (F10)      ] |
+-----------------------------------------------------------------------------------+
```

### Passo a Passo de uma Venda:
1. Abra o menu **POS / Vendas**.
2. Adicione os itens ao carrinho clicando sobre as imagens ou lendo os códigos com o leitor de código de barras.
3. Se necessário, altere a quantidade clicando no botão `+` ou `-` ao lado do item.
4. Clique no botão de método de pagamento (ex: **Dinheiro** ou **M-Pesa**).
5. Se for em dinheiro, digite a quantia entregue pelo cliente; o ecrã mostra de imediato o **Troco a Devolver**.
6. Clique no botão verde **"Concluir Venda"** (ou pressione a tecla `F10`).
7. O recibo térmico é gerado instantaneamente e enviado para a impressora.

---

## 3.2 Identificação de Cliente & Emissão com NUIT
Se o cliente necessitar de fatura formal para a sua contabilidade com NUIT:
1. No topo direito do carrinho de compras, clique em **"Alterar Cliente"**.
2. Pesquise pelo nome ou NUIT do cliente já registado.
3. Se for um cliente novo, clique em **"+ Novo Cliente"**, insira o Nome e o NUIT (9 dígitos) e clique em **"Gravar & Selecionar"**.
4. A fatura será emitida em conformidade legal com os dados da empresa compradora.

---

## 3.3 Aplicação de Descontos e Promoções
O sistema permite descontos por percentagem ou valor fixo:
* **Desconto no Item:** Clique sobre o produto no carrinho e selecione a percentagem de desconto autorizada (ex: `5%` ou `10%`).
* **Desconto Global:** No rodapé do carrinho, clique em **"Adicionar Desconto Geral"** e digite o montante em Meticais.
* O cálculo do IVA é recalculado automaticamente sobre a base tributável líquida de desconto.

---

## 3.4 Métodos de Pagamento (Dinheiro, Cartão/POS, M-Pesa, e-Mola)
O TiConta v2 suporta múltiplos meios de pagamento moçambicanos numa única venda:
* 💵 **Dinheiro:** Registo em Meticais com apuramento instantâneo do troco.
* 💳 **Cartão Bancário / POS:** Registo do número de aprovação do terminal bancário (BIM, BCI, Standard Bank, Moza, etc.).
* 📱 **M-Pesa (Vodacom):** Registo do código de transação recebido por SMS no telemóvel do operador.
* 📱 **e-Mola (Movitel):** Registo da referência de transferência móvel.
* 🤝 **A Prazo (Conta Corrente):** Regista o débito na conta do cliente para liquidação futura.
* 🔀 **Pagamento Misto / Dividido:** Permite pagar parte em Dinheiro (ex: 500 MT) e o restante via M-Pesa (ex: 1.200 MT).

---

## 3.5 Emissão de Recibos (Térmico ESC/POS, Email, WhatsApp)
Após finalizar a transação, pode disponibilizar o comprovativo em três formatos:
1. **Impressão Térmica:** Envio direto para impressoras de 58mm ou 80mm.
2. **Envio por Email:** Digite o email do cliente para envio automático do PDF fiscal formatado.
3. **Disparo por WhatsApp:** Clique no botão verde do WhatsApp para enviar a fatura digital diretamente para o telemóvel do cliente sem custos de papel.

---

## 3.6 Devoluções, Cancelamentos e Reposição de Stock
Caso ocorra uma devolução ou troca de mercadoria:
1. Aceda a **POS > Histórico de Vendas**.
2. Localize a fatura pelo número de documento (ex: `FT 2026/00142`) ou data.
3. Clique em **"Detalhes da Venda"** e selecione **"Devolver / Anular Venda"**.
4. Indique o motivo da devolução.
5. O sistema credita o valor na conta do cliente ou emite saída de caixa e **recoloca automaticamente as quantidades devolvidas no inventário**.

---

## 3.7 Consulta do Histórico de Vendas Diárias
Para acompanhar o andamento das vendas no turno corrente:
* No ecrã do POS, clique no botão superior **"Resumo do Dia"**.
* Visualize o total faturado, número de clientes atendidos, total de IVA liquidado e divisão por modalidade (Dinheiro, M-Pesa, Cartão).

---

# 4. GESTÃO DE CLIENTES & CRM COMERCIAL

## 4.1 Cadastro e Edição de Clientes
Mantenha uma base de dados centralizada dos seus parceiros de negócio:
1. Aceda ao menu **CRM / Clientes > Novo Cliente**.
2. Preencha os detalhes:
   * **Nome / Razão Social:** Nome do cliente ou empresa.
   * **NUIT:** Número fiscal.
   * **Telefone / WhatsApp:** Contacto principal com indicativo (ex: `+258 84 123 4567`).
   * **E-mail:** Endereço de correio eletrónico.
   * **Endereço e Cidade:** Local de entrega ou faturação.
   * **Limite de Crédito:** Teto máximo de vendas a prazo autorizado para este cliente.
3. Clique em **"Gravar Cliente"**.

---

## 4.2 Ficha Completa 360º do Cliente (Histórico, Débitos e Saldo)
Ao clicar sobre o nome de qualquer cliente na lista, obtém a sua ficha completa:
* 📊 **Saldo de Conta Corrente:** Total de faturas em aberto e valor pendente de liquidação.
* 🛍️ **Histórico de Compras:** Lista de todas as faturas, produtos habituais e datas de transação.
* 📞 **Registo de Interações:** Histórico de reuniões, telefonemas e cotações enviadas.

---

## 4.3 Funil Comercial & Pipeline de Oportunidades
Transforme orçamentos em vendas através do funil comercial:
* Aceda a **CRM > Funil de Vendas**.
* Acompanhe o valor total em negociação e a probabilidade de fecho ponderada da equipa comercial.

---

## 4.4 Quadro Kanban de Leads (Novo → Proposta → Ganho/Perdido)
Acompanhe os negócios arrastando cartões entre colunas visuais:

```
+------------------+  +------------------+  +------------------+  +------------------+
| NOVO LEAD        |  | PROPOSTA ENVIADA |  | EM NEGOCIAÇÃO    |  | GANHO (FECHADO)  |
+------------------+  +------------------+  +------------------+  +------------------+
| 🔹 Obra Matola   |  | 🔹 Móveis Escrit |  | 🔹 Janelas Alum. |  | 🏆 Hotel Beira   |
| Cliente: João M. |  | Cliente: Sede BCI|  | Cliente: Carlos  |  | Valor: 450.000 MT|
| Valor: 120.000 MT|  | Valor: 85.000 MT |  | Valor: 35.000 MT |  |                  |
+------------------+  +------------------+  +------------------+  +------------------+
```

* Para avançar uma oportunidade, basta **arrastar o cartão** para a coluna seguinte.
* Ao arrastar para a coluna **Ganho**, o sistema pergunta se deseja gerar imediatamente a Fatura ou Projeto no ERP.

---

## 4.5 Histórico de Contactos, Notas e Follow-ups
* Em cada oportunidade de negócio, adicione notas rápidas (ex: *"Cliente pediu revisão de preços no frete até sexta-feira"*).
* Defina um lembrete com data e hora para que o sistema notifique a equipa comercial sobre a data do telefonema ou visita.

---

# 5. GESTÃO FINANCEIRA & TESOURARIA

## 5.1 Registo de Despesas e Saídas de Caixa
Controle rigorosamente para onde vai cada Metical da empresa:
1. Aceda a **Financeiro > Despesas > Registar Despesa**.
2. Preencha os campos:
   * **Descrição:** Motivo do gasto (ex: *Combustível para viatura de entrega*).
   * **Valor (MZN):** Montante pago.
   * **Categoria:** Rendas, Salários, Energia/Água, Combustível, Manutenção, Matérias-primas.
   * **Forma de Pagamento:** Caixa Dinheiro, Conta Bancária BIM, Conta M-Pesa da Empresa.
   * **Fornecedor:** Selecione ou crie o fornecedor.
   * **Anexo / Recibo:** Fotografe o recibo físico ou anexe o ficheiro PDF.
3. Clique em **"Gravar Despesa"**.

---

## 5.2 Plano de Categorias de Gastos
Pode personalizar a estrutura de categorias para refletir a realidade do seu ramo de atividade em **Financeiro > Categorias**.

---

## 5.3 Abertura e Fecho Diário de Caixa (Tolerância e Quebras)
Para garantir a integridade dos operadores de balcão:
1. **Abertura de Caixa:** No início do dia, o operador indica o fundo de maneio inicial (troco em notas e moedas, ex: `2.000,00 MT`).
2. **Ao Longo do Dia:** Todas as entradas de vendas e sangrias (saídas) são registadas automaticamente.
3. **Fecho de Caixa (Fim de Turno):**
   * O operador conta fisicamente as notas e moedas e digita o total apurado.
   * O sistema compara o valor físico com o saldo esperado do sistema e emite o **Relatório de Fecho com Apuramento de Quebras ou Sobras**.

---

## 5.4 Reconciliação Bancária & Extratos de Contas
1. Aceda a **Financeiro > Reconciliação Bancária**.
2. Selecione a conta bancária da empresa.
3. Marque os lançamentos bancários correspondentes às faturas recebidas ou pagamentos a fornecedores.
4. O saldo contabilístico do ERP fica perfeitamente alinhado com o extrato real do banco.

---

## 5.5 Relatórios de Fluxo de Caixa
Visualize o gráfico de **Entradas vs. Saídas** diárias, semanais e mensais para antecipar necessidades de tesouraria antes do pagamento de salários e fornecedores.

---

# 6. CONTABILIDADE GERAL (PGC-NIRF MOÇAMBIQUE)

## 6.1 Estrutura do Plano Geral de Contas (Classes 1 a 7)
O TiConta v2 incorpora a taxonomia oficial do **Plano Geral de Contabilidade baseado nas Normas Internacionais de Relato Financeiro (PGC-NIRF)**:

```
 🇲🇿 ESTRUTURA DO PLANO DE CONTAS PGC-NIRF
 ├── CLASSE 1: MEIOS FINANCEIROS (Caixa, Depósitos à Ordem, Depósitos a Prazo)
 ├── CLASSE 2: INVENTÁRIOS (Mercadorias, Matérias-Primas, Produtos Acabados)
 ├── CLASSE 3: INVESTIMENTOS DE CAPITAL (Equipamentos, Imóveis, Viaturas)
 ├── CLASSE 4: CONTAS A RECEBER E A PAGAR (Clientes, Fornecedores, Estado/Fisco)
 ├── CLASSE 5: CAPITAL PRÓPRIO (Capital Social, Reservas Legais, Resultados Transitados)
 ├── CLASSE 6: GASTOS E PERDAS (Custo das Mercadorias Vendidas, Fornecimentos e Serviços)
 └── CLASSE 7: RENDIMENTOS E GANHOS (Vendas de Bens, Prestação de Serviços, Juros)
```

---

## 6.2 Lançamentos em Partida Dobrada (Débito vs. Crédito)
* **Lançamentos Automáticos:** Todas as vendas, compras de stock e recebimentos do POS geram automaticamente os respetivos assentos no Diário Contabilístico.
* **Lançamentos Manuais:**
  1. Aceda a **Contabilidade > Diário > Novo Lançamento**.
  2. Indique a Data do Lançamento e o Histórico/Descrição.
  3. Selecione a **Conta a Debitar** e a **Conta a Creditar**.
  4. Digite o valor monetário (a soma dos débitos deve ser estritamente igual à soma dos créditos).
  5. Clique em **"Gravar Lançamento"**.

---

## 6.3 Balancete de Verificação (Trial Balance)
Gere o balancete oficial mensal ou anual:
* Aceda a **Contabilidade > Balancete**.
* Selecione o período pretendido.
* Visualize para cada conta: Saldo Inicial, Movimento a Débito, Movimento a Crédito e Saldo Final Devedor/Credor.
* Exportação direta em PDF com cabeçalho formal para auditoria e arquivo.

---

## 6.4 Demonstração de Resultados do Exercício (DRE)
Apresenta o apuramento económico da empresa:
* **(+) Vendas Líquidas de Bens e Serviços**
* **(-) Custo das Mercadorias Vendidas e Matérias Consumidas (CMVMC)**
* **(=) Margem Bruta Operacional**
* **(-) Fornecimentos e Serviços de Terceiros (FST)**
* **(-) Gastos com o Pessoal (Salários + Encargos INSS)**
* **(=) Resultado Operacional (EBITDA)**
* **(-) Depreciações e Gastos Financeiros**
* **(=) Resultado Antes de Impostos (RAI)**
* **(-) Estimativa de Imposto sobre o Rendimento (IRPC)**
* **(=) RESULTADO LÍQUIDO DO EXERCÍCIO**

---

## 6.5 Balanço Patrimonial Oficial
Apresenta a posição financeira da empresa numa determinada data:
* **Ativo Total:** Ativo Não Corrente (Equipamentos, Instalações) + Ativo Corrente (Caixa, Bancos, Clientes, Inventários).
* **Passivo Total:** Dívidas a Fornecedores, Financiamentos Bancários e Obrigações Fiscais/Trabalhistas (IVA e INSS a Pagar).
* **Capital Próprio:** Capital Social e Resultados Acumulados.

---

# 7. GESTÃO DE PROJETOS, OBRAS & SERVIÇOS

## 7.1 Criação de Obras e Parametrização Orçamental
Ideal para empresas de construção, serralharias, marcenarias, prestadores de serviços de TI e consultoria:
1. Aceda a **Projetos / Obras > Nova Obra**.
2. Insira o Nome da Empreitada (ex: *Construção de Moradia T4 - Sommerschield*).
3. Selecione o Cliente associado.
4. Defina a Data de Início, Prazo de Conclusão e o **Orçamento Global Aprovado (MZN)**.
5. Clique em **"Criar Projeto"**.

---

## 7.2 Gestão de Tarefas & Milestones (To Do, In Progress, Done)
* Crie a lista de tarefas da obra (ex: *Fundações*, *Alvenaria*, *Instalação Elétrica*, *Pintura*, *Acabamentos*).
* Atribua cada tarefa a um encarregado de equipa com data limite de entrega.
* Acompanhe a percentagem de progresso físico da obra.

---

## 7.3 Imputação Direta de Custos e Materiais à Obra
Sempre que comprar material ou pagar diárias de mão-de-obra:
1. Ao registar a despesa ou saída de material do armazém, selecione o **Projeto de Destino**.
2. O valor é debitado imediatamente na conta corrente da obra, atualizando o custo real acumulado.

---

## 7.4 Alertas Automáticos de Desvio Orçamental
O TiConta v2 monitoriza a saúde financeira da empreitada:
* 🟢 **Verde (0% a 70%):** Gastos dentro da margem de segurança prevista.
* 🟡 **Amarelo (71% a 90%):** Atenção requerida; custos a aproximarem-se do limite contratado.
* 🔴 **Vermelho (> 90% ou Acima de 100%):** Alerta crítico de derrapagem orçamental com notificação na dashboard da gerência.

---

## 7.5 Relatório de Rentabilidade por Empreitada
Gere o mapa comparativo de **Preço Cobrado ao Cliente vs. Custos Reais (Materiais + Mão-de-Obra + Subempreiteiros)** para conhecer a margem de lucro líquido exata da obra.

---

# 8. RECURSOS HUMANOS & SALÁRIOS (INSS & IRPS)

## 8.1 Registo Completo de Colaboradores
1. Aceda a **Recursos Humanos > Colaboradores > Novo Colaborador**.
2. Preencha os dados:
   * **Identificação:** Nome Completo, Data de Nascimento, BI e NUIT.
   * **Segurança Social:** Número de Beneficiário do **INSS**.
   * **Contrato & Cargo:** Função desempenhada, Departamento, Data de Admissão.
   * **Remuneração:** Vencimento Base Mensal, Subsídio de Transporte, Alimentação ou Habitação.
   * **Dados Bancários:** Banco e NIB / Número de Conta para transferência de ordenado.
3. Clique em **"Guardar Ficha"**.

---

## 8.2 Controlo de Assiduidade e Faltas (Attendance)
* No submenu **Presenças / Assiduidade**, registe diariamente as presenças, faltas justificadas, faltas injustificadas e horas extraordinárias de cada colaborador.
* As faltas injustificadas abatem proporcionalmente na remuneração mensal no momento do processamento.

---

## 8.3 Processamento Automático de Salários
1. Aceda a **Recursos Humanos > Processamento Salarial**.
2. Selecione o Mês e Ano de Competência (ex: *Agosto de 2026*).
3. Clique no botão **"Processar Folha do Mês"**.
4. O motor de cálculo calcula em segundos todos os valores brutos, deduções legais e montantes líquidos.

---

## 8.4 Cálculos de INSS (3% Trabalhador + 4% Patronal) e Retenção IRPS
O sistema aplica a legislação laboral e fiscal moçambicana em vigor:

```
 +---------------------------------------------------------------------------------+
 |  EXEMPLO DE CÁLCULO SALARIAL INDIVIDUAL (MZN)                                   |
 |  Colaborador: Alberto Guambe | Salário Base: 25.000,00 MT                       |
 +---------------------------------------------------------------------------------+
 |  (+) Salário Base Bruto:                                           25.000,00 MT |
 |  (-) Desconto INSS Trabalhador (3%):                                  750,00 MT |
 |  (-) Retenção na Fonte IRPS (Tabela Progressiva):                   2.125,00 MT |
 |  ------------------------------------------------------------------------------ |
 |  (=) SALÁRIO LÍQUIDO A RECEBER:                                    22.125,00 MT |
 |                                                                                 |
 |  ENCARGO DA EMPRESA:                                                            |
 |  (+) Contribuição Patronal INSS (4%):                               1.000,00 MT |
 |  TOTAL A PAGAR AO INSS (3% + 4% = 7%):                              1.750,00 MT |
 +---------------------------------------------------------------------------------+
```

---

## 8.5 Emissão de Recibos de Vencimento e Mapas para Banco
Com a folha aprovada:
* **Recibos Individuais:** Imprima ou envie por email os recibos de vencimento em formato A4 ou meia-folha.
* **Ficheiro de Transferência Bancária:** Exporte o mapa de remunerações com NIB e valores para envio direto ao seu banco comercial.
* **Guia de Pagamento INSS:** Exportação do mapa mensal com a discriminação dos 7% pronta para entrega na delegação do INSS.

---

# 9. RELATÓRIOS & ANÁLISE DE NEGÓCIO

## 9.1 Relatórios Pré-definidos de Vendas, Fisco e Stock
O TiConta v2 disponibiliza dezenas de relatórios prontos a usar no menu **Relatórios**:
* 📈 **Relatório de Vendas:** Vendas por período, por loja/filial, por operador de caixa e por método de pagamento.
* 📦 **Relatório de Inventário:** Valor total de stock ao preço de custo e venda, produtos com stock abaixo do mínimo e ficha de movimentos de armazém.
* 🏛️ **Relatório Fiscal de IVA (Modelo A):** Apuramento do IVA Liquidado nas vendas e IVA Dedutível nas compras para preenchimento da declaração periódica.
* 👥 **Extrato de Clientes:** Listagem de faturas vencidas e contas correntes de clientes em atraso.

---

## 9.2 Filtros Avançados e Segmentação por Período
Em qualquer ecrã de relatórios:
* Utilize o seletor de datas: *Hoje*, *Esta Semana*, *Este Mês*, *Último Trimestre*, *Ano Corrente* ou *Intervalo Personalizado*.
* Filtre por categorias de produtos, clientes específicos ou centros de custo.

---

## 9.3 Exportação em Massa (PDF, Excel .xlsx e CSV)
Todos os dados e mapas do ERP podem ser descarregados nos seguintes formatos:
* 📄 **PDF:** Documento formatado com o logótipo da sua empresa, ideal para impressão ou envio por email.
* 📊 **Excel (.xlsx):** Ficheiro estruturado com fórmulas para análise financeira avançada e cruzamento de dados.
* 📁 **CSV:** Ficheiro de texto padrão para importação noutros softwares ou bases de dados externas.

---

## 9.4 Agendamento Automático de Relatórios por Email
No menu **Relatórios > Agendamentos**, pode configurar para que a gerência receba todos os domingos à noite ou no 1º dia de cada mês o resumo consolidado de vendas e caixa diretamente na caixa de correio eletrónico.

---

# 10. DEFINIÇÕES, SEGURANÇA & CÓPIAS DE SEGURANÇA

## 10.1 Gestão de Perfis de Acesso e Permissões
Proteja os dados sensíveis da empresa configurando quem tem permissão para:
* Consultar relatórios de lucro e margem bruta.
* Aplicar descontos acima de 10%.
* Anular faturas já emitidas.
* Visualizar os salários dos colaboradores.

---

## 10.2 Ativação e Renovação de Licença TiConta v2
O TiConta v2 opera através de uma chave de ativação criptográfica offline:
1. Aceda a **Definições > Licenciamento**.
2. Verifique o estado atual do plano (**BÁSICO**, **PROFISSIONAL**, **COMPLETO** ou **ENTERPRISE**) e os dias restantes.
3. Para ativar ou renovar: Cole a chave fornecida pela Carpintaria Digital (ex: `TIC-MZ4001-COMP-270815-9E2F1A8C03`) e clique em **"Ativar Licença"**.
4. O sistema valida os módulos e desbloqueia os recursos de imediato.

---

## 10.3 Cópias de Segurança (Backup Manual e Restauro)
Para assegurar a salvaguarda dos seus dados contra avarias de hardware:
* **Descarregar Cópia de Segurança:** Em **Definições > Sistema > Cópias de Segurança**, clique em **"Criar Backup Agora"**. Um ficheiro comprimido `.sql.gz` é descarregado para o seu computador.
* **Restauro de Dados:** Em caso de troca de computador, utilize o script `scripts/restore-database.sh` ou a interface web para carregar o ficheiro de backup e restaurar 100% dos dados fiscais e operacionais.

---

## 10.4 Segurança, PIN de Acesso e Auditoria
* 🔒 **Bloqueio de Ecrã:** Pressione `Alt + L` a qualquer momento para bloquear o ecrã do POS quando se ausentar do balcão.
* 📜 **Trilha de Auditoria (Audit Log):** O sistema regista detalhadamente quem acedeu, quem alterou preços, quem anulou documentos, data, hora e endereço IP em conformidade com as normas ISO 27001.

---

# 11. MODO OFFLINE & MOTOR DE SINCRONIZAÇÃO

## 11.1 Como Funciona a Operação Sem Internet
O TiConta v2 utiliza uma base de dados local de alta velocidade no próprio navegador (**IndexedDB / Dexie.js**). Quando a internet cai:
1. A interface permanece 100% responsiva sem qualquer atraso.
2. Pode emitir 500 ou 1.000 faturas consecutivas em modo offline.
3. As faturas recebem numeração sequencial segura e carimbo cronológico monotónico.

---

## 11.2 Indicadores de Estado da Ligação
No canto superior direito do ecrã, o indicador visual informa o estado da ligação:
* 🟢 **Verde (Online):** Conectado ao servidor principal; sincronização em tempo real ativa.
* 🟠 **Laranja (Modo Offline):** Sem ligação à rede; todas as operações estão a ser guardadas em segurança no dispositivo local.
* 🔄 **Azul (A Sincronizar):** Ligação restabelecida; a descarregar e carregar pacotes de dados pendentes.

---

## 11.3 Fila de Sincronização Local (IndexedDB)
* Todas as vendas e cadastros efetuados offline entram numa **Fila de Sincronização Criptografada**.
* Pode clicar no ícone de sincronização a qualquer momento para ver quantas operações aguardam transmissão.

---

## 11.4 Resolução Automática de Conflitos
Se dois operadores em caixas diferentes venderem o mesmo produto em simultâneo enquanto ambos estiverem offline, o motor de sincronização do TiConta v2 aplica regras de reconciliação baseadas em relógio vetorial (*Vector Clocks*) e carimbo de servidor, garantindo que o saldo final de inventário e contabilidade permanece perfeitamente consistente sem duplicações.

---

# 12. MÓDULOS & FUNCIONALIDADES PREMIUM

## 12.1 Envio Digital por WhatsApp e SMS (Twilio Integration)
Elimine o desperdício com bobinas de papel e preste um serviço moderno aos seus clientes:
* **Como Ativar:** Em **Definições > Funcionalidades Premium**, ative a opção **"Disparo WhatsApp / SMS"**.
* **Como Funciona:** No fecho de cada venda ou orçamento, clique em **"Enviar WhatsApp"**. O cliente recebe uma mensagem personalizada com link seguro para abrir e guardar o PDF da fatura oficial.

---

## 12.2 Leitor de Códigos de Barras por Câmara e Hardware
* **Pistolas Leitoras USB / Bluetooth:** Plug-and-play sem necessidade de configuração.
* **Leitor por Câmara Web / Telemóvel:** Clique no ícone de código de barras no topo do POS para abrir a câmara do telemóvel ou tablet. Aponte para a embalagem e o produto é adicionado de imediato ao carrinho.

---

## 12.3 Acesso à API REST para Integrações Externas
Para empresas de grande dimensão que pretendam ligar o TiConta v2 a lojas online (WooCommerce, Shopify), portais de clientes ou software de terceiros, a API RESTful disponibiliza endpoints seguros com documentação Swagger em `/docs`.

---

# 13. DICAS PRÁTICAS & RECOMENDAÇÕES

1. 💡 **Efetue Cópias de Segurança Semanais:** Guarde sempre uma cópia do ficheiro de backup numa pen-drive USB ou num disco externo fora do estabelecimento comercial.
2. 💡 **Mantenha os Preços de Custo Atualizados:** Ao dar entrada de mercadorias no armazém, atualize o custo de compra para que os relatórios de margem de lucro e DRE reflitam a inflação real.
3. 💡 **Faça a Reconciliação de Caixa Diariamente:** Não deixe acumular fechos de caixa de vários dias. O fecho diário evita perdas e identifica desvios de troco no próprio dia.
4. 💡 **Treine a Equipa no Modo Offline:** Mostre aos operadores de caixa que não precisam de entrar em pânico quando a internet cair; o sistema continua a faturar normalmente.
5. 💡 **Utilize Perfis com Permissões Restritas:** Não forneça a palavra-passe de Administrador aos operadores de caixa. Utilize o perfil *Cashier* para balcão e *Accountant* para a contabilidade.

---

# 14. RESOLUÇÃO DE PROBLEMAS (TROUBLESHOOTING & FAQ)

### ❓ Esqueci o meu PIN de acesso ao sistema. O que devo fazer?
**Resposta:** Qualquer utilizador com perfil de **Administrador** pode aceder a **Definições > Utilizadores**, selecionar o seu nome e redefinir o PIN de acesso em menos de 10 segundos. Se o administrador mestre tiver esquecido o PIN, execute o script de recuperação no servidor ou contacte o suporte técnico.

### ❓ A impressora de recibos não imprime ou imprime caracteres estranhos.
**Resposta:**
1. Verifique se o cabo USB da impressora está bem conectado e se a bobina de papel tem o lado térmico virado para cima.
2. Nas definições de impressão do navegador, defina as margens como **"Nenhuma"** (*None*) e certifique-se de que a escala está a **100%**.
3. Selecione o formato correto (58mm ou 80mm).

### ❓ A minha licença expirou. Os meus dados foram apagados?
**Resposta:** **Não!** O TiConta v2 nunca apaga os seus dados fiscais ou históricos. Quando a licença expira, o sistema entra em *Modo de Consulta*: pode visualizar e exportar todos os relatórios, faturas e clientes anteriores. Para voltar a emitir novas faturas, basta inserir a nova chave de renovação em **Definições > Licenciamento**.

### ❓ A aplicação está a funcionar muito lenta no computador do caixa.
**Resposta:**
1. No navegador Google Chrome, limpe os ficheiros temporários em *Definições > Privacidade e Segurança > Limpar Dados de Navegação (Caches)*.
2. Reinicie o computador para libertar memória RAM.
3. Certifique-se de que não tem dezenas de outros programas pesados abertos em segundo plano.

### ❓ Um produto lido pelo código de barras não é encontrado.
**Resposta:** Aceda a **Produtos / Estoque**, localize o artigo e confirme se o número de código de barras gravado no campo **Código de Barras / SKU** coincide exatamente com os dígitos da embalagem.

---

# 15. CONTACTOS, SUPORTE TÉCNICO & FORMAÇÃO

A equipa de engenharia e suporte da **Carpintaria Digital** está à sua inteira disposição para apoio na parametrização, formação de operadores e esclarecimento de dúvidas contabilísticas e fiscais:

* 📧 **E-mail de Suporte Técnico:** [suporte@ticonta.co.mz](mailto:suporte@ticonta.co.mz) / [support@carpintaria-digital.com](mailto:support@carpintaria-digital.com)
* 💬 **WhatsApp de Atendimento Rápido:** [+258 84 123 4567](https://wa.me/258841234567)
* 📞 **Linha Telefónica de Apoio ao Cliente:** +258 21 000 000 / +258 84 123 4567
* 🌐 **Portal do Utilizador & Fórum:** [https://community.ticonta.digital](https://community.ticonta.digital)
* 🏢 **Escritório Central:** Av. 24 de Julho, Edifício Maputo Business Center, Maputo — Moçambique
* ⏰ **Horário de Atendimento:** Segunda a Sexta das 07:30 às 18:00 | Sábados das 08:00 às 13:00 (Suporte de Emergência 24/7 para clientes nos planos *Completo* e *Enterprise*).

---

<div align="center">

**TiConta v2 — O ERP Feito por Moçambicanos para as Empresas de Moçambique 🇲🇿**  
*Obrigado pela confiança no nosso software de gestão.*

</div>
