import { Field } from "@/components/forms";
import type { ExamFields } from "@/lib/exam-fields";
import type { FieldErrors } from "@/lib/validation";
import styles from "./exams.module.css";

const TITLE_SUGGESTIONS = [
  "Hemograma completo", "Perfil lipídico", "Glicemia em jejum", "Hemoglobina glicada", "TSH e T4 livre",
  "Vitamina D", "Vitamina B12", "Ferritina", "Função renal", "Função hepática", "Urina tipo 1",
  "Ultrassonografia", "Raio-X", "Ressonância magnética", "Tomografia", "Eletrocardiograma", "Check-up anual",
];

/**
 * Campos do exame, reaproveitados em "novo" e "editar". Controlados por quem usa
 * (valores + onChange), para não se perderem entre tentativas de envio.
 */
export function ExamFieldsInputs({
  values,
  onChange,
  errors = {},
  categories,
  laboratories,
  disabled,
}: {
  values: ExamFields;
  onChange: (name: keyof ExamFields, value: string) => void;
  errors?: FieldErrors;
  categories: { slug: string; label: string }[];
  laboratories: string[];
  disabled?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <fieldset disabled={disabled} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={errors.category ? "category-error" : undefined}>
        <legend className="label" style={{ padding: 0, marginBottom: 10 }}>Tipo de exame</legend>
        <div className={styles.chips}>
          {categories.map((c) => (
            <label key={c.slug} className={styles.chip}>
              <input type="radio" name="category" value={c.slug} checked={values.category === c.slug}
                onChange={() => onChange("category", c.slug)} />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
        {errors.category && <span id="category-error" className="field-error">{errors.category}</span>}
      </fieldset>

      <div style={{ marginTop: 20 }}>
        <Field name="title" label="Nome do exame" required maxLength={120} list="exam-title-suggestions"
          placeholder="Ex.: Hemograma completo" value={values.title} onChange={(e) => onChange("title", e.target.value)}
          error={errors.title} autoComplete="off" />
        <datalist id="exam-title-suggestions">
          {TITLE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
        </datalist>
      </div>

      <Field name="collected_on" label="Data da coleta" type="date" required min="1900-01-01" max={today}
        value={values.collected_on} onChange={(e) => onChange("collected_on", e.target.value)} error={errors.collected_on}
        hint="O dia em que o exame foi feito — não o dia do envio." style={{ maxWidth: 260 }} />

      <Field name="laboratory" label={<>Laboratório <span className={styles.optional}>(opcional)</span></>}
        maxLength={120} list="exam-lab-suggestions" placeholder="Ex.: Laboratório Exemplo" value={values.laboratory}
        onChange={(e) => onChange("laboratory", e.target.value)} error={errors.laboratory} autoComplete="off" />
      <datalist id="exam-lab-suggestions">
        {laboratories.map((l) => <option key={l} value={l} />)}
      </datalist>

      <div className="field">
        <label htmlFor="f-notes">Observações <span className={styles.optional}>(opcional)</span></label>
        <textarea id="f-notes" name="notes" className={`input ${styles.textarea}`} maxLength={2000}
          placeholder="Algo que você queira lembrar sobre este exame" value={values.notes}
          onChange={(e) => onChange("notes", e.target.value)} aria-invalid={errors.notes ? true : undefined} />
        {errors.notes && <span className="field-error">{errors.notes}</span>}
      </div>
    </fieldset>
  );
}
