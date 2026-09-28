import type { Metadata } from "next";
import Link from "next/link";
import { EmptyChart } from "@/components/EmptyChart";
import { IconChevron, IconPlus } from "@/components/icons";
import { getProfile } from "@/lib/data";
import { getExamCategories, getRecentExams } from "@/lib/exam-data";
import { formatCollectedOn } from "@/lib/exams";
import { CategoryIcon, StatusBadge } from "./exames/ExamBits";
import exams from "./exames/exams.module.css";
import styles from "./pages.module.css";

export const metadata: Metadata = { title: "Visão geral" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const [profile, params, recent, categories] = await Promise.all([
    getProfile(),
    searchParams,
    getRecentExams(3),
    getExamCategories(),
  ]);
  const firstName = profile?.first_name;
  const labels = Object.fromEntries(categories.map((c) => [c.slug, c.label]));
  const hasExams = recent.total > 0;

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Visão geral</p>
        <h1 className={styles.title}>{firstName ? `Olá, ${firstName}` : "Olá"}</h1>
        <p className={styles.lead}>
          {hasExams
            ? `Você tem ${recent.total === 1 ? "1 exame guardado" : `${recent.total} exames guardados`} na Biométrica.`
            : "Sua história de saúde começa aqui."}
        </p>
        {params.senha === "alterada" && (
          <div className="notice notice-success" role="status">Sua senha foi alterada.</div>
        )}
      </header>

      {!hasExams ? (
        <section className={styles.section} aria-labelledby="next-step">
          <h2 className={styles.sectionTitle} id="next-step">Próximo passo</h2>
          <div className={styles.nextStep}>
            <div>
              <h2>Sua história começa aqui.</h2>
              <p>Adicione seu primeiro exame — um PDF ou uma foto de um resultado que você já tem, de qualquer laboratório ou época.</p>
            </div>
            <Link href="/app/exames/novo" className="btn btn-primary">
              <IconPlus />
              Adicionar exame
            </Link>
          </div>
        </section>
      ) : (
        <section className={styles.section} aria-labelledby="recent">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h2 className={styles.sectionTitle} id="recent">Enviados recentemente</h2>
            <Link href="/app/exames" style={{ fontSize: 14, color: "var(--teal)" }}>Ver todos</Link>
          </div>
          <ul className={exams.list}>
            {recent.items.map((exam) => (
              <li key={exam.id} className={exams.row}>
                <Link href={`/app/exames/${exam.id}`} className={exams.rowLink}>
                  <span className={exams.rowIcon} aria-hidden="true"><CategoryIcon category={exam.category} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className={exams.rowTitle} style={{ display: "block" }}>{exam.title}</span>
                    <span className={exams.rowSub} style={{ display: "block" }}>
                      {labels[exam.category] ?? "Outro"}{exam.laboratory ? ` · ${exam.laboratory}` : ""}
                    </span>
                  </span>
                  <span className={exams.rowDate}>{formatCollectedOn(exam.collected_on)}</span>
                  <span className={exams.rowMeta} />
                  <span className={exams.rowEnd}><StatusBadge status={exam.status} /><IconChevron aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16 }}>
            <Link href="/app/exames/novo" className="btn btn-ghost"><IconPlus style={{ width: 18, height: 18 }} /> Adicionar exame</Link>
          </div>
        </section>
      )}

      <section className={styles.section} aria-labelledby="evolution">
        <h2 className={styles.sectionTitle} id="evolution">Sua evolução</h2>
        <div className={styles.empty}>
          <EmptyChart className={styles.emptyArt} />
          <h3>Nada por aqui ainda</h3>
          <p>
            {hasExams
              ? "Seus documentos estão guardados. A evolução dos seus resultados aparecerá aqui quando a leitura automática dos exames estiver disponível."
              : "Seus dados aparecerão aqui conforme você adicionar exames."}
          </p>
        </div>
      </section>
    </>
  );
}
