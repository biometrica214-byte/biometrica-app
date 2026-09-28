// Tipos do banco, espelhando supabase/migrations/0001_fundacao.sql.
// Quando a Supabase CLI estiver configurada, este arquivo pode ser gerado com
// `supabase gen types typescript`.

export type LegalDocumentType = "terms" | "privacy" | "health_data" | "marketing";
export type BiologicalSex = "female" | "male";
export type ExamStatus = "uploaded" | "processing" | "processed" | "review_required" | "error";
export type DocumentMimeType = "application/pdf" | "image/jpeg" | "image/png" | "image/webp";

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
      exam_categories: {
        Row: { slug: string; label: string; sort_order: number; is_active: boolean };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      exams: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          collected_on: string;
          laboratory: string | null;
          notes: string | null;
          status: ExamStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: never; // via create_exam_with_documents
        Update: {
          title?: string;
          category?: string;
          collected_on?: string;
          laboratory?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      exam_documents: {
        Row: {
          id: string;
          exam_id: string;
          user_id: string;
          original_filename: string;
          mime_type: DocumentMimeType;
          size_bytes: number;
          storage_path: string;
          created_at: string;
        };
        Insert: never; // via create_exam_with_documents
        Update: never; // o original é imutável
        Relationships: [
          { foreignKeyName: "exam_documents_exam_id_user_id_fkey"; columns: ["exam_id", "user_id"]; isOneToOne: false; referencedRelation: "exams"; referencedColumns: ["id", "user_id"] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_exam_with_documents: {
        Args: {
          p_exam_id: string;
          p_title: string;
          p_category: string;
          p_collected_on: string;
          p_laboratory: string;
          p_notes: string;
          p_documents: {
            id: string;
            original_filename: string;
            mime_type: DocumentMimeType;
            size_bytes: number;
            storage_path: string;
          }[];
        };
        Returns: string;
      };
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
      exam_status: ExamStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LegalDocument = Database["public"]["Tables"]["legal_documents"]["Row"];
export type Exam = Database["public"]["Tables"]["exams"]["Row"];
export type ExamDocument = Database["public"]["Tables"]["exam_documents"]["Row"];
export type ExamCategory = Database["public"]["Tables"]["exam_categories"]["Row"];
export type ConsentStatus =Database["public"]["Functions"]["consent_status"]["Returns"][number];
