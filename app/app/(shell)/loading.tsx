import styles from "./pages.module.css";

export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className={styles.skeleton} style={{ width: 120, height: 14 }} />
      <div className={styles.skeleton} style={{ width: "min(360px, 80%)", height: 40, marginTop: 14 }} />
      <div className={styles.skeleton} style={{ width: "min(280px, 60%)", height: 18, marginTop: 14 }} />
      <div className={styles.skeleton} style={{ height: 130, marginTop: 48 }} />
      <div className={styles.skeleton} style={{ height: 200, marginTop: 36 }} />
    </div>
  );
}
