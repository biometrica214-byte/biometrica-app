// Regras de exames/documentos compartilhadas entre navegador e servidor.
// Os limites também são aplicados pelo próprio bucket do Supabase.

import type { DocumentMimeType, ExamStatus } from "@/lib/database.types";

export const STORAGE_BUCKET = "exam-documents";
export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB por arquivo
export const MAX_FILES_PER_EXAM = 10;
export const ACCEPTED_TYPES: DocumentMimeType[] = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";
export const ACCEPTED_HINT = "PDF, JPG, PNG ou WEBP · até 20 MB por arquivo · até 10 arquivos";

export const EXTENSION: Record<DocumentMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export const STATUS_LABEL: Record<ExamStatus, string> = {
  uploaded: "Recebido",
  processing: "Em processamento",
  processed: "Processado",
  review_required: "Requer revisão",
  error: "Erro",
};

/**
 * Identifica o formato real pelos primeiros bytes do arquivo ("assinatura"),
 * sem confiar na extensão nem no tipo informado pelo navegador.
 */
export function detectMimeType(bytes: Uint8Array): DocumentMimeType | null {
  const at = (i: number) => bytes[i];
  if (bytes.length >= 5 && at(0) === 0x25 && at(1) === 0x50 && at(2) === 0x44 && at(3) === 0x46 && at(4) === 0x2d) {
    return "application/pdf"; // %PDF-
  }
  if (bytes.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47 &&
      at(4) === 0x0d && at(5) === 0x0a && at(6) === 0x1a && at(7) === 0x0a) {
    return "image/png";
  }
  if (bytes.length >= 12 && at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 &&
      at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50) {
    return "image/webp"; // RIFF....WEBP
  }
  return null;
}

export function storagePath(userId: string, examId: string, documentId: string, mime: DocumentMimeType) {
  return `${userId}/${examId}/${documentId}.${EXTENSION[mime]}`;
}

/** Nome de arquivo seguro para exibição e para o cabeçalho de download. */
export function cleanFilename(name: string): string {
  const cleaned = name.replace(/[\u0000-\u001f\u007f\\/]+/g, " ").replace(/\s+/g, " ").trim();
  return (cleaned || "documento").slice(0, 255);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Sao_Paulo" });

/** Datas de coleta (AAAA-MM-DD) são datas "puras": formatadas em UTC para não mudar de dia. */
export function formatCollectedOn(date: string, style: "short" | "long" = "short"): string {
  const d = new Date(`${date}T00:00:00Z`);
  return (style === "long" ? longDate : shortDate).format(d).replace(".", "");
}

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
