-- ==============================================================================
-- TiConta v2 ERP - Schema D1 (Cloudflare SQLite Relational DB)
-- Moçambique Compliance: IVA 16%, PGC-NIRF, Fiado, POS e Licenciamento
-- ==============================================================================

-- 1. Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS utilizadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hash_password TEXT NOT NULL,
    plano TEXT DEFAULT 'basic' CHECK (plano IN ('basic', 'professional', 'complete', 'enterprise')),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    nuit TEXT,
    telefone TEXT,
    email TEXT,
    saldo_fiado REAL DEFAULT 0.0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);

-- 3. Tabela de Produtos / Catálogo de Estoque
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    codigo_barras TEXT,
    preco REAL NOT NULL DEFAULT 0.0,
    stock REAL NOT NULL DEFAULT 0.0,
    iva_incluso INTEGER NOT NULL DEFAULT 1, -- 1 = Sim (16%), 0 = Não
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);

-- 4. Tabela de Vendas / Transações POS
CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cliente_id INTEGER,
    total REAL NOT NULL DEFAULT 0.0,
    iva REAL NOT NULL DEFAULT 0.0,
    metodo_pagamento TEXT NOT NULL DEFAULT 'DINHEIRO', -- DINHEIRO, MPESA, EMOLA, CARTAO, FIADO, MULTIPLO
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- 5. Tabela de Itens de Venda
CREATE TABLE IF NOT EXISTS itens_venda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER NOT NULL,
    produto_id INTEGER,
    quantidade REAL NOT NULL DEFAULT 1.0,
    preco_unit REAL NOT NULL DEFAULT 0.0,
    subtotal REAL NOT NULL DEFAULT 0.0,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
);

-- 6. Tabela de Licenças Criptográficas Offline
CREATE TABLE IF NOT EXISTS licencas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    chave TEXT UNIQUE NOT NULL,
    plano TEXT NOT NULL,
    validade TEXT NOT NULL,
    activa INTEGER NOT NULL DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilizadores(id) ON DELETE CASCADE
);

-- Índices de Otimização para Consultas D1
CREATE INDEX IF NOT EXISTS idx_clientes_user ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_user ON produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_barcode ON produtos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_vendas_user ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_criado_em ON vendas(criado_em);
CREATE INDEX IF NOT EXISTS idx_itens_venda_venda ON itens_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_licencas_user ON licencas(user_id);
