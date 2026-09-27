import type { Metadata } from "next";
import { getCurrentLegalDocuments } from "@/lib/data";
import { supabaseConfig } from "@/lib/env";
import styles from "../auth.module.css";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Criar conta" };
// Sempre busca as versões vigentes dos documentos legais.
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (!supabaseConfig()) return null; // o layout exibe o aviso de configuração
  const documents = await getCurrentLegalDocuments();
  return (
    <div className={`${styles.panel} ${styles.panelWide}`}>
      <SignupForm
        documents={documents.map(({ type, title, path, version, required, is_placeholder }) => ({
          type, title, path, version, required, is_placeholder,
        }))}
      />
    </div>
  );
}
