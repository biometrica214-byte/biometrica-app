"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { getSessionUser } from "@/lib/data";
import type { DocumentMimeType } from "@/lib/database.types";
import { type ExamFields, readExamFields, validateExamFields } from "@/lib/exam-fields";
import {
  ACCEPTED_TYPES,
  cleanFilename,
  detectMimeType,
  EXTENSION,
  isUuid,
  MAX_FILE_BYTES,
  MAX_FILES_PER_EXAM,
  STORAGE_BUCKET,
  storagePath,
} from "@/lib/exams";
import { createClient } from "@/lib/supabase/server";
import type { FieldErrors } from "@/lib/validation";

const STORAGE_ERROR = "Não conseguimos acessar o armazenamento agora. Tente novamente em alguns instantes.";
const SAVE_ERROR = "Não foi possível salvar agora. Tente novamente em instantes.";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login?aviso=sessao");
  return user;
}

async function activeCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("exam_categories").select("slug").eq("is_active", true);
  return (data ?? []).map((c) => c.slug);
}

// ---------------------------------------------------------------------------
// Envio: 1) preparar  2) navegador envia direto ao storage  3) finalizar
// ---------------------------------------------------------------------------

export type PrepareInput = { fields: ExamFields; files: { name: string; size: number; type: string }[] };
export type PrepareResult =
  | { ok: true; examId: string; uploads: { documentId: string; signedUrl: string }[] }
  | { ok: false; error?: string; fieldErrors?: FieldErrors };

/** Valida tudo e gera URLs de envio de uso único, restritas à pasta do usuário. */
export async function prepareExamUpload(input: PrepareInput): Promise<PrepareResult> {
  const user = await requireUser();

  const fieldErrors = validateExamFields(input.fields, await activeCategories());
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  const files = Array.isArray(input.files) ? input.files : [];
  if (files.length < 1) return { ok: false, fieldErrors: { files: "Adicione o documento do exame." } };
  if (files.length > MAX_FILES_PER_EXAM) {
    return { ok: false, fieldErrors: { files: `Envie no máximo ${MAX_FILES_PER_EXAM} arquivos por exame.` } };
  }
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type as DocumentMimeType)) {
      return { ok: false, fieldErrors: { files: "Um dos arquivos não está em um formato aceito." } };
    }
    if (!(file.size > 0) || file.size > MAX_FILE_BYTES) {
      return { ok: false, fieldErrors: { files: "Um dos arquivos está vazio ou passa de 20 MB." } };
    }
  }

  const examId = crypto.randomUUID();
  const supabase = await createClient();
  const uploads: { documentId: string; signedUrl: string }[] = [];
  for (const file of files) {
    const documentId = crypto.randomUUID();
    const path = storagePath(user.id, examId, documentId, file.type as DocumentMimeType);
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUploadUrl(path);
    if (error || !data) return { ok: false, error: STORAGE_ERROR };
    uploads.push({ documentId, signedUrl: data.signedUrl });
  }
  return { ok: true, examId, uploads };
}

export type FinalizeInput = {
  examId: string;
  fields: ExamFields;
  documents: { documentId: string; originalName: string }[];
};
export type FinalizeResult = { ok: true; examId: string } | { ok: false; error?: string; fieldErrors?: FieldErrors; discarded?: boolean };

/**
 * Confere no servidor cada arquivo enviado (existe, tamanho, formato real pela
 * assinatura dos bytes) e só então cria exame + documentos numa transação.
 */
export async function finalizeExam(input: FinalizeInput): Promise<FinalizeResult> {
  const user = await requireUser();
  if (!isUuid(input.examId) || !Array.isArray(input.documents) || input.documents.length < 1 ||
      input.documents.length > MAX_FILES_PER_EXAM || !input.documents.every((d) => isUuid(d.documentId))) {
    return { ok: false, error: "Envio inválido. Tente novamente." };
  }

  const fieldErrors = validateExamFields(input.fields, await activeCategories());
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }; // arquivos ficam; dá para corrigir e reenviar

  const supabase = await createClient();
  const folder = `${user.id}/${input.examId}`;
  const { data: objects, error: listError } = await supabase.storage.from(STORAGE_BUCKET).list(folder, { limit: 100 });
  if (listError) return { ok: false, error: STORAGE_ERROR };

  const documents = [];
  for (const doc of input.documents) {
    const object = objects?.find((o) => o.name.startsWith(`${doc.documentId}.`));
    const size = Number(object?.metadata?.size ?? 0);
    const declaredType = object?.metadata?.mimetype as DocumentMimeType | undefined;
    if (!object || !declaredType || !(size > 0) || size > MAX_FILE_BYTES) {
      await discardFolder(folder);
      return { ok: false, discarded: true, error: "Um dos arquivos não chegou por completo. Envie novamente." };
    }
    const path = `${folder}/${object.name}`;
    const realType = await sniffStoredFile(path);
    if (!realType || realType !== declaredType || object.name !== `${doc.documentId}.${EXTENSION[realType]}`) {
      await discardFolder(folder);
      return {
        ok: false,
        discarded: true,
        error: "Um dos arquivos parece estar corrompido ou não é um PDF/imagem válido. Verifique e envie novamente.",
      };
    }
    documents.push({
      id: doc.documentId,
      original_filename: cleanFilename(String(doc.originalName ?? "")),
      mime_type: realType,
      size_bytes: size,
      storage_path: path,
    });
  }

  const { error } = await supabase.rpc("create_exam_with_documents", {
    p_exam_id: input.examId,
    p_title: input.fields.title,
    p_category: input.fields.category,
    p_collected_on: input.fields.collected_on,
    p_laboratory: input.fields.laboratory,
    p_notes: input.fields.notes,
    p_documents: documents,
  });
  if (error) {
    // Só o código técnico: nunca dados do exame ou do arquivo.
    console.error("[exams] create_exam_with_documents falhou:", error.code, error.message);
    await discardFolder(folder);
    return { ok: false, discarded: true, error: SAVE_ERROR };
  }

  revalidatePath("/app", "layout");
  return { ok: true, examId: input.examId };
}

/** Remove arquivos de um envio que não virou exame (cancelado ou com falha). */
export async function discardUpload(examId: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(examId)) return;
  const supabase = await createClient();
  // Nunca descarta arquivos de um exame já criado.
  const { data: exam } = await supabase.from("exams").select("id").eq("id", examId).maybeSingle();
  if (exam) return;
  await discardFolder(`${user.id}/${examId}`);
}

async function discardFolder(folder: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(STORAGE_BUCKET).list(folder, { limit: 100 });
  const paths = (data ?? []).map((o) => `${folder}/${o.name}`);
  if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);
}

/** Lê só os primeiros bytes do arquivo armazenado para identificar o formato real. */
async function sniffStoredFile(path: string): Promise<DocumentMimeType | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60);
  if (!data?.signedUrl) return null;
  try {
    const response = await fetch(data.signedUrl, { headers: { Range: "bytes=0-15" }, cache: "no-store" });
    if (!response.ok) return null;
    const bytes = new Uint8Array(await response.arrayBuffer()).slice(0, 16);
    return detectMimeType(bytes);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Edição de metadados (o documento original nunca é alterado aqui)
// ---------------------------------------------------------------------------
export async function updateExam(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireUser();
  const examId = form.get("exam_id");
  if (!isUuid(examId)) return { error: "Exame não encontrado." };

  const fields = readExamFields(form);
  const fieldErrors = validateExamFields(fields, await activeCategories());
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: fields };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .update({
      title: fields.title,
      category: fields.category,
      collected_on: fields.collected_on,
      laboratory: fields.laboratory || null,
      notes: fields.notes || null,
    })
    .eq("id", examId)
    .select("id");
  if (error) return { error: SAVE_ERROR, values: fields };
  if (!data?.length) return { error: "Exame não encontrado." };

  revalidatePath("/app", "layout");
  redirect(`/app/exames/${examId}?aviso=editado`);
}

// ---------------------------------------------------------------------------
// Exclusão: arquivos primeiro (sem órfãos no storage), depois o registro.
// ---------------------------------------------------------------------------
export async function deleteExam(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireUser();
  const examId = form.get("exam_id");
  if (!isUuid(examId)) return { error: "Exame não encontrado." };

  const supabase = await createClient();
  const { data: exam } = await supabase
    .from("exams")
    .select("id, exam_documents(storage_path)")
    .eq("id", examId)
    .maybeSingle();
  if (!exam) return { error: "Exame não encontrado." };

  const paths = (exam.exam_documents as { storage_path: string }[]).map((d) => d.storage_path);
  if (paths.length) {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    if (error) return { error: "Não foi possível excluir o documento agora. Nada foi apagado. Tente novamente." };
  }

  const { error } = await supabase.from("exams").delete().eq("id", examId);
  if (error) return { error: "Os arquivos foram removidos, mas não conseguimos concluir a exclusão. Tente novamente." };

  revalidatePath("/app", "layout");
  redirect("/app/exames?aviso=excluido");
}
