import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Páginas de visitante: quem já está logado vai direto para o app.
const GUEST_ONLY = new Set(["/login", "/cadastro", "/recuperar-senha"]);

function isPrivate(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  let redirectTo: URL | null = null;
  if (isPrivate(pathname) && !userId) {
    redirectTo = new URL("/login", request.url);
    redirectTo.searchParams.set("next", pathname + search);
  } else if (GUEST_ONLY.has(pathname) && userId) {
    redirectTo = new URL("/app", request.url);
  }

  if (!redirectTo) return response;

  // Preserva os cookies de sessão renovados no redirecionamento.
  const redirect = NextResponse.redirect(redirectTo);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
