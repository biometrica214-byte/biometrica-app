import type { Metadata } from "next";
import Link from "next/link";
import { EmptyChart } from "@/components/EmptyChart";
import { IconPlus } from "@/components/icons";
import { getProfile } from "@/lib/data";
import styles from "./pages.module.css";

export const metadata: Metadata = { title: "Visão geral" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const [profile, params] = await Promise.all([getProfile(), searchParams]);
  const firstName = profile?.first_name;

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Visão geral</p>
        <h1 className={styles.title}>{firstName ? `Olá, ${firstName}` : "Olá"}</h1>
        <p className={styles.lead}>Sua história de saúde começa aqui.</p>
        {params.senha === "alterada" && (
          <div className="notice notice-success" role="status">Sua senha foi alterada.</div>
        )}
      </header>

      <section className={styles.section} aria-labelledby="next-step">
        <h2 className={styles.sectionTitle} id="next-step">Próximo passo</h2>
        <div className={styles.nextStep}>
          <div>
            <h2>Adicione seu primeiro exame</h2>
            <p>Um PDF ou uma foto de um resultado que você já tem, de qualquer laboratório ou época. É a partir dele que seu histórico começa.</p>
          </div>
          <Link href="/app/exames" className="btn btn-primary">
            <IconPlus />
            Adicionar exame
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="evolution">
        <h2 className={styles.sectionTitle} id="evolution">Sua evolução</h2>
        <div className={styles.empty}>
          <EmptyChart className={styles.emptyArt} />
          <h3>Nada por aqui ainda</h3>
          <p>Seus dados aparecerão aqui conforme você adicionar exames.</p>
        </div>
      </section>
    </>
  );
}
