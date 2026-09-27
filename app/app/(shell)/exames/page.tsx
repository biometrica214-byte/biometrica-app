import type { Metadata } from "next";
import Link from "next/link";
import { IconExams } from "@/components/icons";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "Meus exames" };

// Placeholder: o envio de exames é construído no Bloco 2.
export default function ExamsPage() {
  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Meus exames</p>
        <h1 className={styles.title}>Seus exames</h1>
        <p className={styles.lead}>Todos os resultados que você enviar ficarão reunidos aqui, organizados por data.</p>
      </header>

      <div className={styles.empty}>
        <IconExams style={{ width: 36, height: 36, color: "var(--teal)", margin: "0 auto 18px" }} />
        <h3>O envio de exames está chegando</h3>
        <p>
          Em breve você poderá enviar PDFs e fotos dos seus resultados por aqui. Sua conta já está pronta para
          recebê-los.
        </p>
        <Link href="/app" className="btn btn-ghost">Voltar para a visão geral</Link>
      </div>
    </>
  );
}
