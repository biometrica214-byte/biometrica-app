import type { FieldErrors } from "@/lib/validation";

/** Resultado padrão das Server Actions de formulário. */
export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
} | null;
