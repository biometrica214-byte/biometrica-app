"use client";

import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import { PASSWORD_RULE } from "@/lib/validation";
import { updatePassword } from "../actions";
import styles from "../auth.module.css";

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePassword, null);
  const errors = state?.fieldErrors ?? {};
  return (
    <form action={action} className={styles.form} noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="redirect" value="app" />
      <Field name="password" label="Nova senha" type="password" autoComplete="new-password" required
        hint={PASSWORD_RULE} error={errors.password} />
      <Field name="password_confirmation" label="Confirme a nova senha" type="password" autoComplete="new-password"
        required error={errors.password_confirmation} />
      <div className={styles.actions}>
        <SubmitButton pendingText="Salvando…">Salvar nova senha</SubmitButton>
      </div>
    </form>
  );
}
