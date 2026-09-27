import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <div style={{ minHeight: "100dvh", padding: "28px 24px" }}>
      <Brand />
      <div style={{ maxWidth: 560, margin: "14vh auto 0" }}>
        <p className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", letterSpacing: ".04em" }}>ERRO 404</p>
        <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.12, marginTop: 8 }}>Esta página não existe.</h1>
        <p style={{ marginTop: 12, fontSize: 17, color: "var(--ink-soft)" }}>
          O endereço pode ter mudado ou ter sido digitado com algum erro.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">Ir para o início</Link>
          <Link href="/app" className="btn btn-ghost">Abrir minha conta</Link>
        </div>
      </div>
    </div>
  );
}
