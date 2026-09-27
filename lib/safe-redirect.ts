/**
 * Só permite redirecionar para caminhos internos (evita "open redirect",
 * em que um link malicioso usa ?next= para mandar o usuário a outro site).
 */
export function safeNext(value: unknown, fallback = "/app"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
