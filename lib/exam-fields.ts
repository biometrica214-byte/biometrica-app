import type { FieldErrors } from "@/lib/validation";
import { validateOptionalText, validateRequiredDate } from "@/lib/validation";

// Metadados do exame, validados igual no navegador e no servidor.

export type ExamFields = {
  title: string;
  category: string;
  collected_on: string;
  laboratory: string;
  notes: string;
};

export function readExamFields(form: FormData): ExamFields {
  const get = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  return {
    title: get("title"),
    category: get("category"),
    collected_on: get("collected_on"),
    laboratory: get("laboratory"),
    notes: get("notes"),
  };
}

export function validateExamFields(fields: ExamFields, categories: string[]): FieldErrors {
  const errors: FieldErrors = {
    category: categories.includes(fields.category) ? undefined : "Escolha o tipo do exame.",
    title: !fields.title
      ? "Dê um nome ao exame (por exemplo, Hemograma)."
      : validateOptionalText(fields.title, 120, "O nome"),
    collected_on: validateRequiredDate(fields.collected_on, "data da coleta"),
    laboratory: validateOptionalText(fields.laboratory, 120, "O laboratório"),
    notes: validateOptionalText(fields.notes, 2000, "A observação"),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as FieldErrors;
}
