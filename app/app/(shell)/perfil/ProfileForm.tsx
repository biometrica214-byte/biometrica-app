"use client";

import { useActionState } from "react";
import { BasicInfoFields } from "@/components/BasicInfoFields";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import type { Profile } from "@/lib/database.types";
import { updateProfile } from "../../actions";
import styles from "../pages.module.css";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, action] = useActionState(updateProfile, null);
  const errors = state?.fieldErrors ?? {};
  const v = state?.values;

  return (
    <form action={action} className={styles.formNarrow} noValidate>
      <input type="hidden" name="scope" value="full" />
      <div className="field-row">
        <Field name="first_name" label="Nome" autoComplete="given-name" required
          defaultValue={v?.first_name ?? profile.first_name} error={errors.first_name} />
        <Field name="last_name" label="Sobrenome" autoComplete="family-name" required
          defaultValue={v?.last_name ?? profile.last_name} error={errors.last_name} />
      </div>
      <Field name="email_display" label="E-mail" type="email" value={email} readOnly
        hint="O e-mail é usado para entrar na sua conta." />
      <div style={{ marginTop: 22 }}>
        <BasicInfoFields
          key={state?.success ?? "form"}
          birthDate={v?.birth_date ?? profile.birth_date}
          sex={v?.biological_sex || profile.biological_sex}
          errors={errors}
        />
      </div>
      <div className={styles.panelActions}>
        <FormMessage state={state} />
        <SubmitButton className="btn btn-primary" pendingText="Salvando…">Salvar alterações</SubmitButton>
      </div>
    </form>
  );
}
