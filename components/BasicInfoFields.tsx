import type { FieldErrors } from "@/lib/validation";

const SEX_OPTIONS = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "none", label: "Prefiro não informar" },
];

/**
 * Data de nascimento e sexo biológico — os dois únicos dados de perfil de que
 * o produto precisa além do nome, pois definem as faixas de referência dos exames.
 */
export function BasicInfoFields({
  birthDate,
  sex,
  errors = {},
}: {
  birthDate?: string | null;
  sex?: string | null;
  errors?: FieldErrors;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <div className="field">
        <label htmlFor="f-birth_date">Data de nascimento <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(opcional)</span></label>
        <input id="f-birth_date" name="birth_date" type="date" className="input" min="1900-01-01" max={today}
          autoComplete="bday" defaultValue={birthDate ?? ""} aria-invalid={errors.birth_date ? true : undefined}
          aria-describedby="birth-hint" style={{ maxWidth: 260 }} />
        <span id="birth-hint" className="hint">Faixas de referência de muitos exames mudam com a idade.</span>
        {errors.birth_date && <span className="field-error">{errors.birth_date}</span>}
      </div>

      <fieldset className="field" style={{ border: 0, padding: 0, margin: "22px 0 0" }} aria-describedby="sex-hint">
        <legend className="label" style={{ padding: 0, marginBottom: 8 }}>
          Sexo biológico <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(opcional)</span>
        </legend>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {SEX_OPTIONS.map((option) => (
            <label key={option.value} className="check" style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 6, background: "var(--white)", alignItems: "center" }}>
              <input type="radio" name="biological_sex" value={option.value}
                defaultChecked={(sex ?? "none") === option.value} style={{ marginTop: 0 }} />
              {option.label}
            </label>
          ))}
        </div>
        <span id="sex-hint" className="hint" style={{ marginTop: 6 }}>
          Usado apenas para mostrar as faixas de referência corretas, que variam entre os sexos.
        </span>
        {errors.biological_sex && <span className="field-error">{errors.biological_sex}</span>}
      </fieldset>
    </>
  );
}
