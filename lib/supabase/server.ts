import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { requireSupabaseConfig } from "@/lib/env";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Usa a sessão do usuário (cookies), portanto toda consulta passa pelo RLS.
 */
export async function createClient() {
  const cookieStore = await cookies(); // antes de tudo: marca a rota como dinâmica
  const { url, key } = requireSupabaseConfig();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component: não é possível gravar
          // cookies aqui. O proxy já renova a sessão a cada requisição.
        }
      },
    },
  });
}
