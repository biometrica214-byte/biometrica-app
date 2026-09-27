import Link from "next/link";
import { Brand } from "@/components/Brand";

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <Brand />
          <p>Organize sua história de saúde a partir dos exames que você já faz.</p>
        </div>
        <div className="foot-col">
          <h4>Empresa</h4>
          <ul>
            <li><a href="/#top">Sobre</a></li>
            <li><a href="/#faq">Contato</a></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4>Produto</h4>
          <ul>
            <li><a href="/#como-funciona">Como funciona</a></li>
            <li><a href="/#planos">Planos</a></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4>Segurança</h4>
          <ul>
            <li><Link href="/privacidade">Privacidade</Link></li>
            <li><Link href="/termos">Termos de uso</Link></li>
            <li><a href="/#seguranca">Segurança</a></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4>Conta</h4>
          <ul>
            <li><Link href="/login">Entrar</Link></li>
            <li><Link href="/cadastro">Cadastrar</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-bottom">
        <span>© 2026 Biométrica. Todos os direitos reservados.</span>
        <span>Biométrica é uma plataforma de organização de dados de saúde e não substitui avaliação médica.</span>
      </div>
    </footer>
  );
}
