"use client";

import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/action-state";

/** Botão de envio com estado de carregamento automático. */
export function SubmitButton({
  children,
  pendingText,
  className = "btn btn-primary btn-block",
  pending: forcedPending,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string; pending?: boolean }) {
  const status = useFormStatus();
  const pending = forcedPending ?? status.pending;
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending} {...rest}>
      {pending && <span className="spinner" aria-hidden="true" />}
      {pending ? (pendingText ?? children) : children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state?.error) {
    return (
      <div className="notice notice-error" role="alert">
        {state.error}
      </div>
    );
  }
  if (state?.success) {
    return (
      <div className="notice notice-success" role="status">
        {state.success}
      </div>
    );
  }
  return null;
}

type FieldProps = {
  name: string;
  label: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

/** Campo com rótulo, dica e erro ligados por acessibilidade. */
export function Field({ name, label, error, hint, id, ...input }: FieldProps) {
  const inputId = id ?? `f-${name}`;
  const describedBy = [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={name}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...input}
      />
      {hint && (
        <span id={`${inputId}-hint`} className="hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
