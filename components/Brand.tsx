import Link from "next/link";

export function BrandMark({ className = "brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10 1C10 1 4 8.2 4 12.4C4 15.9 6.7 18.6 10 18.6C13.3 18.6 16 15.9 16 12.4C16 8.2 10 1 10 1Z"
        stroke="var(--teal)"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function Brand({ href = "/", style }: { href?: string; style?: React.CSSProperties }) {
  return (
    <Link href={href} className="brand" style={style}>
      <BrandMark />
      Biométrica
    </Link>
  );
}
