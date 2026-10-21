"use client";

import { useState, useEffect } from "react";
import { User, Briefcase, MapPin, Globe, Monitor, Save, Plus, X, Loader2, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ProfileRow } from "@/lib/database.types";
import { fetchProfile, upsertProfile } from "@/lib/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

type WorkMode = "remote" | "hybrid" | "onsite";
const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
];

function TagInput({ label, tags, placeholder, onAdd, onRemove }: {
  label: string; tags: string[]; placeholder: string;
  onAdd: (t: string) => void; onRemove: (t: string) => void;
}) {
  const [input, setInput] = useState("");
  const commit = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) { onAdd(v); setInput(""); }
  };
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full">
            {t}
            <button onClick={() => onRemove(t)} className="text-emerald-500 hover:text-emerald-700" aria-label={`Remove ${t}`}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text" value={input} placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
        <button type="button" onClick={commit} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" aria-label="Add">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const [profile, setProfile] = useState<Partial<ProfileRow> & { email?: string; language?: string }>({
    full_name: "",
    preferred_job_titles: [],
    preferred_locations: [],
    preferred_work_mode: "remote",
    email: "",
    language: "en",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await fetchProfile(user.id);

      setProfile({
        full_name: prof?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "",
        preferred_job_titles: prof?.preferred_job_titles ?? [],
        preferred_locations: prof?.preferred_locations ?? [],
        preferred_work_mode: prof?.preferred_work_mode ?? "remote",
        email: user.email ?? "",
        language: "en",
      });
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated."); setSaving(false); return; }

    const { error: upsertError } = await upsertProfile(user.id, {
      full_name: profile.full_name ?? null,
      preferred_job_titles: profile.preferred_job_titles ?? [],
      preferred_locations: profile.preferred_locations ?? [],
      preferred_work_mode: profile.preferred_work_mode ?? null,
    });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <LoadingSpinner size="lg" label="Loading profile…" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your profile and job preferences."
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60",
              saved
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
          </button>
        }
      />

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <SectionCard icon={User} title="Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="name">Full Name</label>
            <input
              id="name" type="text" value={profile.full_name ?? ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="email">Email Address</label>
            <input
              id="email" type="email" value={profile.email ?? ""} disabled
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email is managed by your account.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Briefcase} title="Preferred Job Titles">
        <TagInput
          label="Add roles you're targeting"
          tags={profile.preferred_job_titles ?? []}
          placeholder="e.g. Frontend Developer"
          onAdd={(t) => setProfile({ ...profile, preferred_job_titles: [...(profile.preferred_job_titles ?? []), t] })}
          onRemove={(t) => setProfile({ ...profile, preferred_job_titles: (profile.preferred_job_titles ?? []).filter((x) => x !== t) })}
        />
      </SectionCard>

      <SectionCard icon={MapPin} title="Preferred Locations">
        <TagInput
          label="Add locations you'd consider"
          tags={profile.preferred_locations ?? []}
          placeholder="e.g. San Francisco, CA"
          onAdd={(t) => setProfile({ ...profile, preferred_locations: [...(profile.preferred_locations ?? []), t] })}
          onRemove={(t) => setProfile({ ...profile, preferred_locations: (profile.preferred_locations ?? []).filter((x) => x !== t) })}
        />
      </SectionCard>

      <SectionCard icon={Monitor} title="Work Arrangement">
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">Preferred work mode</p>
          <div className="flex gap-3 flex-wrap">
            {WORK_MODES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setProfile({ ...profile, preferred_work_mode: value })}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg border font-medium transition-colors",
                  profile.preferred_work_mode === value
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Globe} title="Language">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="language">Interface Language</label>
          <select
            id="language"
            value={profile.language ?? "en"}
            onChange={(e) => setProfile({ ...profile, language: e.target.value })}
            className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          >
            {LANGUAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <p className="text-xs text-slate-400 mt-1">Multi-language support coming in a future release.</p>
        </div>
      </SectionCard>
    </div>
  );
}
