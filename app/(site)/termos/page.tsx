import type { Metadata } from "next";
import { LegalDraftNotice } from "../LegalDraftNotice";

export const metadata: Metadata = { title: "Termos de Uso" };

// PLACEHOLDER: substituir pelo texto elaborado por assessoria jurídica.
// Ao publicar uma nova versão, criar uma nova linha em legal_documents.
export default function TermsPage() {
  return (
    <section className="legal">
      <div className="wrap">
        <h1>Termos de Uso</h1>
        <div className="legal-meta">
          <span className="tag tag-draft">Rascunho</span>
          <span>Versão 0.1-rascunho</span>
        </div>
        <LegalDraftNotice />

        <h2>O que é a Biométrica</h2>
        <p>
          A Biométrica é uma plataforma para organizar e acompanhar, ao longo do tempo, os resultados de exames que você
          já possui. Ela não realiza diagnósticos, não prescreve tratamentos e não substitui a avaliação de um
          profissional de saúde.
        </p>

        <h2>Sua conta</h2>
        <p>
          Você é responsável por manter a confidencialidade da sua senha. A conta é pessoal e se destina a organizar os
          seus próprios dados de saúde.
        </p>

        <h2>Pontos a definir</h2>
        <ul>
          <li>Condições comerciais, planos e cancelamento.</li>
          <li>Limitações de responsabilidade.</li>
          <li>Regras de uso aceitável.</li>
          <li>Foro e legislação aplicável.</li>
        </ul>
      </div>
    </section>
  );
}
