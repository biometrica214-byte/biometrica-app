"use client";

import Link from "next/link";

/** Tela de erro amigável — nunca mostra detalhes técnicos ao usuário. */
export function ErrorView({ reset, homeHref = "/" }: { reset?: () => void; homeHref?: string }) {
  return (
    <div role="alert" style={{ maxWidth: 520, padding: "8px 0" }}>
      <p className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", letterSpacing: ".04em", textTransform: "uppercase" }}>
        Algo deu errado
      </p>
      <h1 style={{ fontSize: "clamp(28px, 3.4vw, 38px)", lineHeight: 1.15, marginTop: 8 }}>
        Não conseguimos carregar esta página.
      </h1>
      <p style={{ marginTop: 12, fontSize: 16.5, color: "var(--ink-soft)" }}>
        Pode ter sido uma instabilidade momentânea. Seus dados estão seguros. Tente novamente em instantes.
      </p>
      <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {reset && (
          <button type="button" className="btn btn-primary" onClick={reset}>
            Tentar novamente
          </button>
        )}
        <Link href={homeHref} className="btn btn-ghost">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
