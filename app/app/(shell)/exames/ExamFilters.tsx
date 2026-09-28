"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { IconSearch } from "@/components/icons";
import styles from "./exams.module.css";

type Props = {
  values: { q: string; tipo: string; ano: string; laboratorio: string; ordem: string };
  categories: { slug: string; label: string }[];
  years: string[];
  laboratories: string[];
};

/**
 * Busca e filtros como um formulário GET comum (funciona sem JavaScript);
 * com JavaScript, aplica automaticamente ao mudar.
 */
export function ExamFilters({ values, categories, years, laboratories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [q, setQ] = useState(values.q);
  const [, startTransition] = useTransition();
  const firstRender = useRef(true);

  function apply() {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (typeof value === "string" && value && !(key === "ordem" && value === "recentes")) params.set(key, value);
    });
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  // Busca enquanto digita, com uma pequena espera.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(apply, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <form ref={formRef} role="search" className={styles.toolbar} method="get"
      onSubmit={(e) => { e.preventDefault(); apply(); }}>
      <div className={styles.search}>
        <label htmlFor="busca" className={styles.filterLabel}>Buscar</label>
        <div style={{ position: "relative" }}>
          <IconSearch />
          <input id="busca" name="q" type="search" className="input" placeholder="Nome, laboratório ou tipo"
            value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        </div>
      </div>
      <div>
        <label htmlFor="f-tipo" className={styles.filterLabel}>Tipo</label>
        <select id="f-tipo" name="tipo" className={styles.select} defaultValue={values.tipo} onChange={apply}>
          <option value="">Todos</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-ano" className={styles.filterLabel}>Ano da coleta</label>
        <select id="f-ano" name="ano" className={styles.select} defaultValue={values.ano} onChange={apply}>
          <option value="">Todos</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-lab" className={styles.filterLabel}>Laboratório</label>
        <select id="f-lab" name="laboratorio" className={styles.select} defaultValue={values.laboratorio} onChange={apply}>
          <option value="">Todos</option>
          {laboratories.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-ordem" className={styles.filterLabel}>Ordenar</label>
        <select id="f-ordem" name="ordem" className={styles.select} defaultValue={values.ordem || "recentes"} onChange={apply}>
          <option value="recentes">Coleta mais recente</option>
          <option value="antigos">Coleta mais antiga</option>
          <option value="envio">Enviados por último</option>
        </select>
      </div>
      <button type="submit" className="sr-only">Aplicar filtros</button>
    </form>
  );
}
