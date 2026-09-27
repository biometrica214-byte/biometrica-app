import { redirect } from "next/navigation";
import { getProfile, getSessionUser, hasRequiredConsents } from "@/lib/data";
import { AppShell } from "./AppShell";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const [user, profile] = await Promise.all([getSessionUser(), getProfile()]);
  if (!user) redirect("/login?aviso=sessao");
  if (!profile) throw new Error("Perfil não encontrado.");

  // Ordem das verificações: consentimentos obrigatórios → onboarding → app.
  if (!(await hasRequiredConsents())) redirect("/app/consentimentos");
  if (!profile.onboarding_completed_at) redirect("/app/onboarding");

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return (
    <AppShell name={name} email={user.email}>
      {children}
    </AppShell>
  );
}
