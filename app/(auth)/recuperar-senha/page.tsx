"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import { requestPasswordReset } from "../actions";
import styles from "../auth.module.css";

export default function RecoverPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, null);

  return (
    <div className={styles.panel}>
      <title>Recuperar senha · Biométrica</title>
      <h1 className={styles.title}>Recuperar senha</h1>
      <p className={styles.subtitle}>Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.</p>
      <form action={action} className={styles.form} noValidate>
        <FormMessage state={state} />
        {!state?.success && (
          <>
            <Field name="email" label="E-mail" type="email" autoComplete="email" inputMode="email" required
              defaultValue={state?.values?.email} error={state?.fieldErrors?.email} />
            <div className={styles.actions}>
              <SubmitButton pendingText="Enviando…">Enviar link</SubmitButton>
            </div>
          </>
        )}
      </form>
      <p className={styles.switch}>
        Lembrou a senha? <Link href="/login">Entrar</Link>
      </p>
    </div>
  );
}
