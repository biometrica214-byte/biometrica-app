import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Leituras do usuário logado, memorizadas por requisição (layout e página
// podem chamar sem repetir a consulta). Toda leitura passa pelo RLS.

export type SessionUser = { id: string; email: string };

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || typeof claims.sub !== "string") return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

export const getProfile = cache(async () => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw new Error("Não foi possível carregar o perfil.");
  return data;
});

export const getConsentStatus = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consent_status");
  if (error) throw new Error("Não foi possível carregar os consentimentos.");
  return data ?? [];
});

export async function hasRequiredConsents() {
  const status = await getConsentStatus();
  return status.filter((c) => c.required).every((c) => c.granted);
}

/** Documentos legais vigentes (leitura pública), usados no cadastro. */
export async function getCurrentLegalDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("is_current", true)
    .order("type");
  if (error) throw new Error("Não foi possível carregar os documentos legais.");
  return data ?? [];
}
