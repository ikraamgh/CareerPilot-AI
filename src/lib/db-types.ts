// Explicit row types for casting Supabase query results
// Used when the generic Database type isn't passed to createClient

export interface AppRow {
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
}

export interface AnalysisRow {
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
}
