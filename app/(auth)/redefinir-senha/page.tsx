import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/data";
import styles from "../auth.module.css";
import { NewPasswordForm } from "./NewPasswordForm";

export const metadata: Metadata = { title: "Nova senha" };

// Chega-se aqui pelo link de recuperação: /auth/callback cria a sessão e redireciona.
export default async function ResetPasswordPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className={styles.panel}>
        <h1 className={styles.title}>Link expirado</h1>
        <p className={styles.subtitle}>Esse link de recuperação não é mais válido. Peça um novo para continuar.</p>
        <div className={styles.actions}>
          <Link href="/recuperar-senha" className="btn btn-primary btn-block">Pedir novo link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Criar nova senha</h1>
      <p className={styles.subtitle}>Escolha uma nova senha para <strong>{user.email}</strong>.</p>
      <NewPasswordForm />
    </div>
  );
}
