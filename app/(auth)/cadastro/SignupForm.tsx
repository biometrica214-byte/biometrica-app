"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { ConsentLabel, consentNote } from "@/components/ConsentLabel";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import type { LegalDocument } from "@/lib/database.types";
import {
  type FieldErrors,
  PASSWORD_RULE,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/validation";
import { signUp } from "../actions";
import styles from "../auth.module.css";

const STEP_ONE_FIELDS = ["first_name", "last_name", "email", "password", "password_confirmation"];

type Docs = Pick<LegalDocument, "type" | "title" | "path" | "version" | "required" | "is_placeholder">[];

export function SignupForm({ documents }: { documents: Docs }) {
  const [state, action, pending] = useActionState(signUp, null);
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState({ first_name: "", last_name: "", email: "", password: "", password_confirmation: "" });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const errors = { ...clientErrors, ...(state?.fieldErrors ?? {}) };

  // Erro do servidor em algum campo da etapa 1: volta para ela.
  useEffect(() => {
    if (state?.fieldErrors && STEP_ONE_FIELDS.some((f) => state.fieldErrors?.[f])) setStep(1);
    if (state?.error) setStep(1);
  }, [state]);

  // Ao trocar de etapa, leva o foco ao título (leitores de tela anunciam a mudança).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  if (state?.success === "check-email") {
    return (
      <div className={styles.done}>
        <div className={styles.doneIcon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5.5h14v9H3z" stroke="currentColor" strokeWidth="1.5" /><path d="M3 6l7 5 7-5" stroke="currentColor" strokeWidth="1.5" /></svg>
        </div>
        <h1 className={styles.title}>Confirme seu e-mail</h1>
        <p className={styles.subtitle}>
          Enviamos um link de confirmação para <strong>{state.values?.email}</strong>. Abra o e-mail e clique no link para
          ativar sua conta. Se não encontrar, verifique a pasta de spam.
        </p>
        <p className={styles.switch}>
          Já confirmou? <Link href="/login">Entrar</Link>
        </p>
      </div>
    );
  }

  function update(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (clientErrors[name]) setClientErrors((e) => ({ ...e, [name]: undefined }));
  }

  function continueToConsents() {
    const next: FieldErrors = {
      first_name: validateName(values.first_name.trim(), "nome"),
      last_name: validateName(values.last_name.trim(), "sobrenome"),
      email: validateEmail(values.email.trim()),
      password: validatePassword(values.password),
      password_confirmation: validatePasswordConfirmation(values.password, values.password_confirmation),
    };
    setClientErrors(next);
    if (!Object.values(next).some(Boolean)) setStep(2);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) return continueToConsents();

    const missing: FieldErrors = {};
    for (const doc of documents) {
      if (doc.required && !checked[doc.type]) missing[`consent_${doc.type}`] = "Necessário para criar sua conta.";
    }
    setClientErrors(missing);
    if (Object.keys(missing).length) return;

    const form = new FormData(event.currentTarget);
    startTransition(() => action(form));
  }

  const required = documents.filter((d) => d.required);
  const optional = documents.filter((d) => !d.required);

  return (
    <>
      <h1 className={styles.title} ref={headingRef} tabIndex={-1} style={{ outline: "none" }}>
        {step === 1 ? "Criar sua conta" : "Antes de começar"}
      </h1>
      <p className={styles.subtitle}>
        {step === 1
          ? "Leva menos de um minuto."
          : "Seus dados de saúde merecem cuidado. Por isso pedimos cada autorização separadamente."}
      </p>
      <div className={styles.progress} aria-hidden="true">
        <span data-active="true" />
        <span data-active={step === 2} />
      </div>
      <p className={styles.stepLabel}>Etapa {step} de 2 · {step === 1 ? "Seus dados" : "Consentimentos"}</p>

      <form onSubmit={submit} className={styles.form} noValidate>
        <FormMessage state={state?.error ? state : null} />

        {/* Etapa 1 continua no DOM (oculta) para ser enviada junto com a etapa 2. */}
        <fieldset hidden={step !== 1} style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="sr-only">Seus dados</legend>
          <div className="field-row">
            <Field name="first_name" label="Nome" autoComplete="given-name" required value={values.first_name}
              onChange={(e) => update("first_name", e.target.value)} error={errors.first_name} />
            <Field name="last_name" label="Sobrenome" autoComplete="family-name" required value={values.last_name}
              onChange={(e) => update("last_name", e.target.value)} error={errors.last_name} />
          </div>
          <Field name="email" label="E-mail" type="email" autoComplete="email" inputMode="email" required
            value={values.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
          <Field name="password" label="Senha" type="password" autoComplete="new-password" required
            value={values.password} onChange={(e) => update("password", e.target.value)}
            hint={PASSWORD_RULE} error={errors.password} />
          <Field name="password_confirmation" label="Confirme a senha" type="password" autoComplete="new-password" required
            value={values.password_confirmation} onChange={(e) => update("password_confirmation", e.target.value)}
            error={errors.password_confirmation} />
          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary btn-block">Continuar</button>
          </div>
        </fieldset>

        <fieldset hidden={step !== 2} style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="sr-only">Consentimentos</legend>
          <div className={styles.consentList}>
            <p className={styles.consentHeading}>Necessários</p>
            {required.map((doc) => (
              <ConsentItem key={doc.type} doc={doc} checked={!!checked[doc.type]} error={errors[`consent_${doc.type}`]}
                onChange={(value) => {
                  setChecked((c) => ({ ...c, [doc.type]: value }));
                  setClientErrors((e) => ({ ...e, [`consent_${doc.type}`]: undefined }));
                }} />
            ))}
            {optional.length > 0 && <p className={styles.consentHeading} style={{ marginTop: 10 }}>Opcional</p>}
            {optional.map((doc) => (
              <ConsentItem key={doc.type} doc={doc} checked={!!checked[doc.type]}
                onChange={(value) => setChecked((c) => ({ ...c, [doc.type]: value }))} />
            ))}
          </div>
          <div className={styles.actions}>
            <SubmitButton pending={pending} pendingText="Criando conta…">Criar conta</SubmitButton>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setStep(1)} disabled={pending}>
              Voltar
            </button>
          </div>
        </fieldset>
      </form>

      <p className={styles.switch}>
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </>
  );
}

function ConsentItem({ doc, checked, onChange, error }: {
  doc: Docs[number];
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}) {
  const id = `consent-${doc.type}`;
  const note = consentNote(doc.type);
  return (
    <div className={styles.consentItem} data-sensitive={doc.type === "health_data"}>
      <label className="check" htmlFor={id}>
        <input id={id} type="checkbox" name={`consent_${doc.type}`} value={doc.version} checked={checked}
          onChange={(e) => onChange(e.target.checked)} aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined} />
        <ConsentLabel doc={doc} />
      </label>
      {note && <p className={styles.consentNote}>{note}</p>}
      {error && <p id={`${id}-error`} className="field-error" style={{ margin: "8px 0 0 32px" }}>{error}</p>}
    </div>
  );
}
