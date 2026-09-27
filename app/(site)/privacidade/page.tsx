import type { Metadata } from "next";
import { LegalDraftNotice } from "../LegalDraftNotice";

export const metadata: Metadata = { title: "Política de Privacidade" };

// PLACEHOLDER: substituir pelo texto elaborado por assessoria jurídica / DPO.
// As âncoras #dados-de-saude e #comunicacoes são referenciadas em legal_documents.path.
export default function PrivacyPage() {
  return (
    <section className="legal">
      <div className="wrap">
        <h1>Política de Privacidade</h1>
        <div className="legal-meta">
          <span className="tag tag-draft">Rascunho</span>
          <span>Versão 0.1-rascunho</span>
        </div>
        <LegalDraftNotice />

        <h2>Quais dados coletamos hoje, e por quê</h2>
        <ul>
          <li><strong>Nome e sobrenome</strong> — para identificar sua conta e falar com você.</li>
          <li><strong>E-mail e senha</strong> — para você entrar com segurança e recuperar o acesso.</li>
          <li>
            <strong>Data de nascimento e sexo biológico (opcionais)</strong> — as faixas de referência dos exames
            laboratoriais variam por idade e sexo; usamos esses dados apenas para isso.
          </li>
          <li><strong>Registro dos seus consentimentos</strong> — qual versão de cada documento você aceitou e quando.</li>
        </ul>
        <p>Não coletamos dados que não tenham uma finalidade clara dentro do produto.</p>

        <h2 id="dados-de-saude">Dados de saúde</h2>
        <p>
          Quando o envio de exames estiver disponível, os resultados que você enviar serão dados pessoais sensíveis
          (LGPD, art. 11). Eles serão tratados somente com o seu consentimento específico, apenas para organizar e
          exibir o seu histórico, e acessíveis somente por você. Você pode revogar esse consentimento a qualquer momento
          nas configurações da sua conta.
        </p>

        <h2 id="comunicacoes">Comunicações</h2>
        <p>
          Enviar novidades sobre a Biométrica por e-mail é opcional e depende da sua autorização, que pode ser retirada
          a qualquer momento nas configurações. E-mails essenciais (confirmação de conta, recuperação de senha) não
          dependem dessa autorização.
        </p>

        <h2>Seus direitos</h2>
        <p>
          Você pode acessar, corrigir, exportar e solicitar a exclusão dos seus dados. Parte desses recursos já está
          disponível na sua conta; os demais serão disponibilizados antes do lançamento.
        </p>

        <h2>Pontos a definir</h2>
        <ul>
          <li>Identificação do controlador e do encarregado (DPO) e canal de contato.</li>
          <li>Operadores e subprocessadores (por exemplo, provedor de hospedagem e banco de dados).</li>
          <li>Prazos de retenção e transferência internacional de dados.</li>
        </ul>
      </div>
    </section>
  );
}
