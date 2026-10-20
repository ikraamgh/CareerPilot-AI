// Auto-generated Supabase database types
// Run `npx supabase gen types typescript` to regenerate after schema changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      job_applications: {
        Row: {
          id: string;
          job_title: string;
          company: string;
          location: string | null;
          application_date: string;
          status: "saved" | "applied" | "interview" | "rejected" | "offer";
          job_url: string | null;
          notes: string | null;
          salary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_title: string;
          company: string;
          location?: string | null;
          application_date: string;
          status?: "saved" | "applied" | "interview" | "rejected" | "offer";
          job_url?: string | null;
          notes?: string | null;
          salary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_title?: string;
          company?: string;
          location?: string | null;
          application_date?: string;
          status?: "saved" | "applied" | "interview" | "rejected" | "offer";
          job_url?: string | null;
          notes?: string | null;
          salary?: string | null;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          job_title: string;
          company: string;
          match_score: number;
          matched_skills: string[];
          missing_skills: string[];
          experience_evidence: string[];
          recommendations: string[];
          resume_used: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_title: string;
          company: string;
          match_score: number;
          matched_skills?: string[];
          missing_skills?: string[];
          experience_evidence?: string[];
          recommendations?: string[];
          resume_used?: string | null;
          created_at?: string;
        };
        Update: {
          job_title?: string;
          company?: string;
          match_score?: number;
          matched_skills?: string[];
          missing_skills?: string[];
          experience_evidence?: string[];
          recommendations?: string[];
          resume_used?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_status: "saved" | "applied" | "interview" | "rejected" | "offer";
    };
  };
}
