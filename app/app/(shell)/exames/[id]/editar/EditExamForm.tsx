"use client";

import Link from "next/link";
import { useActionState, useState, startTransition } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import type { ExamFields } from "@/lib/exam-fields";
import { updateExam } from "../../actions";
import { ExamFieldsInputs } from "../../ExamFieldsInputs";
import styles from "../../exams.module.css";

export function EditExamForm({ examId, initial, categories, laboratories }: {
  examId: string;
  initial: ExamFields;
  categories: { slug: string; label: string }[];
  laboratories: string[];
}) {
  const [values, setValues] = useState(initial);
  const [state, action, pending] = useActionState(updateExam, null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => action(form));
  }

  return (
    <form onSubmit={submit} className={styles.formBlock} style={{ maxWidth: 640 }} noValidate>
      <input type="hidden" name="exam_id" value={examId} />
      <ExamFieldsInputs values={values} onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
        errors={state?.fieldErrors} categories={categories} laboratories={laboratories} disabled={pending} />
      <p className="hint" style={{ marginTop: 18, fontSize: 13, color: "var(--ink-faint)" }}>
        O documento original não é alterado por aqui — ele permanece exatamente como foi enviado.
      </p>
      <div className={styles.formActions} style={{ marginTop: 22 }}>
        <FormMessage state={state?.error ? state : null} />
        <SubmitButton className="btn btn-primary" pending={pending} pendingText="Salvando…">Salvar alterações</SubmitButton>
        <Link href={`/app/exames/${examId}`} className="btn btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
