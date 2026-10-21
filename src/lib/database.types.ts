// CareerPilot AI — Full Supabase Database Types
// Matches supabase/migrations/001_initial_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApplicationStatus = "saved" | "applied" | "interview" | "rejected" | "offer";
export type AnalysisStatus = "pending" | "completed" | "failed";

export interface Database {
  __InternalSupabase: {
    PostgresSchema: { Tables: Record<string, unknown> };
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_job_titles: string[];
          preferred_locations: string[];
          preferred_work_mode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_job_titles?: string[];
          preferred_locations?: string[];
          preferred_work_mode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_job_titles?: string[];
          preferred_locations?: string[];
          preferred_work_mode?: string | null;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          storage_path: string;
          file_size: number | null;
          mime_type: string;
          extracted_text: string | null;
          skills: string[];
          experience_data: Json;
          education_data: Json;
          projects_data: Json;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          storage_path: string;
          file_size?: number | null;
          mime_type?: string;
          extracted_text?: string | null;
          skills?: string[];
          experience_data?: Json;
          education_data?: Json;
          projects_data?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          file_name?: string;
          storage_path?: string;
          file_size?: number | null;
          mime_type?: string;
          extracted_text?: string | null;
          skills?: string[];
          experience_data?: Json;
          education_data?: Json;
          projects_data?: Json;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          job_title: string;
          company: string;
          location: string | null;
          application_date: string;
          status: ApplicationStatus;
          job_url: string | null;
          notes: string | null;
          salary: string | null;
          work_mode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_title: string;
          company: string;
          location?: string | null;
          application_date?: string;
          status?: ApplicationStatus;
          job_url?: string | null;
          notes?: string | null;
          salary?: string | null;
          work_mode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          job_title?: string;
          company?: string;
          location?: string | null;
          application_date?: string;
          status?: ApplicationStatus;
          job_url?: string | null;
          notes?: string | null;
          salary?: string | null;
          work_mode?: string | null;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          job_application_id: string | null;
          job_title: string;
          company: string | null;
          job_description: string;
          match_score: number | null;
          matched_skills: string[];
          missing_skills: string[];
          experience_evidence: string[];
          recommendations: Json;
          analysis_status: AnalysisStatus;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          job_application_id?: string | null;
          job_title: string;
          company?: string | null;
          job_description: string;
          match_score?: number | null;
          matched_skills?: string[];
          missing_skills?: string[];
          experience_evidence?: string[];
          recommendations?: Json;
          analysis_status?: AnalysisStatus;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          match_score?: number | null;
          matched_skills?: string[];
          missing_skills?: string[];
          experience_evidence?: string[];
          recommendations?: Json;
          analysis_status?: AnalysisStatus;
          error_message?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_status: ApplicationStatus;
    };
  };
}

// Convenience row aliases
export type ProfileRow           = Database["public"]["Tables"]["profiles"]["Row"];
export type ResumeRow            = Database["public"]["Tables"]["resumes"]["Row"];
export type JobApplicationRow    = Database["public"]["Tables"]["job_applications"]["Row"];
export type AnalysisRow          = Database["public"]["Tables"]["analyses"]["Row"];
