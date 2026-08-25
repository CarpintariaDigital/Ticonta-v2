/**
 * TiConta v2 - Módulo Fiscal de Moçambique & Licenciamento Criptográfico
 * ==============================================================================
 * Conformidade com PGC-NIRF, CIVA (IVA 16%), IRPS/IRT 2026, INSS (3%+4%) e HMAC-SHA256
 */

/**
 * Arredonda valor para 2 casas decimais de precisão bancária
 */
export function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula o IVA (16% padrão de Moçambique)
 * @param {number} valor Valor financeiro base
 * @param {number} taxa Percentagem do IVA (padrão: 16)
 * @param {boolean} incluso Indica se o valor fornecido já inclui IVA
 * @returns {{ base: number, iva16pct: number, total: number, taxa: number }}
 */
export function calcularIVA(valor, taxa = 16, incluso = false) {
  const numValor = Math.max(0, Number(valor) || 0);
  const numTaxa = Number(taxa) || 16;

  if (incluso) {
    const base = round2(numValor / (1 + numTaxa / 100));
    const iva = round2(numValor - base);
    return {
      base,
      iva16pct: iva,
      total: round2(numValor),
      taxa: numTaxa
    };
  } else {
    const base = round2(numValor);
    const iva = round2(base * (numTaxa / 100));
    const total = round2(base + iva);
    return {
      base,
      iva16pct: iva,
      total,
      taxa: numTaxa
    };
  }
}

/**
 * Tabela de Escalões Oficiais do IRPS / IRT (2ª Categoria Moçambique)
 */
const ESCALOES_IRPS = [
  { min: 0, max: 20249.99, taxa: 0.0, deducao: 0.0 },
  { min: 20250.0, max: 32750.0, taxa: 0.1, deducao: 2025.0 },
  { min: 32750.01, max: 60000.0, taxa: 0.15, deducao: 3662.5 },
  { min: 60000.01, max: 144250.0, taxa: 0.2, deducao: 6662.5 },
  { min: 144250.01, max: Infinity, taxa: 0.25, deducao: 13875.0 }
];

/**
 * Calcula o IRPS / Retenção na Fonte sobre o Rendimento do Trabalho
 * @param {number} salario Salário bruto
 * @param {number} dependentes Número de dependentes a cargo (abatimento de 100 MZN por dependente)
 * @returns {{ salarioBruto: number, inssTrabalhador: number, rendimentoColetavel: number, desconto: number, liquido: number, taxa: number }}
 */
export function calcularIRPS(salario, dependentes = 0) {
  const bruto = Math.max(0, Number(salario) || 0);
  // 1. Dedução de INSS obrigatório (3%)
  const inssTrabalhador = round2(bruto * 0.03);
  const rendimentoColetavel = Math.max(0, bruto - inssTrabalhador);

  let escalaoAplicado = ESCALOES_IRPS[0];
  for (const esc of ESCALOES_IRPS) {
    if (rendimentoColetavel >= esc.min && rendimentoColetavel <= esc.max) {
      escalaoAplicado = esc;
      break;
    }
  }

  let impostoBruto = rendimentoColetavel * escalaoAplicado.taxa - escalaoAplicado.deducao;
  impostoBruto = Math.max(0, impostoBruto);

  // Abatimento por dependentes
  const abatimentoDependentes = Math.max(0, Number(dependentes) || 0) * 100.0;
  const impostoDevido = round2(Math.max(0, impostoBruto - abatimentoDependentes));
  const liquido = round2(bruto - inssTrabalhador - impostoDevido);

  return {
    salarioBruto: bruto,
    inssTrabalhador,
    rendimentoColetavel: round2(rendimentoColetavel),
    desconto: impostoDevido,
    liquido,
    taxaPercent: escalaoAplicado.taxa * 100,
    dependentes: Number(dependentes) || 0
  };
}

/**
 * Calcula a Segurança Social Obrigatória de Moçambique (INSS 3% + 4% = 7%)
 * @param {number} salario Salário bruto base
 * @returns {{ salario: number, trabalhador3pct: number, patronal4pct: number, total7pct: number }}
 */
export function calcularINSS(salario) {
  const bruto = Math.max(0, Number(salario) || 0);
  const trabalhador3pct = round2(bruto * 0.03);
  const patronal4pct = round2(bruto * 0.04);
  const total7pct = round2(trabalhador3pct + patronal4pct);

  return {
    salario: bruto,
    trabalhador3pct,
    patronal4pct,
    total7pct
  };
}

/**
 * Valida o NUIT de Moçambique (Número Único de Identificação Tributária)
 * Regra oficial: Exatamente 9 dígitos numéricos.
 * @param {string|number} nuit NUIT a validar
 * @returns {boolean}
 */
export function validarNUIT(nuit) {
  if (!nuit) return false;
  const cleanNuit = String(nuit).trim();
  return /^\d{9}$/.test(cleanNuit);
}

/**
 * Gera assinatura HMAC-SHA256 usando Web Crypto API
 */
async function hmacSha256(keyStr, messageStr) {
  const enc = new TextEncoder();
  const keyData = enc.encode(keyStr);
  const msgData = enc.encode(messageStr);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex.slice(0, 8).toUpperCase();
}

/**
 * Gera uma chave de licença oficial criptográfica TiConta (HMAC-SHA256)
 * Padrão: TIC-XXXXX-PLAN-YYMMDD-SIGNATURE
 * @param {string|number} userId Identificador ou código da empresa/cliente
 * @param {string} plano Plano ('basic', 'professional', 'complete', 'enterprise')
 * @param {number} diasValidade Duração em dias (padrão 365)
 * @param {string} masterKey Chave secreta de assinatura HMAC
 * @returns {Promise<{ chave: string, plano: string, validade: string, dias: number, expiraEm: string }>}
 */
export function gerarLicenca(userId, plano = "basic", diasValidade = 365, masterKey = "change-me-in-production-min-32-chars-master-key") {
  const planMap = {
    basic: "BAS",
    basico: "BAS",
    professional: "PRO",
    profissional: "PRO",
    complete: "COMP",
    completo: "COMP",
    enterprise: "ENT"
  };

  const planNorm = String(plano).toLowerCase().trim();
  const planCode = planMap[planNorm] || "BAS";

  // Formatar ID do cliente para 5 caracteres
  const custId = String(userId || "00001")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .padStart(5, "0")
    .slice(0, 5);

  const now = new Date();
  const expiresDate = new Date(now.getTime() + Number(diasValidade) * 86400000);

  const yy = String(expiresDate.getUTCFullYear()).slice(2);
  const mm = String(expiresDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(expiresDate.getUTCDate()).padStart(2, "0");
  const yymmdd = `${yy}${mm}${dd}`;

  const payloadBase = `TIC-${custId}-${planCode}-${yymmdd}`;

  return hmacSha256(masterKey, payloadBase).then((sig) => {
    const chave = `${payloadBase}-${sig}`;
    return {
      chave,
      plano: planNorm,
      planCode,
      validade: expiresDate.toISOString().split("T")[0],
      dias: Number(diasValidade),
      expiraEm: expiresDate.toISOString()
    };
  });
}
