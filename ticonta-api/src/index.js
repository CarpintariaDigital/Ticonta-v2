/**
 * ==============================================================================
 * TiConta v2 - Cloudflare Worker Backend API (D1 + KV + R2)
 * ==============================================================================
 * API REST e motor de conformidade para o TiConta ERP Moçambique
 */

import { generatePDF, getBranding } from "./utils/pdfClient.js";
import {
  calcularIVA,
  calcularIRPS,
  calcularINSS,
  validarNUIT,
  gerarLicenca,
  round2
} from "./fiscal.js";

// Chave secreta padrão para JWT (ou via secret env.JWT_SECRET)
const DEFAULT_JWT_SECRET = "ticonta-jwt-secret-key-production-mozambique-2026";

/**
 * Utilitários de CORS
 */
const ALLOWED_ORIGINS = [
  "https://ticonta.pages.dev",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8000"
];

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".ticonta.pages.dev");
  const allowOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

/**
 * Hashing de senhas com SHA-256 + Salt
 */
async function hashPassword(password, salt = "ticonta-salt-moz") {
  const enc = new TextEncoder();
  const data = enc.encode(`${password}:${salt}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Utilitários de JWT usando Web Crypto HMAC-SHA256
 */
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return atob(str);
}

async function createJWT(payload, secretKey) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBase64 = base64UrlEncode(String.fromCharCode(...signatureArray));

  return `${dataToSign}.${signatureBase64}`;
}

async function verifyJWT(token, secretKey) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signatureBase64] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const binarySignature = base64UrlDecode(signatureBase64);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      enc.encode(dataToSign)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expirado
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Middleware de Autenticação
 */
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  const secret = env.JWT_SECRET || DEFAULT_JWT_SECRET;

  // 1. Validar assinatura criptográfica do JWT
  const payload = await verifyJWT(token, secret);
  if (!payload || !payload.sub) {
    return null;
  }

  // 2. Opcional: verificar no KV de sessões se ainda está ativa
  if (env.SESSIONS) {
    const sessionData = await env.SESSIONS.get(`session:${token}`);
    if (!sessionData) {
      // Sessão foi revogada ou expirou no KV
      return null;
    }
  }

  return payload;
}

/**
 * Router Principal do Cloudflare Worker
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = getCorsHeaders(request);

    // Tratamento de requisições OPTIONS (Preflight CORS)
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // ------------------------------------------------------------------------
      // Rota Pública: Health Check & Status
      // ------------------------------------------------------------------------
      if (path === "/" || path === "/api/health") {
        return jsonResponse(
          {
            sistema: "TiConta v2 API",
            status: "online",
            environment: "cloudflare-workers",
            compliance: "Moçambique PGC-NIRF / IVA 16% / IRPS / INSS",
            timestamp: new Date().toISOString()
          },
          200,
          corsHeaders
        );
      }

      // ------------------------------------------------------------------------
      // Rota Pública: POST /api/auth/login
      // ------------------------------------------------------------------------
      if (path === "/api/auth/login" && method === "POST") {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
          return jsonResponse(
            { error: "Email e password são obrigatórios." },
            400,
            corsHeaders
          );
        }

        const passHash = await hashPassword(password);

        // Buscar utilizador no Cloudflare D1
        let user = null;
        if (env.DB) {
          user = await env.DB.prepare(
            "SELECT id, nome, email, hash_password, plano FROM utilizadores WHERE email = ?"
          )
            .bind(email.toLowerCase().trim())
            .first();
        }

        // Se a base estiver vazia ou usuário de demonstração padrão (admin/1234)
        if (!user && (email === "admin@ticonta.co.mz" || email === "admin_user")) {
          // Criar admin inicial de demonstração no D1
          if (env.DB) {
            await env.DB.prepare(
              "INSERT OR IGNORE INTO utilizadores (id, nome, email, hash_password, plano) VALUES (1, 'Administrador TiConta', 'admin@ticonta.co.mz', ?, 'complete')"
            )
              .bind(passHash)
              .run();

            user = await env.DB.prepare(
              "SELECT id, nome, email, hash_password, plano FROM utilizadores WHERE id = 1"
            ).first();
          } else {
            user = {
              id: 1,
              nome: "Administrador TiConta",
              email: "admin@ticonta.co.mz",
              hash_password: passHash,
              plano: "complete"
            };
          }
        }

        if (!user || user.hash_password !== passHash) {
          return jsonResponse(
            { error: "Credenciais inválidas. Verifique o email e a senha." },
            401,
            corsHeaders
          );
        }

        // Gerar Token JWT com 7 dias de validade
        const nowSec = Math.floor(Date.now() / 1000);
        const expSec = nowSec + 7 * 24 * 60 * 60;
        const payload = {
          sub: user.id,
          nome: user.nome,
          email: user.email,
          plano: user.plano || "basic",
          iat: nowSec,
          exp: expSec
        };

        const secret = env.JWT_SECRET || DEFAULT_JWT_SECRET;
        const token = await createJWT(payload, secret);

        // Guardar sessão no KV com TTL de 7 dias
        if (env.SESSIONS) {
          await env.SESSIONS.put(
            `session:${token}`,
            JSON.stringify({ userId: user.id, email: user.email, plano: user.plano }),
            { expirationTtl: 7 * 24 * 60 * 60 }
          );
        }

        return jsonResponse(
          {
            message: "Autenticação bem sucedida",
            token,
            user: {
              id: user.id,
              nome: user.nome,
              email: user.email,
              plano: user.plano
            },
            expiresIn: 7 * 24 * 60 * 60
          },
          200,
          corsHeaders
        );
      }

      // ========================================================================
      // MIDDLEWARE DE AUTENTICAÇÃO OBRIGATÓRIA PARA AS DEMAIS ROTAS
      // ========================================================================
      const authUser = await authenticateRequest(request, env);
      if (!authUser) {
        return jsonResponse(
          { error: "Não autorizado. Token de autenticação ausente ou inválido." },
          401,
          corsHeaders
        );
      }

      const userId = authUser.sub;

      // ------------------------------------------------------------------------
      // Rota: POST /api/auth/logout
      // ------------------------------------------------------------------------
      if (path === "/api/auth/logout" && method === "POST") {
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.substring(7).trim();

        if (env.SESSIONS && token) {
          await env.SESSIONS.delete(`session:${token}`);
        }

        return jsonResponse(
          { message: "Sessão terminada com sucesso." },
          200,
          corsHeaders
        );
      }

      // ------------------------------------------------------------------------
      // Rotas de Produtos: GET e POST /api/produtos
      // ------------------------------------------------------------------------
      if (path === "/api/produtos") {
        if (method === "GET") {
          if (!env.DB) {
            return jsonResponse([], 200, corsHeaders);
          }

          const { results } = await env.DB.prepare(
            "SELECT * FROM produtos WHERE user_id = ? ORDER BY id DESC"
          )
            .bind(userId)
            .all();

          return jsonResponse(results || [], 200, corsHeaders);
        }

        if (method === "POST") {
          const body = await request.json();
          const { nome, codigo_barras, preco, stock, iva_incluso } = body;

          if (!nome || preco === undefined) {
            return jsonResponse(
              { error: "Nome e preço do produto são campos obrigatórios." },
              400,
              corsHeaders
            );
          }

          if (!env.DB) {
            return jsonResponse(
              { error: "Base de dados D1 não vinculada." },
              500,
              corsHeaders
            );
          }

          const result = await env.DB.prepare(
            `INSERT INTO produtos (user_id, nome, codigo_barras, preco, stock, iva_incluso)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
            .bind(
              userId,
              String(nome).trim(),
              codigo_barras ? String(codigo_barras).trim() : null,
              Number(preco) || 0,
              Number(stock) || 0,
              iva_incluso !== undefined ? (iva_incluso ? 1 : 0) : 1
            )
            .run();

          return jsonResponse(
            {
              message: "Produto criado com sucesso",
              id: result.meta?.last_row_id || null,
              produto: {
                user_id: userId,
                nome,
                codigo_barras,
                preco: Number(preco),
                stock: Number(stock),
                iva_incluso: iva_incluso ? 1 : 0
              }
            },
            201,
            corsHeaders
          );
        }
      }

      // ------------------------------------------------------------------------
      // Rotas de Clientes: GET e POST /api/clientes
      // ------------------------------------------------------------------------
      if (path === "/api/clientes") {
        if (method === "GET") {
          if (!env.DB) {
            return jsonResponse([], 200, corsHeaders);
          }

          const { results } = await env.DB.prepare(
            "SELECT * FROM clientes WHERE user_id = ? ORDER BY nome ASC"
          )
            .bind(userId)
            .all();

          return jsonResponse(results || [], 200, corsHeaders);
        }

        if (method === "POST") {
          const body = await request.json();
          const { nome, nuit, telefone, email, saldo_fiado } = body;

          if (!nome) {
            return jsonResponse(
              { error: "Nome do cliente é obrigatório." },
              400,
              corsHeaders
            );
          }

          if (nuit && !validarNUIT(nuit)) {
            return jsonResponse(
              { error: "NUIT inválido. O NUIT de Moçambique deve conter exatamente 9 dígitos." },
              400,
              corsHeaders
            );
          }

          if (!env.DB) {
            return jsonResponse(
              { error: "Base de dados D1 não vinculada." },
              500,
              corsHeaders
            );
          }

          const result = await env.DB.prepare(
            `INSERT INTO clientes (user_id, nome, nuit, telefone, email, saldo_fiado)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
            .bind(
              userId,
              String(nome).trim(),
              nuit ? String(nuit).trim() : null,
              telefone ? String(telefone).trim() : null,
              email ? String(email).trim() : null,
              Number(saldo_fiado) || 0.0
            )
            .run();

          return jsonResponse(
            {
              message: "Cliente registado com sucesso",
              id: result.meta?.last_row_id || null,
              cliente: {
                user_id: userId,
                nome,
                nuit,
                telefone,
                email,
                saldo_fiado: Number(saldo_fiado) || 0.0
              }
            },
            201,
            corsHeaders
          );
        }
      }

      // ------------------------------------------------------------------------
      // Rotas de Vendas: POST e GET /api/vendas
      // ------------------------------------------------------------------------
      if (path === "/api/vendas") {
        if (method === "POST") {
          const body = await request.json();
          const { cliente_id, total, iva, metodo_pagamento, itens } = body;

          if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return jsonResponse(
              { error: "A venda deve conter pelo menos 1 item." },
              400,
              corsHeaders
            );
          }

          if (!env.DB) {
            return jsonResponse(
              { error: "Base de dados D1 não vinculada." },
              500,
              corsHeaders
            );
          }

          // Calcular total e IVA se não enviados
          let totalCalculado = 0;
          for (const item of itens) {
            const sub = (Number(item.quantidade) || 1) * (Number(item.preco_unit) || 0);
            totalCalculado += sub;
          }

          const valorTotal = total !== undefined ? Number(total) : round2(totalCalculado);
          const ivaCalculo = iva !== undefined ? Number(iva) : calcularIVA(valorTotal, 16, true).iva16pct;
          const metodoPag = metodo_pagamento || "DINHEIRO";

          // Inserir Cabeçalho da Venda no D1
          const vendaResult = await env.DB.prepare(
            `INSERT INTO vendas (user_id, cliente_id, total, iva, metodo_pagamento)
             VALUES (?, ?, ?, ?, ?)`
          )
            .bind(userId, cliente_id || null, valorTotal, ivaCalculo, metodoPag)
            .run();

          const vendaId = vendaResult.meta?.last_row_id;

          // Inserir Itens e Atualizar Estoque
          for (const it of itens) {
            const qtd = Number(it.quantidade) || 1;
            const precoUnit = Number(it.preco_unit) || 0;
            const subtotal = round2(qtd * precoUnit);

            if (vendaId) {
              await env.DB.prepare(
                `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unit, subtotal)
                 VALUES (?, ?, ?, ?, ?)`
              )
                .bind(vendaId, it.produto_id || null, qtd, precoUnit, subtotal)
                .run();

              // Abater estoque se produto_id for fornecido
              if (it.produto_id) {
                await env.DB.prepare(
                  "UPDATE produtos SET stock = MAX(0, stock - ?) WHERE id = ? AND user_id = ?"
                )
                  .bind(qtd, it.produto_id, userId)
                  .run();
              }
            }
          }

          // Se a venda for FIADO / Crédito, atualizar saldo devedor do cliente
          if (metodoPag.toUpperCase() === "FIADO" && cliente_id) {
            await env.DB.prepare(
              "UPDATE clientes SET saldo_fiado = saldo_fiado + ? WHERE id = ? AND user_id = ?"
            )
              .bind(valorTotal, cliente_id, userId)
              .run();
          }

          return jsonResponse(
            {
              message: "Venda registada com sucesso",
              venda_id: vendaId,
              total: valorTotal,
              iva: ivaCalculo,
              metodo_pagamento: metodoPag,
              itens_count: itens.length
            },
            201,
            corsHeaders
          );
        }

        if (method === "GET") {
          if (!env.DB) {
            return jsonResponse([], 200, corsHeaders);
          }

          const clienteIdParam = url.searchParams.get("cliente_id");
          const metodoParam = url.searchParams.get("metodo_pagamento");
          const limitParam = parseInt(url.searchParams.get("limit") || "50", 10);

          let query = "SELECT * FROM vendas WHERE user_id = ?";
          const params = [userId];

          if (clienteIdParam) {
            query += " AND cliente_id = ?";
            params.push(clienteIdParam);
          }

          if (metodoParam) {
            query += " AND metodo_pagamento = ?";
            params.push(metodoParam);
          }

          query += " ORDER BY id DESC LIMIT ?";
          params.push(limitParam);

          const { results } = await env.DB.prepare(query)
            .bind(...params)
            .all();

          return jsonResponse(results || [], 200, corsHeaders);
        }
      }

      // ------------------------------------------------------------------------
      // Rota Fiscal: POST /api/fiscal/iva
      // ------------------------------------------------------------------------
      if (path === "/api/fiscal/iva" && method === "POST") {
        const body = await request.json();
        const { valor, taxa, incluso, tipo, dependentes } = body;

        if (tipo === "irps" || tipo === "irt") {
          const resultado = calcularIRPS(valor, dependentes || 0);
          return jsonResponse(resultado, 200, corsHeaders);
        }

        if (tipo === "inss") {
          const resultado = calcularINSS(valor);
          return jsonResponse(resultado, 200, corsHeaders);
        }

        // Padrão: Cálculo de IVA 16% Moçambique
        const resultadoIVA = calcularIVA(valor, taxa || 16, incluso || false);
        return jsonResponse(resultadoIVA, 200, corsHeaders);
      }

      // ------------------------------------------------------------------------
      
      // ------------------------------------------------------------------------
      // Rota de Geração de PDFs: POST /api/v1/documents/generate ou /api/documents/generate
      // ------------------------------------------------------------------------
      if ((path === "/api/v1/documents/generate" || path === "/api/documents/generate") && method === "POST") {
        const payload = await request.json();

        // Se não vier branding no payload, tenta ler do KV automaticamente
        if (!payload.branding || !payload.branding.primary_color) {
          const nuit = payload.client?.nuit || payload.document?.company_nuit || payload.branding?.nuit || authUser?.nuit || "400123456";
          try {
            if (nuit && (env.KV || env.TICONTA_KV || env.CACHE)) {
              payload.branding = await getBranding(env, nuit);
            }
          } catch (e) {
            // Se não encontrar no KV, usar fallback padrão Carpintaria / TiConta
            if (!payload.branding) {
              payload.branding = {
                company_name: "TiConta ERP",
                primary_color: "#1A365D",
                secondary_color: "#DD6B20",
                nuit: nuit
              };
            }
          }
        }

        const result = await generatePDF(payload);
        return jsonResponse(result, 200, corsHeaders);
      }

      // ------------------------------------------------------------------------
      // Rota de Branding: POST /api/v1/branding/save ou /api/branding/save
      // ------------------------------------------------------------------------
      if ((path === "/api/v1/branding/save" || path === "/api/branding/save") && method === "POST") {
        const branding = await request.json();
        const nuit = branding.nuit || authUser?.nuit || "400123456";
        const key = "branding:" + nuit;
        const kv = env.KV || env.TICONTA_KV || env.CACHE;
        if (kv) {
          await kv.put(key, JSON.stringify(branding));
        }
        return jsonResponse({ success: true, key, message: "Branding gravado com sucesso no KV" }, 200, corsHeaders);
      }

      // Rota de Licenciamento: POST /api/licencas
      // ------------------------------------------------------------------------
      if (path === "/api/licencas" && method === "POST") {
        const body = await request.json();
        const { plano, dias } = body;

        const masterKey = env.LICENSE_MASTER_KEY || DEFAULT_JWT_SECRET;
        const lic = await gerarLicenca(userId, plano || authUser.plano, dias || 365, masterKey);

        if (env.DB) {
          await env.DB.prepare(
            `INSERT INTO licencas (user_id, chave, plano, validade, activa)
             VALUES (?, ?, ?, ?, 1)`
          )
            .bind(userId, lic.chave, lic.plano, lic.validade)
            .run();
        }

        return jsonResponse(
          {
            message: "Licença criptográfica emitida com sucesso",
            licenca: lic
          },
          201,
          corsHeaders
        );
      }

      // Rota não encontrada
      return jsonResponse(
        { error: `Rota não encontrada: ${method} ${path}` },
        404,
        corsHeaders
      );
    } catch (err) {
      return jsonResponse(
        {
          error: "Erro interno do servidor Worker",
          detalhes: err.message || String(err)
        },
        500,
        corsHeaders
      );
    }
  }
};
