import type { Metadata } from "next";
import Link from "next/link";
import { getConsentStatus } from "@/lib/data";
import { signOut } from "../../actions";
import styles from "../pages.module.css";
import { ChangePasswordForm, ConsentToggle } from "./SettingsForms";

export const metadata: Metadata = { title: "Configurações" };

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function SettingsPage() {
  const consents = await getConsentStatus();

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Conta</p>
        <h1 className={styles.title}>Configurações</h1>
      </header>

      <section className={styles.panel} aria-labelledby="privacy">
        <div className={styles.panelHead}>
          <h2 id="privacy">Privacidade e consentimentos</h2>
          <p>Cada autorização é registrada com a versão do documento e a data. Você pode mudar de ideia quando quiser.</p>
        </div>
        {consents.map((c) => (
          <div key={c.document_id} className={styles.consentRow}>
            <div>
              <div className={styles.consentTitle}>
                {c.title}
                {c.required ? <span className="tag">Necessário</span> : <span className="tag">Opcional</span>}
                {c.is_placeholder && <span className="tag tag-draft">Rascunho</span>}
              </div>
              <div className={styles.consentMeta}>
                <span className={c.granted ? styles.statusOn : styles.statusOff}>
                  {c.granted ? "Autorizado" : c.decided_at ? "Revogado" : "Não autorizado"}
                </span>
                {c.decided_at && <> · {dateFormat.format(new Date(c.decided_at))}</>}
                {" · "}versão {c.version} · <Link href={c.path} target="_blank" rel="noopener">ler documento</Link>
              </div>
            </div>
            <ConsentToggle documentId={c.document_id} granted={c.granted} required={c.required} title={c.title} />
          </div>
        ))}
      </section>

      <section className={styles.panel} aria-labelledby="password">
        <div className={styles.panelHead}>
          <h2 id="password">Senha</h2>
          <p>Use uma senha que você não utilize em outros serviços.</p>
        </div>
        <ChangePasswordForm />
      </section>

      <section className={styles.panel} aria-labelledby="your-data">
        <div className={styles.panelHead}>
          <h2 id="your-data">Seus dados</h2>
          <p>Direitos garantidos pela LGPD. Estes recursos serão liberados antes do lançamento.</p>
        </div>
        <div className={styles.soonRow}>
          <div>
            <strong>Exportar meus dados</strong>
            <p>Baixe uma cópia de tudo o que a Biométrica guarda sobre você.</p>
          </div>
          <span className="tag">Em breve</span>
        </div>
        <div className={styles.soonRow}>
          <div>
            <strong>Excluir minha conta</strong>
            <p>Apaga sua conta e seus dados de forma permanente.</p>
          </div>
          <span className="tag">Em breve</span>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="session">
        <div className={styles.panelHead}>
          <h2 id="session">Sessão</h2>
          <p>Encerre o acesso neste dispositivo.</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn btn-ghost">Sair da conta</button>
        </form>
      </section>
    </>
  );
}
