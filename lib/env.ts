// Apenas valores públicos por natureza. Segredos (service_role, senha do banco)
// nunca devem ter o prefixo NEXT_PUBLIC_ nem ser usados neste projeto front-end.

export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes("SEU-PROJETO")) return null;
  return { url, key };
}

export function requireSupabaseConfig(): { url: string; key: string } {
  const config = supabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY em .env.local",
    );
  }
  return config;
}

/** URL pública do site, usada nos links enviados por e-mail. Não confia no cabeçalho Host. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
