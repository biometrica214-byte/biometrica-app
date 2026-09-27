"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { getCurrentLegalDocuments } from "@/lib/data";
import { siteUrl } from "@/lib/env";
import { safeNext } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import {
  type FieldErrors,
  text,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/validation";

const GENERIC_ERROR = "Não foi possível concluir agora. Tente novamente em instantes.";

function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Confirme seu e-mail antes de entrar. Procure a mensagem que enviamos (verifique também o spam).";
    case "weak_password":
      return "Essa senha é fraca demais. Escolha uma senha mais difícil de adivinhar.";
    case "same_password":
      return "A nova senha precisa ser diferente da atual.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
    case "user_already_exists":
    case "email_exists":
      return "Não foi possível criar a conta com esse e-mail. Se você já tem conta, entre ou recupere sua senha.";
    default:
      return GENERIC_ERROR;
  }
}

// ---------------------------------------------------------------------------
// Cadastro
// ---------------------------------------------------------------------------
export async function signUp(_prev: ActionState, form: FormData): Promise<ActionState> {
  const firstName = text(form, "first_name");
  const lastName = text(form, "last_name");
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const confirmation = String(form.get("password_confirmation") ?? "");
  const values = { first_name: firstName, last_name: lastName, email };

  const fieldErrors: FieldErrors = {
    first_name: validateName(firstName, "nome"),
    last_name: validateName(lastName, "sobrenome"),
    email: validateEmail(email),
    password: validatePassword(password),
    password_confirmation: validatePasswordConfirmation(password, confirmation),
  };

  // Consentimentos: cada documento vigente é aceito individualmente, na versão exibida.
  const documents = await getCurrentLegalDocuments();
  const accepted: Record<string, string> = {};
  let outdated = false;
  for (const doc of documents) {
    const submitted = form.get(`consent_${doc.type}`);
    if (typeof submitted === "string" && submitted) {
      if (submitted !== doc.version) outdated = true;
      else accepted[doc.type] = doc.version;
    } else if (doc.required) {
      fieldErrors[`consent_${doc.type}`] = "Necessário para criar sua conta.";
    }
  }
  if (outdated) {
    return { error: "Nossos documentos foram atualizados. Recarregue a página para ver a versão atual.", values };
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/app`,
      data: { first_name: firstName, last_name: lastName, consents: accepted },
    },
  });

  if (error) return { error: authErrorMessage(error.code), values };

  // Confirmação de e-mail desativada: já existe sessão, seguimos para o onboarding.
  if (data.session) redirect("/app/onboarding");

  // Com confirmação ativada (ou e-mail já cadastrado — o Supabase não revela),
  // a resposta é sempre a mesma para não expor quais e-mails têm conta.
  return { success: "check-email", values: { email } };
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function signIn(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  const values = { email };

  const fieldErrors: FieldErrors = {
    email: validateEmail(email),
    password: password ? undefined : "Informe sua senha.",
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorMessage(error.code), values };

  redirect(next);
}

// ---------------------------------------------------------------------------
// Recuperação de senha
// ---------------------------------------------------------------------------
export async function requestPasswordReset(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = text(form, "email").toLowerCase();
  const emailError = validateEmail(email);
  if (emailError) return { fieldErrors: { email: emailError }, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/redefinir-senha`,
  });

  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { error: authErrorMessage(error.code), values: { email } };
  }
  // Mesma resposta exista ou não a conta.
  return {
    success: "Se houver uma conta com esse e-mail, você receberá um link para criar uma nova senha em alguns minutos.",
    values: { email },
  };
}

export async function updatePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const password = String(form.get("password") ?? "");
  const confirmation = String(form.get("password_confirmation") ?? "");
  const fieldErrors: FieldErrors = {
    password: validatePassword(password),
    password_confirmation: validatePasswordConfirmation(password, confirmation),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Seu link expirou. Peça um novo link de recuperação." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error.code) };

  if (form.get("redirect") === "app") redirect("/app?senha=alterada");
  return { success: "Senha alterada com sucesso." };
}
