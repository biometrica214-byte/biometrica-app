import { Brand } from "@/components/Brand";
import { signOut } from "../actions";
import styles from "./focus.module.css";

// Layout enxuto para etapas que antecedem o app (onboarding, consentimentos).
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <header className={styles.top}>
        <Brand href="/app" />
        <form action={signOut}>
          <button type="submit" className="btn-link" style={{ color: "var(--ink-soft)", minHeight: 44, padding: "0 8px" }}>Sair</button>
        </form>
      </header>
      <main className={styles.main}>
        <div className={styles.panel}>{children}</div>
      </main>
    </div>
  );
}
