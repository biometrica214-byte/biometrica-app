import type { Metadata } from "next";
import Link from "next/link";
import { safeNext } from "@/lib/safe-redirect";
import styles from "../auth.module.css";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

const NOTICES: Record<string, { tone: "error" | "success" | "info"; text: string }> = {
  link: { tone: "error", text: "Esse link é inválido ou expirou. Entre com sua senha ou peça um novo link." },
  sessao: { tone: "info", text: "Sua sessão terminou. Entre novamente para continuar." },
  saiu: { tone: "success", text: "Você saiu da sua conta." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const next = params.next ? safeNext(params.next) : undefined;
  const notice = params.aviso ? NOTICES[params.aviso] : next ? { tone: "info" as const, text: "Entre na sua conta para continuar." } : undefined;

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Entrar</h1>
      <p className={styles.subtitle}>Acesse sua história de saúde.</p>
      {notice && (
        <div
          className={`notice ${notice.tone === "error" ? "notice-error" : notice.tone === "success" ? "notice-success" : ""}`}
          role="status"
          style={{ marginTop: 24 }}
        >
          {notice.text}
        </div>
      )}
      <LoginForm next={next} />
      <p className={styles.switch}>
        Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
    </div>
  );
}
