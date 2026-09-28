import type { Metadata } from "next";
import Link from "next/link";
import { IconChevron, IconExams, IconPlus } from "@/components/icons";
import { getExamCategories, getExamFilterOptions, listExams, type ExamListItem } from "@/lib/exam-data";
import { formatCollectedOn, formatDateTime } from "@/lib/exams";
import pages from "../pages.module.css";
import { CategoryIcon, StatusBadge } from "./ExamBits";
import { ExamFilters } from "./ExamFilters";
import styles from "./exams.module.css";

export const metadata: Metadata = { title: "Meus exames" };

type Search = Record<string, string | undefined>;

const NOTICES: Record<string, string> = { excluido: "Exame excluído, junto com seus documentos." };

export default async function ExamsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const values = {
    q: params.q ?? "",
    tipo: params.tipo ?? "",
    ano: params.ano ?? "",
    laboratorio: params.laboratorio ?? "",
    ordem: params.ordem ?? "",
  };
  const order = values.ordem === "antigos" || values.ordem === "envio" ? values.ordem : "recentes";
  const page = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);

  const [categories, options, result] = await Promise.all([
    getExamCategories(),
    getExamFilterOptions(),
    listExams({ q: values.q, category: values.tipo, year: values.ano, laboratory: values.laboratorio, order, page }),
  ]);
  const labels = Object.fromEntries(categories.map((c) => [c.slug, c.label]));
  const filtering = Boolean(values.q || values.tipo || values.ano || values.laboratorio);
  const notice = params.aviso ? NOTICES[params.aviso] : undefined;

  const header = (
    <header className={`${pages.header} ${styles.pageHead}`}>
      <div>
        <p className={pages.eyebrow}>Meus exames</p>
        <h1 className={pages.title}>Meus exames</h1>
        <p className={pages.lead}>Reúna seus resultados em um único lugar e acompanhe sua história ao longo do tempo.</p>
      </div>
      <Link href="/app/exames/novo" className="btn btn-primary">
        <IconPlus />
        Adicionar exame
      </Link>
      {notice && <div className="notice notice-success" role="status" style={{ flexBasis: "100%" }}>{notice}</div>}
    </header>
  );

  // Nenhum exame na conta: estado vazio, sem filtros.
  if (options.total === 0) {
    return (
      <>
        {header}
        <div className={pages.empty}>
          <div className={styles.emptyIcon} aria-hidden="true"><IconExams /></div>
          <h3>Sua história começa aqui.</h3>
          <p>Adicione seu primeiro exame para começar a construir seu histórico de saúde. Pode ser um PDF ou uma foto, de qualquer laboratório ou época.</p>
          <Link href="/app/exames/novo" className="btn btn-primary">Adicionar primeiro exame</Link>
        </div>
      </>
    );
  }

  const byYear = order !== "envio";
  const groups: { year: string; items: ExamListItem[] }[] = [];
  for (const item of result.items) {
    const year = byYear ? item.collected_on.slice(0, 4) : "";
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.items.push(item);
    else groups.push({ year, items: [item] });
  }

  const pageHref = (p: number) => {
    const qs = new URLSearchParams(Object.entries({ ...values, pagina: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `/app/exames?${qs.toString()}`;
  };

  return (
    <>
      {header}
      <ExamFilters values={values} categories={categories} years={options.years} laboratories={options.laboratories} />

      <div className={styles.toolbarFoot} aria-live="polite">
        <span>
          {result.total === 1 ? "1 exame" : `${result.total} exames`}
          {filtering && (result.total === 1 ? " encontrado" : " encontrados")}
        </span>
        {filtering && <Link href="/app/exames">Limpar filtros</Link>}
      </div>

      {result.items.length === 0 ? (
        <div className={pages.empty}>
          <h3>Nenhum exame encontrado</h3>
          <p>Tente buscar por outro termo ou remover algum filtro.</p>
          <Link href="/app/exames" className="btn btn-ghost">Limpar filtros</Link>
        </div>
      ) : (
        groups.map((group, index) => (
          <section key={`${group.year}-${index}`} aria-label={group.year ? `Exames de ${group.year}` : "Exames"}>
            {group.year && (
              <h2 className={styles.yearHead}>
                <strong>{group.year}</strong>
                {group.items.length === 1 ? "1 exame" : `${group.items.length} exames`}
              </h2>
            )}
            <ul className={styles.list} style={group.year ? undefined : { marginTop: 12 }}>
              {group.items.map((exam) => (
                <li key={exam.id} className={styles.row}>
                  <Link href={`/app/exames/${exam.id}`} className={styles.rowLink}>
                    <span className={styles.rowIcon} aria-hidden="true"><CategoryIcon category={exam.category} /></span>
                    <span style={{ minWidth: 0 }}>
                      <span className={styles.rowTitle} style={{ display: "block" }}>{exam.title}</span>
                      <span className={styles.rowSub} style={{ display: "block" }}>
                        {labels[exam.category] ?? "Outro"}{exam.laboratory ? ` · ${exam.laboratory}` : ""}
                      </span>
                    </span>
                    <span className={styles.rowDate}>
                      <span className="sr-only">Data da coleta: </span>
                      {formatCollectedOn(exam.collected_on)}
                    </span>
                    <span className={styles.rowMeta}>
                      {exam.document_count === 1 ? "1 documento" : `${exam.document_count} documentos`}
                      <br />
                      Enviado em {formatDateTime(exam.created_at).split(",")[0]}
                    </span>
                    <span className={styles.rowEnd}>
                      <StatusBadge status={exam.status} />
                      <IconChevron aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {result.pageCount > 1 && (
        <nav className={styles.pager} aria-label="Paginação">
          {result.page > 1 ? <Link href={pageHref(result.page - 1)} className="btn btn-ghost">Anteriores</Link> : <span />}
          <span>Página {result.page} de {result.pageCount}</span>
          {result.page < result.pageCount ? <Link href={pageHref(result.page + 1)} className="btn btn-ghost">Próximos</Link> : <span />}
        </nav>
      )}
    </>
  );
}
