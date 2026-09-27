"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import {
  IconBiomarkers, IconClose, IconExams, IconFollowup, IconHistory, IconLogout,
  IconMenu, IconOverview, IconProfile, IconReports, IconSettings,
} from "@/components/icons";
import { signOut } from "../actions";
import styles from "./shell.module.css";

type Item = { label: string; href?: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> };

// Itens sem href ainda não existem (próximos blocos) e aparecem como "Em breve".
const MAIN: Item[] = [
  { label: "Visão geral", href: "/app", icon: IconOverview },
  { label: "Meus exames", href: "/app/exames", icon: IconExams },
  { label: "Biomarcadores", icon: IconBiomarkers },
  { label: "Histórico", icon: IconHistory },
  { label: "Relatórios", icon: IconReports },
  { label: "Acompanhamento", icon: IconFollowup },
];
const ACCOUNT: Item[] = [
  { label: "Perfil", href: "/app/perfil", icon: IconProfile },
  { label: "Configurações", href: "/app/configuracoes", icon: IconSettings },
];

export function AppShell({ name, email, children }: { name: string; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const initials = (name || email).trim().slice(0, 1).toUpperCase();

  const renderItem = ({ label, href, icon: Icon }: Item) => {
    if (!href) {
      return (
        <span key={label} className={styles.navItem} aria-disabled="true">
          <Icon />
          {label}
          <span className={styles.soon}>Em breve</span>
        </span>
      );
    }
    const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
    return (
      <Link key={label} href={href} className={styles.navItem} aria-current={active ? "page" : undefined}>
        <Icon />
        {label}
      </Link>
    );
  };

  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <Brand href="/app" />
        <button type="button" className={styles.iconBtn} aria-label="Abrir menu" aria-expanded={open}
          aria-controls="app-sidebar" onClick={() => setOpen(true)}>
          <IconMenu />
        </button>
      </header>

      <div className={styles.backdrop} data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside id="app-sidebar" className={styles.sidebar} data-open={open} aria-label="Menu da aplicação">
        <div className={styles.sidebarHead}>
          <Brand href="/app" />
          <button type="button" className={`${styles.iconBtn} ${styles.closeBtn}`} aria-label="Fechar menu"
            onClick={() => setOpen(false)}>
            <IconClose />
          </button>
        </div>

        <nav className={styles.nav}>
          {MAIN.map(renderItem)}
          <p className={styles.navGroup}>Conta</p>
          {ACCOUNT.map(renderItem)}
        </nav>

        <div className={styles.account}>
          <div className={styles.avatar} aria-hidden="true">{initials}</div>
          <div className={styles.accountText}>
            <div className={styles.accountName}>{name || "Minha conta"}</div>
            <div className={styles.accountEmail}>{email}</div>
          </div>
          <form action={signOut}>
            <button type="submit" className={styles.iconBtn} aria-label="Sair da conta" title="Sair">
              <IconLogout />
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
