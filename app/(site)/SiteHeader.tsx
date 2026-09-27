"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/Brand";

const LINKS = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#plataforma", label: "Plataforma" },
  { href: "/#profissionais", label: "Profissionais" },
  { href: "/#seguranca", label: "Segurança" },
  { href: "/#planos", label: "Planos" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          <ul className="nav-links">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-right">
          <Link href="/login" className="nav-login">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn btn-primary nav-cta">
            Começar agora
          </Link>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-panel"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {open ? (
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
      <div id="mobile-panel" className={open ? "open" : undefined}>
        <ul onClick={(e) => (e.target as HTMLElement).tagName === "A" && setOpen(false)}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
          <li>
            <Link href="/login" className="panel-login">
              Entrar na minha conta
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
