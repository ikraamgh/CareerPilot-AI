// CareerPilot AI — Typed query helpers
// Wraps Supabase queries with explicit row type casts.
// Use these instead of calling supabase.from() directly to get full typing.

import { supabase } from "./supabase";
import type { JobApplicationRow, AnalysisRow, ProfileRow, ResumeRow } from "./database.types";
import type { ApplicationStatus } from "./types";

// ─── job_applications ────────────────────────────────────────────────────────

export async function fetchApplications() {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .order("application_date", { ascending: false });
  return {
    data: (data ?? []) as JobApplicationRow[],
    error,
  };
}

export async function insertApplication(
  userId: string,
  row: Omit<JobApplicationRow, "id" | "user_id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("job_applications")
    .insert({ ...row, user_id: userId } as never)
    .select()
    .single();
  return { data: data as JobApplicationRow | null, error };
}

export async function updateApplication(
  id: string,
  row: Partial<Omit<JobApplicationRow, "id" | "user_id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("job_applications")
    .update(row as never)
    .eq("id", id)
    .select()
    .single();
  return { data: data as JobApplicationRow | null, error };
}

export async function deleteApplication(id: string) {
  return supabase.from("job_applications").delete().eq("id", id);
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return supabase.from("job_applications").update({ status } as never).eq("id", id);
}

// ─── analyses ────────────────────────────────────────────────────────────────

export async function fetchAnalyses() {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: (data ?? []) as AnalysisRow[], error };
}

export async function insertAnalysis(
  userId: string,
  row: Omit<AnalysisRow, "id" | "user_id" | "created_at">
) {
  const { data, error } = await supabase
    .from("analyses")
    .insert({ ...row, user_id: userId } as never)
    .select()
    .single();
  return { data: data as AnalysisRow | null, error };
}

// ─── profiles ────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data: data as ProfileRow | null, error };
}

export async function upsertProfile(
  userId: string,
  row: Partial<Omit<ProfileRow, "id" | "created_at">>
) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ ...row, id: userId, updated_at: new Date().toISOString() } as never);
  return { error };
}

// ─── resumes ─────────────────────────────────────────────────────────────────

export async function fetchResumes() {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: (data ?? []) as ResumeRow[], error };
}

export async function insertResume(
  userId: string,
  row: Omit<ResumeRow, "user_id" | "created_at" | "updated_at">
) {
  const { error } = await supabase
    .from("resumes")
    .insert({ ...row, user_id: userId } as never);
  return { error };
}

export async function deleteResume(id: string) {
  return supabase.from("resumes").delete().eq("id", id);
}

export async function setDefaultResume(id: string, userId: string) {
  await supabase.from("resumes").update({ is_default: false } as never).eq("user_id", userId);
  await supabase.from("resumes").update({ is_default: true } as never).eq("id", id);
}
