import { Brand } from "@/components/Brand";
import { supabaseConfig } from "@/lib/env";
import styles from "./auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.aside}>
        <Brand />
        <div className={styles.asideBody}>
          <p className={styles.asideQuote}>Seus exames organizados em uma história contínua.</p>
          <p className={styles.asideLead}>Um lugar para reunir resultados de qualquer laboratório e acompanhar sua evolução ao longo do tempo.</p>
          <ol className={styles.asideSteps}>
            <li><span>01</span>Faça seus exames normalmente</li>
            <li><span>02</span>Envie seus resultados</li>
            <li><span>03</span>A Biométrica organiza os dados</li>
            <li><span>04</span>Você acompanha sua evolução</li>
          </ol>
        </div>
        <p className={styles.asideFoot}>A Biométrica não substitui avaliação médica.</p>
        <svg className={styles.asideCurve} viewBox="0 0 360 120" fill="none" aria-hidden="true">
          <path d="M0,100 C 60,96 100,60 150,58 C 200,56 230,82 270,70 C 310,58 330,30 360,22" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" opacity=".5" />
        </svg>
      </aside>
      <main className={styles.main}>
        <div className={styles.mobileBrand}>
          <Brand />
        </div>
        {supabaseConfig() ? (
          children
        ) : (
          <div className={styles.panel}>
            <h1 className={styles.title}>Quase lá</h1>
            <p className={styles.subtitle}>
              O cadastro e o login ainda não estão disponíveis neste ambiente. Tente novamente em breve.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
