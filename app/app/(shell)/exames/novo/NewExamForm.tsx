"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconAlert, IconCamera, IconCheck, IconFile, IconTrash, IconUpload } from "@/components/icons";
import type { DocumentMimeType } from "@/lib/database.types";
import { type ExamFields, validateExamFields } from "@/lib/exam-fields";
import { ACCEPT_ATTRIBUTE, ACCEPTED_HINT, detectMimeType, formatBytes, MAX_FILE_BYTES, MAX_FILES_PER_EXAM } from "@/lib/exams";
import type { FieldErrors } from "@/lib/validation";
import { discardUpload, finalizeExam, prepareExamUpload } from "../actions";
import { ExamFieldsInputs } from "../ExamFieldsInputs";
import styles from "../exams.module.css";

type Item = {
  key: string;
  file: File;
  mime: DocumentMimeType;
  preview?: string;
  progress: number;
  state: "ready" | "uploading" | "done" | "error";
};
type Phase = "editing" | "uploading" | "finalizing" | "done";
type Pending = { examId: string; uploads: { documentId: string; signedUrl: string }[] };

const NETWORK_ERROR = "A conexão caiu durante o envio. Verifique sua internet e tente novamente — nada foi salvo pela metade.";

export function NewExamForm({ categories, laboratories }: { categories: { slug: string; label: string }[]; laboratories: string[] }) {
  const router = useRouter();
  const [fields, setFields] = useState<ExamFields>({ title: "", category: "laboratory", collected_on: "", laboratory: "", notes: "" });
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<Phase>("editing");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const pending = useRef<Pending | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const busy = phase === "uploading" || phase === "finalizing" || phase === "done";

  // Libera as prévias de imagem ao sair.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => () => itemsRef.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)), []);

  // Avisa antes de fechar a página no meio do envio.
  useEffect(() => {
    if (!busy || phase === "done") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy, phase]);

  function updateField(name: keyof ExamFields, value: string) {
    setFields((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  /** Arquivos mudaram depois de um envio parcial: descarta o que já foi enviado. */
  function invalidatePending() {
    if (pending.current) {
      void discardUpload(pending.current.examId);
      pending.current = null;
    }
  }

  async function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const problems: string[] = [];
    const accepted: Item[] = [];
    for (const file of incoming) {
      if (items.length + accepted.length >= MAX_FILES_PER_EXAM) {
        problems.push(`Limite de ${MAX_FILES_PER_EXAM} arquivos por exame atingido.`);
        break;
      }
      if (file.size === 0) { problems.push(`${file.name}: o arquivo está vazio.`); continue; }
      if (file.size > MAX_FILE_BYTES) { problems.push(`${file.name}: tem ${formatBytes(file.size)}; o limite é 20 MB.`); continue; }
      let mime: DocumentMimeType | null = null;
      try {
        mime = detectMimeType(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
      } catch {
        mime = null;
      }
      if (!mime) { problems.push(`${file.name}: formato não aceito ou arquivo corrompido. Use PDF, JPG, PNG ou WEBP.`); continue; }
      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        mime,
        preview: mime.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        progress: 0,
        state: "ready",
      });
    }
    setRejected(problems);
    if (accepted.length) {
      invalidatePending();
      setItems((current) => [...current.map((i) => ({ ...i, state: "ready" as const, progress: 0 })), ...accepted]);
      setErrors((e) => ({ ...e, files: undefined }));
      setFormError(null);
    }
  }

  function removeItem(key: string) {
    invalidatePending();
    setItems((current) => {
      const item = current.find((i) => i.key === key);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return current.filter((i) => i.key !== key).map((i) => ({ ...i, state: "ready" as const, progress: 0 }));
    });
  }

  function setItem(key: string, patch: Partial<Item>) {
    setItems((current) => current.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setFormError(null);

    const nextErrors = validateExamFields(fields, categories.map((c) => c.slug));
    if (!items.length) nextErrors.files = "Adicione o documento do exame (PDF ou foto).";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.querySelector<HTMLElement>("[aria-invalid='true'], [data-first-error]")?.focus();
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setFormError("Você parece estar sem internet. Conecte-se e tente novamente.");
      return;
    }

    try {
      // 1) Preparar (se ainda não há um envio concluído aguardando só os dados)
      if (!pending.current) {
        setPhase("uploading");
        const prepared = await prepareExamUpload({
          fields,
          files: items.map((i) => ({ name: i.file.name, size: i.file.size, type: i.mime })),
        });
        if (!prepared.ok) {
          setErrors(prepared.fieldErrors ?? {});
          setFormError(prepared.error ?? null);
          setPhase("editing");
          return;
        }

        // 2) Enviar cada arquivo direto ao armazenamento privado, com progresso
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          setItem(item.key, { state: "uploading", progress: 0 });
          try {
            await putFile(prepared.uploads[index].signedUrl, item.file, item.mime, (p) => setItem(item.key, { progress: p }));
            setItem(item.key, { state: "done", progress: 1 });
          } catch (error) {
            setItem(item.key, { state: "error" });
            void discardUpload(prepared.examId);
            setFormError(error instanceof UploadError && error.status === 413
              ? `${item.file.name} é maior do que o permitido (20 MB).`
              : error instanceof UploadError && error.status >= 400 && error.status < 500 && error.status !== 408
                ? `Não foi possível enviar ${item.file.name}. Verifique se o arquivo abre normalmente e tente de novo.`
                : NETWORK_ERROR);
            setPhase("editing");
            return;
          }
        }
        pending.current = { examId: prepared.examId, uploads: prepared.uploads };
      }

      // 3) Finalizar: o servidor confere os arquivos e cria o exame
      setPhase("finalizing");
      const { examId, uploads } = pending.current;
      const result = await finalizeExam({
        examId,
        fields,
        documents: uploads.map((u, i) => ({ documentId: u.documentId, originalName: items[i].file.name })),
      });
      if (!result.ok) {
        if (result.discarded) {
          pending.current = null;
          setItems((current) => current.map((i) => ({ ...i, state: "ready" as const, progress: 0 })));
        }
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error ?? (result.fieldErrors ? "Revise os campos destacados. Seus arquivos já foram enviados." : null));
        setPhase("editing");
        return;
      }

      setPhase("done");
      router.push(`/app/exames/${result.examId}?aviso=novo`);
    } catch {
      if (pending.current === null) setItems((current) => current.map((i) => ({ ...i, state: "ready" as const, progress: 0 })));
      setFormError(NETWORK_ERROR);
      setPhase("editing");
    }
  }

  const totalBytes = items.reduce((sum, i) => sum + i.file.size, 0);
  const sentBytes = items.reduce((sum, i) => sum + i.file.size * (i.state === "done" ? 1 : i.progress), 0);
  const overall = totalBytes ? Math.round((sentBytes / totalBytes) * 100) : 0;

  return (
    <form onSubmit={submit} className={styles.form} noValidate>
      <section className={styles.formBlock} aria-labelledby="exam-info">
        <h2 id="exam-info" className={styles.blockTitle}>O exame</h2>
        <ExamFieldsInputs values={fields} onChange={updateField} errors={errors} categories={categories}
          laboratories={laboratories} disabled={busy} />
      </section>

      <section className={styles.formBlock} aria-labelledby="exam-files">
        <h2 id="exam-files" className={styles.blockTitle}>Documento</h2>
        <div
          className={styles.drop}
          data-drag={dragging}
          data-invalid={Boolean(errors.files)}
          onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (!busy && e.dataTransfer.files.length) void addFiles(e.dataTransfer.files); }}
        >
          <div className={styles.dropIcon} aria-hidden="true"><IconUpload /></div>
          <p className={`${styles.dropTitle} ${styles.desktopOnly}`}>Arraste o PDF ou as fotos do exame para cá</p>
          <p className={`${styles.dropTitle} ${styles.touchOnly}`}>Envie o PDF ou fotografe o exame</p>
          <p className={styles.dropHint} id="files-hint">{ACCEPTED_HINT}</p>
          <div className={styles.dropButtons}>
            <button type="button" className="btn btn-ghost" onClick={() => fileInput.current?.click()} disabled={busy}
              data-first-error={errors.files ? true : undefined} aria-describedby="files-hint">
              <IconFile style={{ width: 18, height: 18 }} /> Escolher arquivo
            </button>
            <button type="button" className={`btn btn-ghost ${styles.touchOnly}`} onClick={() => cameraInput.current?.click()} disabled={busy}>
              <IconCamera style={{ width: 18, height: 18 }} /> Tirar foto
            </button>
          </div>
          <input ref={fileInput} type="file" accept={ACCEPT_ATTRIBUTE} multiple hidden
            onChange={(e) => { if (e.target.files?.length) void addFiles(e.target.files); e.target.value = ""; }} />
          <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden
            onChange={(e) => { if (e.target.files?.length) void addFiles(e.target.files); e.target.value = ""; }} />
        </div>
        {errors.files && <p className="field-error" role="alert" style={{ marginTop: 8 }}>{errors.files}</p>}
        {rejected.length > 0 && (
          <div className="notice notice-error" role="alert" style={{ marginTop: 12 }}>
            <div>{rejected.map((r) => <div key={r}>{r}</div>)}</div>
          </div>
        )}

        {items.length > 0 && (
          <ul className={styles.files} aria-label="Arquivos selecionados">
            {items.map((item) => (
              <li key={item.key} className={styles.file} data-state={item.state}>
                {item.preview
                  ? <img src={item.preview} alt="" className={styles.thumb} />
                  : <span className={styles.thumb} aria-hidden="true"><IconFile /></span>}
                <div style={{ minWidth: 0 }}>
                  <div className={styles.fileName}>{item.file.name}</div>
                  <FileStatus item={item} />
                  {item.state === "uploading" && (
                    <div className={styles.bar} role="progressbar" aria-label={`Enviando ${item.file.name}`}
                      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(item.progress * 100)}>
                      <span style={{ width: `${Math.round(item.progress * 100)}%` }} />
                    </div>
                  )}
                </div>
                {!busy && (
                  <button type="button" className={styles.iconBtn} onClick={() => removeItem(item.key)}
                    aria-label={`Remover ${item.file.name}`}>
                    <IconTrash />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {(phase === "uploading" || phase === "finalizing" || phase === "done") && (
        <div className={styles.overall} role="status" aria-live="polite">
          {phase === "done" ? (
            <p className={styles.overallDone} style={{ margin: 0 }}><IconCheck /> Exame recebido.</p>
          ) : (
            <>
              <div className={styles.overallHead}>
                <span>{phase === "finalizing" ? "Conferindo os arquivos…" : "Enviando com segurança…"}</span>
                <span className="mono">{phase === "finalizing" ? "100%" : `${overall}%`}</span>
              </div>
              <div className={styles.bar}><span style={{ width: `${phase === "finalizing" ? 100 : overall}%` }} /></div>
            </>
          )}
        </div>
      )}

      <div className={styles.formActions}>
        {formError && <div className="notice notice-error" role="alert"><IconAlert style={{ width: 18, height: 18, flex: "none" }} />{formError}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
          {busy && phase !== "done" && <span className="spinner" aria-hidden="true" />}
          {phase === "editing" ? (pending.current ? "Tentar novamente" : "Enviar exame") : phase === "done" ? "Abrindo exame…" : "Enviando…"}
        </button>
        <a href="/app/exames" className="btn btn-ghost" aria-disabled={busy}
          onClick={(e) => { if (busy) e.preventDefault(); else invalidatePending(); }}>
          Cancelar
        </a>
      </div>
    </form>
  );
}

function FileStatus({ item }: { item: Item }) {
  const size = formatBytes(item.file.size);
  const kind = item.mime === "application/pdf" ? "PDF" : "Imagem";
  if (item.state === "uploading") return <div className={styles.fileMeta}>{kind} · {size} · Enviando {Math.round(item.progress * 100)}%</div>;
  if (item.state === "done") return <div className={styles.fileMeta} data-tone="done"><IconCheck /> Documento enviado · {size}</div>;
  if (item.state === "error") return <div className={styles.fileMeta} data-tone="error"><IconAlert /> Falha no envio</div>;
  return <div className={styles.fileMeta}>{kind} · {size}</div>;
}

class UploadError extends Error {
  constructor(public status: number) {
    super(`upload failed: ${status}`);
  }
}

/** Envio com progresso real (XMLHttpRequest), direto para a URL de uso único. */
function putFile(url: string, file: File, mime: string, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", mime);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "max-age=3600");
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (key) xhr.setRequestHeader("apikey", key);
    xhr.timeout = 10 * 60 * 1000;
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new UploadError(xhr.status)));
    xhr.onerror = () => reject(new UploadError(0));
    xhr.ontimeout = () => reject(new UploadError(408));
    xhr.onabort = () => reject(new UploadError(0));
    xhr.send(file);
  });
}
