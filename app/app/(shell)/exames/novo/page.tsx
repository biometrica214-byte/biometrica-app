import type { Metadata } from "next";
import Link from "next/link";
import { IconArrow } from "@/components/icons";
import { getExamCategories, getExamFilterOptions } from "@/lib/exam-data";
import pages from "../../pages.module.css";
import styles from "../exams.module.css";
import { NewExamForm } from "./NewExamForm";

export const metadata: Metadata = { title: "Adicionar exame" };

export default async function NewExamPage() {
  const [categories, options] = await Promise.all([getExamCategories(), getExamFilterOptions()]);
  return (
    <>
      <header className={pages.header}>
        <Link href="/app/exames" className={styles.back}><IconArrow /> Meus exames</Link>
        <h1 className={pages.title}>Adicionar exame</h1>
        <p className={pages.lead}>
          Informe o básico e envie o documento original. Ele fica guardado exatamente como você enviou, com acesso
          só seu.
        </p>
      </header>
      <NewExamForm
        categories={categories.map(({ slug, label }) => ({ slug, label }))}
        laboratories={options.laboratories}
      />
    </>
  );
}
