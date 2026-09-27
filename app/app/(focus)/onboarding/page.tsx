import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile, hasRequiredConsents } from "@/lib/data";
import { Onboarding } from "./Onboarding";

export const metadata: Metadata = { title: "Boas-vindas" };

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (!profile) throw new Error("Perfil não encontrado.");
  if (!(await hasRequiredConsents())) redirect("/app/consentimentos");
  if (profile.onboarding_completed_at) redirect("/app");

  return <Onboarding firstName={profile.first_name} birthDate={profile.birth_date} sex={profile.biological_sex} />;
}
