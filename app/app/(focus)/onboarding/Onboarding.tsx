"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { BasicInfoFields } from "@/components/BasicInfoFields";
import { FormMessage, SubmitButton } from "@/components/forms";
import { IconArrow } from "@/components/icons";
import { completeOnboarding, updateProfile } from "../../actions";
import styles from "../focus.module.css";

const LABELS = ["Boas-vindas", "Sobre você", "Como funciona", "Primeiro passo"];

export function Onboarding({ firstName, birthDate, sex }: { firstName: string; birthDate: string | null; sex: string | null }) {
  const [step, setStep] = useState(0);
  const [state, saveBasics] = useActionState(updateProfile, null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (state?.success) setStep(2);
  }, [state]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  const heading = (text: string) => (
    <h1 ref={headingRef} tabIndex={-1} className={styles.title} style={{ outline: "none" }}>{text}</h1>
  );

  return (
    <>
      <div className={styles.progress} aria-hidden="true">
        {LABELS.map((label, i) => <span key={label} data-done={i <= step} />)}
      </div>
      <p className={styles.stepLabel}>Passo {step + 1} de {LABELS.length} · {LABELS[step]}</p>

      {step === 0 && (
        <section>
          {heading(firstName ? `Boas-vindas à Biométrica, ${firstName}.` : "Boas-vindas à Biométrica.")}
          <p className={styles.quote}>
            Aqui você poderá reunir seus exames e acompanhar sua história de saúde ao longo do tempo.
          </p>
          <p className={styles.lead}>São só mais três passos rápidos antes de começar.</p>
          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={() => setStep(1)}>
              Começar <IconArrow style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section>
          {heading("Duas perguntas sobre você")}
          <p className={styles.lead}>
            Os valores de referência de muitos exames mudam com a idade e o sexo. Com isso, conseguiremos mostrar seus
            resultados no contexto certo. Você pode pular e preencher depois no seu perfil.
          </p>
          <form action={saveBasics} className={styles.body} noValidate>
            <FormMessage state={state?.error ? state : null} />
            <BasicInfoFields birthDate={state?.values?.birth_date ?? birthDate} sex={state?.values?.biological_sex || sex} errors={state?.fieldErrors} />
            <div className={styles.actions}>
              <SubmitButton className="btn btn-primary" pendingText="Salvando…">Continuar</SubmitButton>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Voltar</button>
              <button type="button" className={`btn-link ${styles.skip}`} onClick={() => setStep(2)}>Pular por enquanto</button>
            </div>
          </form>
        </section>
      )}

      {step === 2 && (
        <section>
          {heading("Como a Biométrica funciona")}
          <ol className={styles.flow}>
            <li><span className={styles.flowNum}>01</span><div><h3>Faça seus exames normalmente</h3><p>No laboratório, plano ou hospital de sua preferência. Nada muda nessa parte.</p></div></li>
            <li><span className={styles.flowNum}>02</span><div><h3>Envie seus resultados</h3><p>PDFs ou fotos — inclusive exames antigos que você já tem guardados.</p></div></li>
            <li><span className={styles.flowNum}>03</span><div><h3>A Biométrica organiza os dados</h3><p>Os resultados passam a fazer parte de um histórico único e estruturado.</p></div></li>
            <li><span className={styles.flowNum}>04</span><div><h3>Você acompanha sua evolução</h3><p>Veja como cada marcador muda ao longo do tempo, num só lugar.</p></div></li>
          </ol>
          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Entendi</button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Voltar</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          {heading("Tudo pronto.")}
          <p className={styles.lead}>Sua conta está criada e protegida.</p>
          <div className={styles.card}>
            <strong>Seu próximo passo será adicionar seu primeiro exame.</strong>
            <p>Qualquer resultado que você tenha em mãos serve para começar — o histórico cresce a cada novo exame.</p>
          </div>
          <form action={completeOnboarding} className={styles.actions}>
            <SubmitButton className="btn btn-primary" name="destination" value="exams" pendingText="Abrindo…">
              Adicionar meu primeiro exame
            </SubmitButton>
            <SubmitButton className="btn btn-ghost" name="destination" value="app" pendingText="Abrindo…">
              Ir para o painel
            </SubmitButton>
          </form>
        </section>
      )}
    </>
  );
}
