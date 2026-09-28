import { cache } from "react";
import type { Exam, ExamDocument } from "@/lib/database.types";
import { isUuid } from "@/lib/exams";
import { createClient } from "@/lib/supabase/server";

// Leituras de exames do usuário logado. O RLS garante que só voltam os dele.

export const PAGE_SIZE = 25;

export const getExamCategories = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error("Não foi possível carregar os tipos de exame.");
  return data ?? [];
});

export type ExamListFilters = {
  q?: string;
  category?: string;
  year?: string;
  laboratory?: string;
  order?: "recentes" | "antigos" | "envio";
  page?: number;
};

export type ExamListItem = Pick<Exam, "id" | "title" | "category" | "collected_on" | "laboratory" | "status" | "created_at"> & {
  document_count: number;
};

/** Remove caracteres com significado especial na sintaxe de filtros do PostgREST. */
function sanitizeSearch(q: string) {
  return q.replace(/[,()*%\\:"'.]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function listExams(filters: ExamListFilters) {
  const supabase = await createClient();
  const categories = await getExamCategories();
  const page = Math.max(1, filters.page ?? 1);

  let query = supabase
    .from("exams")
    .select("id, title, category, collected_on, laboratory, status, created_at, exam_documents(count)", { count: "exact" });

  const q = sanitizeSearch(filters.q ?? "");
  if (q) {
    const lower = q.toLocaleLowerCase("pt-BR");
    const matchingCategories = categories.filter((c) => c.label.toLocaleLowerCase("pt-BR").includes(lower)).map((c) => c.slug);
    const conditions = [`title.ilike.*${q}*`, `laboratory.ilike.*${q}*`];
    if (matchingCategories.length) conditions.push(`category.in.(${matchingCategories.join(",")})`);
    query = query.or(conditions.join(","));
  }
  if (filters.category && categories.some((c) => c.slug === filters.category)) {
    query = query.eq("category", filters.category);
  }
  if (filters.year && /^\d{4}$/.test(filters.year)) {
    query = query.gte("collected_on", `${filters.year}-01-01`).lte("collected_on", `${filters.year}-12-31`);
  }
  if (filters.laboratory) query = query.eq("laboratory", filters.laboratory.slice(0, 120));

  if (filters.order === "envio") {
    query = query.order("created_at", { ascending: false });
  } else {
    const ascending = filters.order === "antigos";
    query = query.order("collected_on", { ascending }).order("created_at", { ascending });
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error("Não foi possível carregar seus exames.");

  const items: ExamListItem[] = (data ?? []).map((row) => {
    const { exam_documents, ...exam } = row as typeof row & { exam_documents: { count: number }[] };
    return { ...exam, document_count: exam_documents?.[0]?.count ?? 0 };
  });
  return { items, total: count ?? 0, page, pageCount: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)) };
}

/** Opções dos filtros (anos e laboratórios que existem nos exames do usuário). */
export async function getExamFilterOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("exams").select("collected_on, laboratory");
  const years = new Set<string>();
  const labs = new Set<string>();
  for (const row of data ?? []) {
    years.add(row.collected_on.slice(0, 4));
    if (row.laboratory) labs.add(row.laboratory);
  }
  return {
    total: data?.length ?? 0,
    years: [...years].sort().reverse(),
    laboratories: [...labs].sort((a, b) => a.localeCompare(b, "pt-BR")),
  };
}

export const getExam = cache(async (id: string) => {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("exams").select("*, exam_documents(*)").eq("id", id).maybeSingle();
  if (error) throw new Error("Não foi possível carregar o exame.");
  if (!data) return null;
  const { exam_documents, ...exam } = data as Exam & { exam_documents: ExamDocument[] };
  const documents = [...exam_documents].sort((a, b) => a.created_at.localeCompare(b.created_at));
  return { exam: exam as Exam, documents };
});

export async function getRecentExams(limit = 3) {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("exams")
    .select("id, title, category, collected_on, laboratory, status", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit);
  return { items: data ?? [], total: count ?? 0 };
}
