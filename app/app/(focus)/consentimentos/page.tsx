import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getConsentStatus } from "@/lib/data";
import { ConsentsForm } from "./ConsentsForm";

export const metadata: Metadata = { title: "Consentimentos" };

// Aparece quando falta algum consentimento obrigatório: nova versão de um
// documento, revogação pelo próprio usuário ou conta criada por outro meio.
export default async function ConsentsPage() {
  const status = await getConsentStatus();
  const pending = status.filter((c) => !c.granted);
  if (!pending.some((c) => c.required)) redirect("/app");

  return <ConsentsForm pending={pending} />;
}
