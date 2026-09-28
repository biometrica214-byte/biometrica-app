"use client";

import { useActionState, useRef } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { IconTrash } from "@/components/icons";
import { deleteExam } from "../actions";
import styles from "../exams.module.css";

export function DeleteExamButton({ examId, title }: { examId: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action] = useActionState(deleteExam, null);

  return (
    <>
      <button type="button" className="btn btn-danger" onClick={() => dialog.current?.showModal()}>
        <IconTrash style={{ width: 18, height: 18 }} /> Excluir exame
      </button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="delete-title" aria-describedby="delete-desc">
        <form action={action}>
          <input type="hidden" name="exam_id" value={examId} />
          <div className={styles.dialogBody}>
            <h2 id="delete-title">Excluir este exame?</h2>
            <p id="delete-desc">
              <strong>{title}</strong> e seus documentos originais serão apagados permanentemente. Esta ação não pode
              ser desfeita.
            </p>
            <FormMessage state={state} />
          </div>
          <div className={styles.dialogActions}>
            <button type="button" className="btn btn-ghost" onClick={() => dialog.current?.close()} autoFocus>
              Cancelar
            </button>
            <SubmitButton className="btn btn-danger" pendingText="Excluindo…">Excluir definitivamente</SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
