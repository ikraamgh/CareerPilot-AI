// CareerPilot AI — Shared TypeScript Types

export type ApplicationStatus = "saved" | "applied" | "interview" | "rejected" | "offer";

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  applicationDate: string; // ISO date string
  status: ApplicationStatus;
  jobUrl?: string;
  notes?: string;
  salary?: string;
}

export interface SkillMatch {
  skill: string;
  found: boolean;
  confidence?: "high" | "medium" | "low";
}

export interface AnalysisResult {
  id: string;
  jobTitle: string;
  company: string;
  date: string; // ISO date string
  matchScore: number; // 0–100
  matchedSkills: string[];
  missingSkills: string[];
  experienceEvidence: string[];
  recommendations: string[];
  resumeUsed: string;
}

export interface ActivityItem {
  id: string;
  type: "application" | "analysis" | "resume" | "status_change";
  title: string;
  description: string;
  date: string;
  icon?: string;
}

export interface ResumeFile {
  name: string;
  size: number;
  uploadedAt: string;
}

export interface ImprovementCategory {
  id: string;
  title: string;
  icon: string;
  items: ImprovementItem[];
}

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  jobTitles: string[];
  locations: string[];
  workArrangements: ("remote" | "hybrid" | "onsite")[];
  language: string;
}
