import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/data";

// Segunda barreira (além do proxy): nada abaixo de /app renderiza sem sessão válida.
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?aviso=sessao");
  return children;
}
