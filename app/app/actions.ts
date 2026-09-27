"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { getConsentStatus, getSessionUser } from "@/lib/data";
import type { BiologicalSex, Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { type FieldErrors, text, validateBirthDate, validateName } from "@/lib/validation";

const SAVE_ERROR = "Não foi possível salvar agora. Tente novamente em instantes.";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login?aviso=sessao");
  return user;
}

function parseSex(value: string): BiologicalSex | null | "invalid" {
  if (!value || value === "none") return null;
  if (value === "female" || value === "male") return value;
  return "invalid";
}

// ---------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?aviso=saiu");
}

// ---------------------------------------------------------------------------
// Perfil (usado no onboarding e na página de perfil)
// ---------------------------------------------------------------------------
export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const includeNames = form.get("scope") === "full";

  const birthDate = text(form, "birth_date");
  const sex = parseSex(text(form, "biological_sex"));
  const firstName = text(form, "first_name");
  const lastName = text(form, "last_name");
  const values = { birth_date: birthDate, biological_sex: text(form, "biological_sex"), first_name: firstName, last_name: lastName };

  const fieldErrors: FieldErrors = {
    birth_date: validateBirthDate(birthDate),
    biological_sex: sex === "invalid" ? "Selecione uma opção válida." : undefined,
    ...(includeNames && {
      first_name: validateName(firstName, "nome"),
      last_name: validateName(lastName, "sobrenome"),
    }),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, values };

  const update: Database["public"]["Tables"]["profiles"]["Update"] = {
    birth_date: birthDate || null,
    biological_sex: sex === "invalid" ? null : sex,
    ...(includeNames && { first_name: firstName, last_name: lastName }),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return { error: SAVE_ERROR, values };

  revalidatePath("/app", "layout");
  return { success: "Alterações salvas.", values };
}

export async function completeOnboarding(form: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw new Error(SAVE_ERROR);

  revalidatePath("/app", "layout");
  redirect(form.get("destination") === "exams" ? "/app/exames" : "/app");
}

// ---------------------------------------------------------------------------
// Consentimentos
// ---------------------------------------------------------------------------

/** Aceite dos documentos vigentes pendentes (novas versões ou após revogação). */
export async function acceptConsents(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const status = await getConsentStatus();

  const fieldErrors: FieldErrors = {};
  const rows: Database["public"]["Tables"]["consents"]["Insert"][] = [];
  for (const doc of status) {
    const submitted = form.get(`consent_${doc.type}`) === doc.version;
    if (doc.required && !doc.granted && !submitted) {
      fieldErrors[`consent_${doc.type}`] = "Necessário para usar a Biométrica.";
    }
    if (submitted && !doc.granted) {
      rows.push({ user_id: user.id, document_id: doc.document_id, granted: true });
    }
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  if (rows.length) {
    const supabase = await createClient();
    const { error } = await supabase.from("consents").insert(rows);
    if (error) return { error: SAVE_ERROR };
  }

  revalidatePath("/app", "layout");
  redirect("/app");
}

/** Concede ou revoga um consentimento específico (tela de configurações). */
export async function setConsent(form: FormData) {
  const user = await requireUser();
  const documentId = text(form, "document_id");
  const granted = form.get("granted") === "true";

  const status = await getConsentStatus();
  const doc = status.find((d) => d.document_id === documentId);
  if (!doc || doc.granted === granted) return;

  const supabase = await createClient();
  const { error } = await supabase.from("consents").insert({ user_id: user.id, document_id: doc.document_id, granted });
  if (error) throw new Error(SAVE_ERROR);

  revalidatePath("/app", "layout");
  if (!granted && doc.required) redirect("/app/consentimentos");
}
