import Link from "next/link";
import type { LegalDocumentType } from "@/lib/database.types";

type Doc = { type: LegalDocumentType; title: string; path: string; is_placeholder: boolean };

/** Texto de cada consentimento — específico, sem "aceito tudo". */
export function ConsentLabel({ doc }: { doc: Doc }) {
  const link = (
    <Link href={doc.path} target="_blank" rel="noopener">
      {doc.title}
    </Link>
  );
  const draft = doc.is_placeholder ? <> <span className="tag tag-draft">rascunho</span></> : null;

  switch (doc.type) {
    case "terms":
      return <span>Li e aceito os {link}.{draft}</span>;
    case "privacy":
      return <span>Li e aceito a {link}.{draft}</span>;
    case "health_data":
      return (
        <span>
          <strong>Autorizo o tratamento dos meus dados de saúde</strong> — como os resultados de exames que eu enviar —
          apenas para organizar e exibir meu histórico. {link}.{draft}
        </span>
      );
    case "marketing":
      return <span>Quero receber novidades da Biométrica por e-mail. <em>(opcional)</em></span>;
  }
}

export function consentNote(type: LegalDocumentType): string | null {
  switch (type) {
    case "health_data":
      return "Dados de saúde são sensíveis (LGPD, art. 11). Só você terá acesso a eles, e você pode revogar esta autorização quando quiser.";
    case "marketing":
      return "Você pode desativar a qualquer momento nas configurações.";
    default:
      return null;
  }
}
