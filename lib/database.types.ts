// Tipos do banco, espelhando supabase/migrations/0001_fundacao.sql.
// Quando a Supabase CLI estiver configurada, este arquivo pode ser gerado com
// `supabase gen types typescript`.

export type LegalDocumentType = "terms" | "privacy" | "health_data" | "marketing";
export type BiologicalSex = "female" | "male";

export type Database = {
  public: {
    Tables: {
      legal_documents: {
        Row: {
          id: string;
          type: LegalDocumentType;
          version: string;
          title: string;
          path: string;
          required: boolean;
          is_placeholder: boolean;
          is_current: boolean;
          effective_at: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          birth_date: string | null;
          biological_sex: BiologicalSex | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          first_name?: string;
          last_name?: string;
          birth_date?: string | null;
          biological_sex?: BiologicalSex | null;
          onboarding_completed_at?: string | null;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: "system" | "light" | "dark";
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: { theme?: "system" | "light" | "dark" };
        Relationships: [];
      };
      consents: {
        Row: {
          id: number;
          user_id: string;
          document_id: string;
          granted: boolean;
          source: "signup" | "app";
          created_at: string;
        };
        Insert: {
          user_id: string;
          document_id: string;
          granted: boolean;
          source?: "app";
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      consent_status: {
        Args: Record<string, never>;
        Returns: {
          document_id: string;
          type: LegalDocumentType;
          title: string;
          version: string;
          path: string;
          required: boolean;
          is_placeholder: boolean;
          granted: boolean;
          decided_at: string | null;
        }[];
      };
    };
    Enums: {
      legal_document_type: LegalDocumentType;
      biological_sex: BiologicalSex;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LegalDocument = Database["public"]["Tables"]["legal_documents"]["Row"];
export type ConsentStatus = Database["public"]["Functions"]["consent_status"]["Returns"][number];
