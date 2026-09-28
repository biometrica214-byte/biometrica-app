import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrow } from "@/components/icons";
import { getExam, getExamCategories, getExamFilterOptions } from "@/lib/exam-data";
import pages from "../../../pages.module.css";
import styles from "../../exams.module.css";
import { EditExamForm } from "./EditExamForm";

export const metadata: Metadata = { title: "Editar exame" };

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, categories, options] = await Promise.all([getExam(id), getExamCategories(), getExamFilterOptions()]);
  if (!data) notFound();
  const { exam } = data;

  return (
    <>
      <header className={pages.header}>
        <Link href={`/app/exames/${exam.id}`} className={styles.back}><IconArrow /> {exam.title}</Link>
        <h1 className={pages.title}>Editar informações</h1>
        <p className={pages.lead}>Corrija o nome, o tipo, a data da coleta, o laboratório ou as observações.</p>
      </header>
      <EditExamForm
        examId={exam.id}
        initial={{
          title: exam.title,
          category: exam.category,
          collected_on: exam.collected_on,
          laboratory: exam.laboratory ?? "",
          notes: exam.notes ?? "",
        }}
        categories={categories.map(({ slug, label }) => ({ slug, label }))}
        laboratories={options.laboratories}
      />
    </>
  );
}
