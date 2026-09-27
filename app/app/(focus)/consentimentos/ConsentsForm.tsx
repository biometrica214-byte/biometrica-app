"use client";

import { startTransition, useActionState, useState } from "react";
import { ConsentLabel, consentNote } from "@/components/ConsentLabel";
import { FormMessage, SubmitButton } from "@/components/forms";
import type { ConsentStatus } from "@/lib/database.types";
import { acceptConsents } from "../../actions";
import auth from "../../../(auth)/auth.module.css";
import styles from "../focus.module.css";

export function ConsentsForm({ pending }: { pending: ConsentStatus[] }) {
  const [state, action, isPending] = useActionState(acceptConsents, null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const errors = state?.fieldErrors ?? {};

  // Envio manual (sem <form action>) para o React não limpar as marcações quando há erro.
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => action(form));
  }

  return (
    <section>
      <h1 className={styles.title}>Antes de continuar</h1>
      <p className={styles.lead}>
        Precisamos da sua autorização para os itens abaixo. Cada um é registrado separadamente, com a versão do
        documento e a data.
      </p>
      <form onSubmit={submit} className={styles.body} noValidate>
        <FormMessage state={state?.error ? state : null} />
        <div className={auth.consentList}>
          {pending.map((doc) => {
            const id = `consent-${doc.type}`;
            const note = consentNote(doc.type);
            const error = errors[`consent_${doc.type}`];
            return (
              <div key={doc.document_id} className={auth.consentItem} data-sensitive={doc.type === "health_data"}>
                <label className="check" htmlFor={id}>
                  <input id={id} type="checkbox" name={`consent_${doc.type}`} value={doc.version}
                    checked={!!checked[doc.type]}
                    onChange={(e) => setChecked((c) => ({ ...c, [doc.type]: e.target.checked }))}
                    aria-invalid={error ? true : undefined} />
                  <ConsentLabel doc={doc} />
                </label>
                {note && <p className={auth.consentNote}>{note}</p>}
                {error && <p className="field-error" style={{ margin: "8px 0 0 32px" }}>{error}</p>}
              </div>
            );
          })}
        </div>
        <div className={styles.actions}>
          <SubmitButton className="btn btn-primary" pending={isPending} pendingText="Salvando…">Continuar</SubmitButton>
        </div>
      </form>
    </section>
  );
}
