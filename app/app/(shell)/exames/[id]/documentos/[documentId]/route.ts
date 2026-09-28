import { type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/data";
import { isUuid, STORAGE_BUCKET } from "@/lib/exams";
import { createClient } from "@/lib/supabase/server";

/**
 * Entrega o documento original ao seu dono. Nenhuma URL pública ou assinada
 * chega ao navegador: cada acesso passa pela sessão e pelo RLS (tabela + storage).
 * ?download=1 força o download; sem ele, abre para visualização.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const { id, documentId } = await params;
  const notFound = () => new Response("Documento não encontrado.", { status: 404, headers: noStore("text/plain; charset=utf-8") });

  const user = await getSessionUser();
  if (!user) return new Response("Entre na sua conta para ver este documento.", { status: 401, headers: noStore("text/plain; charset=utf-8") });
  if (!isUuid(id) || !isUuid(documentId)) return notFound();

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("exam_documents")
    .select("storage_path, mime_type, original_filename")
    .eq("id", documentId)
    .eq("exam_id", id)
    .maybeSingle();
  if (!doc) return notFound(); // inexistente ou de outra pessoa: mesma resposta

  const { data: file, error } = await supabase.storage.from(STORAGE_BUCKET).download(doc.storage_path);
  if (error || !file) {
    return new Response("Não foi possível abrir o documento agora. Tente novamente.", { status: 502, headers: noStore("text/plain; charset=utf-8") });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";
  const headers = noStore(doc.mime_type);
  headers.set("Content-Disposition", contentDisposition(download ? "attachment" : "inline", doc.original_filename));
  headers.set("Content-Length", String(file.size));
  return new Response(file.stream(), { status: 200, headers });
}

function noStore(contentType: string) {
  return new Headers({
    "Content-Type": contentType,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
}

/** Nome original preservado (RFC 6266/5987), com alternativa ASCII. */
function contentDisposition(type: "inline" | "attachment", filename: string) {
  const ascii = filename.normalize("NFD").replace(/[^\x20-\x7e]/g, "").replace(/["\\]/g, "") || "documento";
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
