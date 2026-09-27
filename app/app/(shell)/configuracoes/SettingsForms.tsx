"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import { PASSWORD_RULE } from "@/lib/validation";
import { updatePassword } from "../../../(auth)/actions";
import { setConsent } from "../../actions";
import styles from "../pages.module.css";

export function ChangePasswordForm() {
  const [state, action] = useActionState(updatePassword, null);
  const errors = state?.fieldErrors ?? {};
  return (
    <form action={action} className={styles.formNarrow} noValidate>
      <Field name="password" label="Nova senha" type="password" autoComplete="new-password" required
        hint={PASSWORD_RULE} error={errors.password} />
      <Field name="password_confirmation" label="Confirme a nova senha" type="password" autoComplete="new-password"
        required error={errors.password_confirmation} />
      <div className={styles.panelActions}>
        <FormMessage state={state} />
        <SubmitButton className="btn btn-ghost" pendingText="Salvando…">Alterar senha</SubmitButton>
      </div>
    </form>
  );
}

/** Conceder/revogar um consentimento. Revogar um obrigatório pede confirmação. */
export function ConsentToggle({ documentId, granted, required, title }: {
  documentId: string;
  granted: boolean;
  required: boolean;
  title: string;
}) {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (granted && required) {
      const ok = window.confirm(
        `Revogar "${title}"?\n\nSem esta autorização não é possível usar a Biométrica. Você será levado para uma tela onde poderá autorizar novamente quando quiser.`,
      );
      if (!ok) event.preventDefault();
    }
  }

  return (
    <form action={setConsent} onSubmit={onSubmit}>
      <input type="hidden" name="document_id" value={documentId} />
      <input type="hidden" name="granted" value={granted ? "false" : "true"} />
      <SubmitButton className={granted ? (required ? "btn btn-danger" : "btn btn-ghost") : "btn btn-primary"} pendingText="Salvando…">
        {granted ? (required ? "Revogar" : "Desativar") : required ? "Autorizar" : "Ativar"}
      </SubmitButton>
    </form>
  );
}
