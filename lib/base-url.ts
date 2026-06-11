import { headers } from "next/headers";

/**
 * URL pública base do app, resolvida em RUNTIME a partir dos headers da request.
 *
 * Por quê: `NEXT_PUBLIC_APP_URL` é "congelada" no momento do build (Next.js faz
 * inline da variável). Se o build rodou com localhost, todo link gerado nos
 * e-mails sai como localhost. Lendo dos headers (atrás do proxy do EasyPanel),
 * sempre pega o domínio real (ex.: https://crm.dvmkt.com.br) sem depender do build.
 *
 * Fallback pro env var quando não há contexto de request (build/scripts).
 */
export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
      return `${proto}://${host}`;
    }
  } catch {
    // Fora de contexto de request — usa o env var.
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
