"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import { signIn } from "../actions";
import styles from "../auth.module.css";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, null);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className={styles.form} noValidate>
      <FormMessage state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <Field
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.values?.email}
        error={errors.email}
      />
      <Field
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />
      <div className={styles.forgot}>
        <Link href="/recuperar-senha">Esqueci minha senha</Link>
      </div>
      <div className={styles.actions}>
        <SubmitButton pendingText="Entrando…">Entrar</SubmitButton>
      </div>
    </form>
  );
}
