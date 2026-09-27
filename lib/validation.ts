// Validações compartilhadas entre navegador (feedback imediato) e servidor
// (a verificação que vale). Mensagens em linguagem simples.

export type FieldErrors = Partial<Record<string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | undefined {
  if (!value) return "Informe seu e-mail.";
  if (value.length > 254 || !EMAIL_RE.test(value)) return "Informe um e-mail válido.";
}

export const PASSWORD_RULE = "Mínimo de 8 caracteres, com pelo menos uma letra e um número.";

export function validatePassword(value: string): string | undefined {
  if (!value) return "Crie uma senha.";
  if (value.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (value.length > 72) return "A senha pode ter no máximo 72 caracteres.";
  if (!/[A-Za-zÀ-ÿ]/.test(value) || !/\d/.test(value)) return "Use pelo menos uma letra e um número.";
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | undefined {
  if (!confirmation) return "Repita a senha.";
  if (password !== confirmation) return "As senhas não coincidem.";
}

export function validateName(value: string, label: string): string | undefined {
  if (!value) return `Informe seu ${label}.`;
  if (value.length > 80) return `Seu ${label} pode ter no máximo 80 caracteres.`;
}

/** Aceita AAAA-MM-DD entre 1900 e hoje. Vazio é permitido (campo opcional). */
export function validateBirthDate(value: string): string | undefined {
  if (!value) return;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = match ? new Date(`${value}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return "Informe uma data válida.";
  }
  if (date.getUTCFullYear() < 1900 || date.getTime() > Date.now()) return "Informe uma data válida.";
}

export function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}
