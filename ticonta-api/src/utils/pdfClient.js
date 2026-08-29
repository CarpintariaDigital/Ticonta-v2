const PDF_ENGINE_URL = 'http://localhost:8000';

export async function generatePDF(payload) {
  const response = await fetch(`${PDF_ENGINE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro desconhecido no PDF Engine' }));
    throw new Error(`PDF Engine error: ${error.detail || error.message || 'Falha ao gerar PDF'}`);
  }

  return await response.json();
}

export async function getBranding(env, nuit) {
  /**
   * Lê o branding da empresa do Cloudflare KV.
   * Chave: branding:{{ nuit }}
   */
  const kv = env.KV || env.TICONTA_KV || env.CACHE;
  if (!kv) {
    throw new Error("Cloudflare KV não configurado no ambiente do Worker.");
  }
  const raw = await kv.get(`branding:${nuit}`);
  if (!raw) {
    throw new Error(`Branding não encontrado para NUIT: ${nuit}`);
  }
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}
