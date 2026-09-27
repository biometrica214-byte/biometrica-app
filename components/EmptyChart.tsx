/** Ilustração neutra de um gráfico vazio — só eixos, sem dados. */
export function EmptyChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 96" fill="none" aria-hidden="true" preserveAspectRatio="none">
      <line x1="0" y1="24" x2="420" y2="24" stroke="currentColor" strokeDasharray="3 5" />
      <line x1="0" y1="56" x2="420" y2="56" stroke="currentColor" strokeDasharray="3 5" />
      <line x1="0" y1="88" x2="420" y2="88" stroke="currentColor" />
    </svg>
  );
}
