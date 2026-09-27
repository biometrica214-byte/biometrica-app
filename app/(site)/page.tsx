import Link from "next/link";
import { BrandMark } from "@/components/Brand";

function Arrow() {
  return (
    <div className="flow-arrow" aria-hidden="true">
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
        <path d="M1 7H21M21 7L15 1M21 7L15 13" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

const FAQ = [
  ["Preciso fazer meus exames em um laboratório específico?", "Não. Você continua usando o laboratório, médico ou plano de saúde de sua preferência. A Biométrica recebe os resultados depois."],
  ["Posso enviar exames antigos?", "Sim. Você pode enviar resultados de anos anteriores para começar seu histórico com o que já tem guardado."],
  ["Quais formatos posso enviar?", "PDFs e fotos de exames são os formatos previstos inicialmente."],
  ["A plataforma guarda meu histórico?", "Sim, esse é o propósito central da Biométrica: manter seus resultados organizados e acessíveis ao longo do tempo."],
  ["Posso acompanhar meus resultados ao longo do tempo?", "Sim. A comparação entre exames antigos e recentes é o principal recurso da plataforma."],
  ["A plataforma substitui meu médico?", "Não. A Biométrica organiza e apresenta informações, mas não diagnostica, não prescreve e não substitui uma consulta médica."],
  ["Como meus dados são protegidos?", "Por meio de acesso autenticado, armazenamento com controles de acesso restrito e uma arquitetura pensada para dados sensíveis de saúde."],
  ["Posso excluir meus dados?", "Sim, você pode solicitar a exclusão dos seus dados a qualquer momento."],
  ["Posso utilizar exames feitos pelo plano de saúde?", "Sim, qualquer exame que você tenha em mãos, independente da forma de pagamento, pode ser enviado."],
  ["Como funciona a revisão profissional?", "Ainda estamos construindo esse recurso. A ideia é que profissionais de saúde possam revisar resultados e deixar observações junto ao seu histórico."],
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>Seus exames já contam uma história. Quase ninguém a lê inteira.</h1>
            <p className="lead">
              Continue fazendo seus exames onde já confia — laboratório particular, plano de saúde, hospital. Envie os
              resultados para a Biométrica e veja sua saúde organizada como um histórico contínuo, não como arquivos
              soltos.
            </p>
            <div className="hero-cta-row">
              <Link href="/cadastro" className="btn btn-primary">Começar agora</Link>
              <a href="#como-funciona" className="btn btn-ghost">Ver como funciona</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-head">
                <h3>Ferritina</h3>
                <span>2023 — 2026</span>
              </div>
              <svg viewBox="0 0 460 140" width="100%" height="140" aria-hidden="true">
                <line x1="0" y1="35" x2="460" y2="35" stroke="var(--line)" strokeWidth="1" />
                <line x1="0" y1="70" x2="460" y2="70" stroke="var(--line)" strokeWidth="1" />
                <line x1="0" y1="105" x2="460" y2="105" stroke="var(--line)" strokeWidth="1" />
                <path className="spark-path" d="M10,100 C 70,95 110,60 150,55 C 200,48 230,80 280,75 C 330,70 360,30 450,20" />
                <circle className="spark-dot" cx="10" cy="100" r="4" />
                <circle className="spark-dot" cx="150" cy="55" r="4" />
                <circle className="spark-dot" cx="280" cy="75" r="4" />
                <circle className="spark-dot" cx="450" cy="20" r="4" />
              </svg>
              <div className="spark-years">
                <span>2023</span><span>2024</span><span>2025</span><span>2026</span>
              </div>
              <div className="hero-card-foot">Dados demonstrativos — ilustração de como o histórico é exibido.</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="problem" id="problema">
        <div className="wrap problem-grid">
          <div>
            <h2>Seus dados de saúde já existem. Eles só estão espalhados.</h2>
            <p className="section-lead">
              Um PDF no e-mail do trabalho. Uma foto tirada às pressas na recepção do laboratório. Um resultado impresso
              guardado numa gaveta há três anos. Cada exame conta uma parte da história — mas quase nunca alguém junta as
              partes.
            </p>
          </div>
          <div className="pile" aria-hidden="true">
            <div className="pile-card c1"><b>PDF · 2023</b>Hemograma completo</div>
            <div className="pile-card c2"><b>FOTO · 2024</b>Perfil lipídico</div>
            <div className="pile-card c3"><b>PDF · 2025</b>Tireoide (TSH, T4)</div>
            <div className="pile-card c4"><b>IMPRESSO · 2022</b>Glicemia em jejum</div>
            <div className="pile-card c5"><b>PDF · 2026</b>Vitamina D</div>
          </div>
        </div>
      </section>

      {/* TRANSFORMAÇÃO */}
      <section id="plataforma">
        <div className="wrap">
          <h2>Do arquivo espalhado ao histórico estruturado.</h2>
          <div className="flow">
            <div className="flow-step">
              <h3>Exames espalhados</h3>
              <p>PDFs, fotos e papéis de anos e laboratórios diferentes.</p>
            </div>
            <Arrow />
            <div className="flow-step">
              <h3>Biométrica</h3>
              <p>Identifica, estrutura e organiza os dados relevantes.</p>
            </div>
            <Arrow />
            <div className="flow-step">
              <h3>Histórico estruturado</h3>
              <p>Um único lugar, com evolução visível ao longo do tempo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona">
        <div className="wrap">
          <h2>Como funciona</h2>
          <p className="section-lead">Quatro passos simples — os recursos específicos de cada etapa podem variar conforme o plano.</p>
          <div className="steps-grid">
            <div className="step">
              <span className="num">01</span>
              <h3>Faça seus exames</h3>
              <p>Continue usando o laboratório, médico ou plano de saúde de sua preferência. Nada muda nessa parte.</p>
            </div>
            <div className="step">
              <span className="num">02</span>
              <h3>Envie seus resultados</h3>
              <p>PDFs, fotos ou outros documentos que você já tem — de qualquer época.</p>
            </div>
            <div className="step">
              <span className="num">03</span>
              <h3>Organize sua história</h3>
              <p>A plataforma identifica e estrutura os dados relevantes dos seus exames.</p>
            </div>
            <div className="step">
              <span className="num">04</span>
              <h3>Acompanhe ao longo do tempo</h3>
              <p>Visualize histórico, evolução e comparações num único lugar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VISUALIZAÇÃO DO PRODUTO */}
      <section className="product">
        <div className="wrap">
          <h2>Uma visão contínua da sua saúde</h2>
          <p className="section-lead">
            Uma prévia de como o painel organiza seus dados — as telas abaixo usam informações fictícias, apenas para
            ilustrar o produto.
          </p>
          <div className="mock-frame">
            <div className="mock-topbar">
              <span className="brand" style={{ fontSize: 16 }}>
                <BrandMark />
                Painel
              </span>
              <span className="who">Conta demonstrativa</span>
            </div>
            <div className="mock-body">
              <div className="mock-col">
                <div className="mock-h">Exames recentes</div>
                <div className="biomarker-row"><span className="name">Colesterol LDL <span className="mock-tag watch">acompanhar</span></span><span className="val">132 mg/dL</span></div>
                <div className="biomarker-row"><span className="name">TSH</span><span className="val">2.1 µUI/mL</span></div>
                <div className="biomarker-row"><span className="name">Glicose em jejum</span><span className="val">91 mg/dL</span></div>
                <div className="biomarker-row"><span className="name">Vitamina D</span><span className="val">28 ng/mL</span></div>
                <div className="biomarker-row"><span className="name">Ferritina</span><span className="val">64 ng/mL</span></div>
                <div className="demo-note">Valores fictícios, apenas para demonstração.</div>
              </div>
              <div className="mock-col">
                <div className="mock-h">Colesterol LDL — evolução</div>
                <svg viewBox="0 0 300 100" width="100%" height="100" aria-hidden="true">
                  <line x1="0" y1="30" x2="300" y2="30" stroke="var(--paper-dim)" strokeWidth="1" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="var(--paper-dim)" strokeWidth="1" />
                  <path d="M5,70 L 100,55 L 200,60 L 295,20" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="5" cy="70" r="3.5" fill="var(--gold)" />
                  <circle cx="100" cy="55" r="3.5" fill="var(--gold)" />
                  <circle cx="200" cy="60" r="3.5" fill="var(--gold)" />
                  <circle cx="295" cy="20" r="3.5" fill="var(--gold)" />
                </svg>
                <div className="mock-chart-label"><span>2024</span><span>2025</span><span>2026</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACOMPANHAMENTO */}
      <section className="track">
        <div className="wrap">
          <h2>Um resultado é um ponto. O histórico é a curva.</h2>
          <p className="track-quote">
            Nenhum exame isolado conta a história inteira — é a sequência deles que mostra para onde sua saúde está indo.
          </p>
          <div className="track-chart">
            <svg viewBox="0 0 760 180" width="100%" height="180" aria-hidden="true">
              <line x1="0" y1="40" x2="760" y2="40" stroke="var(--line)" strokeWidth="1" />
              <line x1="0" y1="90" x2="760" y2="90" stroke="var(--line)" strokeWidth="1" />
              <line x1="0" y1="140" x2="760" y2="140" stroke="var(--line)" strokeWidth="1" />
              <path className="spark-path" d="M10,150 C 90,140 150,90 220,80 C 300,68 340,110 420,95 C 500,80 540,40 620,32 C 670,27 700,20 750,15" />
              <circle className="spark-dot" cx="10" cy="150" r="5" />
              <circle className="spark-dot" cx="220" cy="80" r="5" />
              <circle className="spark-dot" cx="420" cy="95" r="5" />
              <circle className="spark-dot" cx="620" cy="32" r="5" />
            </svg>
          </div>
          <div className="track-years">
            <span>2024</span><span>2025</span><span>2026</span><span>2027</span>
          </div>
        </div>
      </section>

      {/* CENTRALIZAÇÃO */}
      <section>
        <div className="wrap">
          <h2>Tudo reunido, por categoria</h2>
          <p className="section-lead">Independente de onde vieram, seus exames são organizados por sistema do corpo.</p>
          <div className="cat-grid">
            {["Hemograma", "Lipídios", "Glicemia", "Hormônios", "Vitaminas", "Função hepática", "Função renal", "Outros exames"].map(
              (name) => (
                <div className="cat" key={name}>
                  <span>Categoria</span>
                  <strong>{name}</strong>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* INTELIGÊNCIA */}
      <section>
        <div className="wrap intel-grid">
          <div>
            <h2>Uma camada de apoio, não de diagnóstico</h2>
            <p className="section-lead">
              A tecnologia por trás da Biométrica existe para organizar e contextualizar — nunca para substituir uma
              avaliação profissional.
            </p>
          </div>
          <ul className="intel-list">
            <li><b>Organização.</b> Estrutura os dados extraídos dos seus exames em um formato consistente.</li>
            <li><b>Contextualização.</b> Relaciona um resultado novo com o histórico que você já tem.</li>
            <li><b>Comparação histórica.</b> Mostra o que mudou entre uma rodada de exames e a próxima.</li>
            <li><b>Preparo para acompanhamento profissional.</b> Organiza as informações para facilitar uma conversa com quem cuida da sua saúde.</li>
          </ul>
        </div>
        <div className="wrap">
          <div className="intel-note">
            A Biométrica não diagnostica, não prescreve e não substitui uma consulta médica. É uma ferramenta de
            organização e apoio à decisão.
          </div>
        </div>
      </section>

      {/* PROFISSIONAIS */}
      <section className="prof" id="profissionais">
        <div className="wrap">
          <h2>Espaço para acompanhamento profissional</h2>
          <p className="section-lead">
            Dados organizados podem facilitar um acompanhamento mais estruturado. Estamos construindo a camada que conecta
            seu histórico a quem cuida da sua saúde.
          </p>
          <div className="prof-grid">
            <div className="prof-card">
              <svg className="prof-icon" viewBox="0 0 34 34" fill="none" aria-hidden="true"><rect x="4" y="4" width="26" height="26" rx="4" stroke="var(--teal)" strokeWidth="1.5" /><path d="M10 22V19C10 16.79 12 15 15 15H19C22 15 24 16.79 24 19V22" stroke="var(--teal)" strokeWidth="1.5" /><circle cx="17" cy="11" r="4" stroke="var(--teal)" strokeWidth="1.5" /></svg>
              <h3>Revisão profissional</h3>
              <p>Espaço reservado para um profissional revisar resultados e histórico, quando esse recurso estiver disponível.</p>
            </div>
            <div className="prof-card">
              <svg className="prof-icon" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M6 10H28M6 17H28M6 24H20" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" /></svg>
              <h3>Observações e comentários</h3>
              <p>Estrutura preparada para receber anotações profissionais junto ao histórico do usuário.</p>
            </div>
            <div className="prof-card">
              <svg className="prof-icon" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M17 5V29M5 17H29" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" /><circle cx="17" cy="17" r="12" stroke="var(--teal)" strokeWidth="1.5" /></svg>
              <h3>Relatórios de acompanhamento</h3>
              <p>Consolidação do histórico em formato pensado para apoiar consultas e retornos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section id="seguranca">
        <div className="wrap">
          <h2>Privacidade e segurança</h2>
          <p className="section-lead">
            Dados de saúde são sensíveis por natureza. A arquitetura da Biométrica é pensada desde o início para lidar com
            isso com seriedade.
          </p>
          <div className="sec-grid">
            <div className="sec-item">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2L17 5V9.5C17 13.6 14 16.9 10 18C6 16.9 3 13.6 3 9.5V5L10 2Z" stroke="currentColor" strokeWidth="1.4" /></svg>
              <div><h3>Acesso autenticado</h3><p>Somente você acessa seus próprios dados, mediante login autenticado.</p></div>
            </div>
            <div className="sec-item">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="1.4" stroke="currentColor" strokeWidth="1.4" /><path d="M6.5 9V6.5C6.5 4.6 8.1 3 10 3C11.9 3 13.5 4.6 13.5 6.5V9" stroke="currentColor" strokeWidth="1.4" /></svg>
              <div><h3>Armazenamento protegido</h3><p>Documentos e resultados enviados são armazenados com controles de acesso restrito.</p></div>
            </div>
            <div className="sec-item">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5H17M3 10H17M3 15H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              <div><h3>Arquitetura alinhada à LGPD</h3><p>Construída considerando os princípios de finalidade, minimização e consentimento para dados de saúde.</p></div>
            </div>
            <div className="sec-item">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3V10L14 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="10" cy="10" r="7.3" stroke="currentColor" strokeWidth="1.4" /></svg>
              <div><h3>Controle sobre seus dados</h3><p>Você pode solicitar a exclusão dos seus dados a qualquer momento.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section>
        <div className="wrap">
          <h2>Para quem é a Biométrica</h2>
          <div className="who-grid">
            <div className="who-card"><h3>Quem quer acompanhar sua saúde</h3><p>Centralize seus exames e acompanhe sua evolução ao longo do tempo.</p></div>
            <div className="who-card"><h3>Quem já tem anos de exames</h3><p>Transforme documentos antigos e espalhados em um histórico organizado.</p></div>
            <div className="who-card"><h3>Quem gosta de acompanhar dados</h3><p>Veja tendências e mudanças nos seus próprios números.</p></div>
            <div className="who-card"><h3>Profissionais de saúde</h3><p>Tenha informações organizadas para apoiar o acompanhamento de pacientes, quando esse recurso estiver disponível.</p></div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAL */}
      <section className="diff">
        <div className="wrap">
          <h2>Não é apenas uma conversa sobre um exame</h2>
          <p className="section-lead">
            Ferramentas de conversa genéricas conseguem explicar um resultado isolado. A Biométrica foi construída para o
            que vem depois.
          </p>
          <div className="diff-flow">
            <span className="node">guardar</span><span className="arrow">→</span>
            <span className="node">organizar</span><span className="arrow">→</span>
            <span className="node">estruturar</span><span className="arrow">→</span>
            <span className="node">comparar</span><span className="arrow">→</span>
            <span className="node">acompanhar</span>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos">
        <div className="wrap">
          <h2>Planos</h2>
          <p className="section-lead">Nossa estrutura comercial ainda está em definição. Os planos abaixo mostram a direção geral.</p>
          <div className="plans-grid">
            <div className="plan">
              <span className="plan-badge">Em breve</span>
              <h3>Plano Inicial</h3>
              <p className="price">Preço a definir</p>
              <ul>
                <li>Upload de exames em PDF ou foto</li>
                <li>Histórico organizado por categoria</li>
                <li>Comparação entre resultados ao longo do tempo</li>
              </ul>
              <a href="#faq" className="btn btn-ghost">Ser avisado no lançamento</a>
            </div>
            <div className="plan featured">
              <span className="plan-badge">Em breve</span>
              <h3>Plano Completo</h3>
              <p className="price">Preço a definir</p>
              <ul>
                <li>Tudo do Plano Inicial</li>
                <li>Revisão profissional, quando disponível</li>
                <li>Relatórios de acompanhamento</li>
              </ul>
              <a href="#faq" className="btn btn-primary">Ser avisado no lançamento</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="wrap">
          <h2>Perguntas frequentes</h2>
          <div className="faq-list">
            {FAQ.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span className="plus" aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="final-cta">
        <div className="wrap">
          <h2>Sua saúde gera dados o tempo todo.</h2>
          <p>Organize esses dados. Entenda sua história. Acompanhe sua evolução.</p>
          <div className="hero-cta-row">
            <Link href="/cadastro" className="btn btn-primary">Começar agora</Link>
            <a href="#como-funciona" className="btn btn-ghost">Conhecer a plataforma</a>
          </div>
        </div>
      </section>
    </>
  );
}
