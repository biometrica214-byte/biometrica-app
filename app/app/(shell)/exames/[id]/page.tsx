import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrow, IconCheck, IconEdit } from "@/components/icons";
import { getExam, getExamCategories } from "@/lib/exam-data";
import { formatCollectedOn, formatDateTime } from "@/lib/exams";
import pages from "../../pages.module.css";
import { StatusBadge } from "../ExamBits";
import styles from "../exams.module.css";
import { DeleteExamButton } from "./DeleteExamButton";
import { DocumentViewer } from "./DocumentViewer";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ aviso?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getExam(id);
  return { title: data ? data.exam.title : "Exame não encontrado" };
}

const NOTICES: Record<string, string> = {
  novo: "Exame recebido.",
  editado: "Informações atualizadas.",
};

export default async function ExamPage({ params, searchParams }: Props) {
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  const data = await getExam(id);
  if (!data) notFound(); // inexistente ou de outra pessoa: a mesma resposta

  const { exam, documents } = data;
  const categories = await getExamCategories();
  const categoryLabel = categories.find((c) => c.slug === exam.category)?.label ?? "Outro";
  const notice = aviso ? NOTICES[aviso] : undefined;

  return (
    <>
      <header className={pages.header}>
        <Link href="/app/exames" className={styles.back}><IconArrow /> Meus exames</Link>
        <p className={pages.eyebrow}>{categoryLabel}</p>
        <h1 className={pages.title}>{exam.title}</h1>
        <p className={pages.lead}>
          Coletado em {formatCollectedOn(exam.collected_on, "long")}
          {exam.laboratory ? ` · ${exam.laboratory}` : ""}
        </p>
        {notice && (
          <div className="notice notice-success" role="status">
            <IconCheck style={{ width: 18, height: 18, flex: "none" }} /> {notice}
          </div>
        )}
      </header>

      <div className={styles.detail}>
        <DocumentViewer
          examId={exam.id}
          documents={documents.map(({ id, original_filename, mime_type, size_bytes }) => ({ id, original_filename, mime_type, size_bytes }))}
        />

        <aside className={styles.facts} aria-label="Informações do exame">
          <dl>
            <div><dt>Status</dt><dd><StatusBadge status={exam.status} /></dd></div>
            <div><dt>Tipo</dt><dd>{categoryLabel}</dd></div>
            <div><dt>Data da coleta</dt><dd>{formatCollectedOn(exam.collected_on, "long")}</dd></div>
            <div><dt>Laboratório</dt><dd>{exam.laboratory ?? "Não informado"}</dd></div>
            {exam.notes && <div><dt>Observações</dt><dd className={styles.notes}>{exam.notes}</dd></div>}
            <div><dt>Enviado em</dt><dd>{formatDateTime(exam.created_at)}</dd></div>
            <div><dt>Documentos</dt><dd>{documents.length === 1 ? "1 documento original" : `${documents.length} documentos originais`}</dd></div>
          </dl>
          {exam.status === "uploaded" && (
            <p className={styles.factsNote}>
              Documento recebido e guardado. A leitura automática dos resultados ainda não está disponível.
            </p>
          )}
          <div className={styles.factsActions}>
            <Link href={`/app/exames/${exam.id}/editar`} className="btn btn-ghost">
              <IconEdit style={{ width: 18, height: 18 }} /> Editar informações
            </Link>
            <DeleteExamButton examId={exam.id} title={exam.title} />
          </div>
        </aside>
      </div>
    </>
  );
}
