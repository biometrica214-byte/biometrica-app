"use client";

import { useState } from "react";
import { IconDownload, IconExternal, IconFile, IconImage } from "@/components/icons";
import type { DocumentMimeType } from "@/lib/database.types";
import { formatBytes } from "@/lib/exams";
import styles from "../exams.module.css";

type Doc = { id: string; original_filename: string; mime_type: DocumentMimeType; size_bytes: number };

/** Mostra o documento original (PDF ou imagem) servido pela rota protegida. */
export function DocumentViewer({ examId, documents }: { examId: string; documents: Doc[] }) {
  const [selected, setSelected] = useState(documents[0]?.id);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const doc = documents.find((d) => d.id === selected) ?? documents[0];
  if (!doc) {
    return <div className={styles.viewer}><p className={styles.viewerError}>Este exame não tem documentos.</p></div>;
  }
  const src = `/app/exames/${examId}/documentos/${doc.id}`;
  const isPdf = doc.mime_type === "application/pdf";

  return (
    <section aria-label="Documento original">
      {documents.length > 1 && (
        <div className={styles.docTabs} role="tablist" aria-label="Documentos do exame">
          {documents.map((d, i) => (
            <button key={d.id} type="button" role="tab" className={styles.docTab} aria-selected={d.id === doc.id}
              onClick={() => setSelected(d.id)}>
              {d.mime_type === "application/pdf" ? <IconFile /> : <IconImage />}
              Documento {i + 1}
            </button>
          ))}
        </div>
      )}
      <div className={styles.viewer} role={documents.length > 1 ? "tabpanel" : undefined}>
        <div className={styles.viewerHead}>
          <div className={styles.viewerName}>
            {doc.original_filename}
            <span>{isPdf ? "PDF" : "Imagem"} · {formatBytes(doc.size_bytes)} · original preservado</span>
          </div>
          <div className={styles.viewerActions}>
            <a href={src} target="_blank" rel="noopener" className="btn btn-ghost">
              <IconExternal /> Abrir
            </a>
            <a href={`${src}?download=1`} className="btn btn-ghost" download>
              <IconDownload /> Baixar
            </a>
          </div>
        </div>
        {failed[doc.id] ? (
          <p className={styles.viewerError} role="alert">
            Não foi possível exibir o documento aqui. Tente <a href={src} target="_blank" rel="noopener">abrir em outra aba</a> ou baixá-lo.
          </p>
        ) : isPdf ? (
          <iframe key={doc.id} src={src} title={`Documento: ${doc.original_filename}`} className={styles.frame} />
        ) : (
          <div className={styles.imageWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element -- arquivo privado, servido pela rota autenticada */}
            <img key={doc.id} src={src} alt={`Documento do exame: ${doc.original_filename}`} className={styles.image}
              onError={() => setFailed((f) => ({ ...f, [doc.id]: true }))} />
          </div>
        )}
      </div>
    </section>
  );
}
