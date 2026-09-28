import Link from "next/link";
import pages from "./pages.module.css";

// Recurso inexistente dentro do app — inclusive exames de outra pessoa
// (mesma resposta, para não revelar que existem).
export default function AppNotFound() {
  return (
    <div className={pages.empty}>
      <h3>Não encontramos o que você procurava</h3>
      <p>Este item não existe ou não está disponível na sua conta.</p>
      <Link href="/app/exames" className="btn btn-ghost">Ir para Meus exames</Link>
    </div>
  );
}
