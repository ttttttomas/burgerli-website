
type LocalId = "gerli" | "lanus" | "avellaneda"; 

const BRANCHES: Record<LocalId, { token: string }> = {
  "gerli": { token: process.env.MP_TOKEN_GERLI! },
  "lanus": { token: process.env.MP_ACCESS_TOKEN! },
  "avellaneda": { token: process.env.MP_TOKEN_AVELLANEDA! },
};

export function getBranchTokenByLocal(local: unknown): string {
    const localNum = String(local).toLowerCase() as LocalId;

  const branch = BRANCHES[localNum];
  if (!branch) {
    throw new Error(`Local/sucursal no soportada: ${local}`);
  }
  return branch.token;
}

/**
 * Genera la URL completa del webhook de MercadoPago
 * @param baseUrl - URL base del frontend (ej: https://tu-dominio.com)
 * @param local - Local/sucursal (gerli, lanus, avellaneda)
 * @returns URL completa del webhook con el parámetro local
 */
export function getWebhookUrl(baseUrl: string, local: unknown): string {
    const localNum = String(local);
    // La URL del webhook debe apuntar al endpoint de la API, no al frontend
    return `${baseUrl}/api/mercadopago/webhook?local=${localNum}`;
  }
