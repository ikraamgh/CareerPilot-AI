"use client";

import { useState } from "react";
import { User, Briefcase, MapPin, Globe, Monitor, Save, Plus, X } from "lucide-react";
import { mockUserProfile } from "@/lib/mock-data";
import { UserProfile } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { cn } from "@/lib/utils";

type WorkArrangement = "remote" | "hybrid" | "onsite";

const WORK_ARRANGEMENTS: { value: WorkArrangement; label: string }[] = [
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

function TagInput({
  label,
  tags,
  placeholder,
  onAdd,
  onRemove,
}: {
  label: string;
  tags: string[];
  placeholder: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
      setInput("");
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full"
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="text-emerald-500 hover:text-emerald-700"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Add"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
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
  const [profile, setProfile] = useState<UserProfile>({ ...mockUserProfile });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Demo only — no backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleArrangement = (val: WorkArrangement) => {
    setProfile((prev) => ({
      ...prev,
      workArrangements: prev.workArrangements.includes(val)
        ? prev.workArrangements.filter((a) => a !== val)
        : [...prev.workArrangements, val],
    }));
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your profile and job preferences."
        action={
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              saved
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            )}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        }
      />

      <DemoBanner
        type="info"
        message="ℹ️ Settings are for demo purposes only. No data is sent to a server or securely saved. Changes persist only in this browser session."
      />

      {/* Profile */}
      <SectionCard icon={User} title="Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </div>
      </SectionCard>

      {/* Job Preferences */}
      <SectionCard icon={Briefcase} title="Preferred Job Titles">
        <TagInput
          label="Add roles you're interested in"
          tags={profile.jobTitles}
          placeholder="e.g. Frontend Developer"
          onAdd={(t) => setProfile({ ...profile, jobTitles: [...profile.jobTitles, t] })}
          onRemove={(t) => setProfile({ ...profile, jobTitles: profile.jobTitles.filter((x) => x !== t) })}
        />
      </SectionCard>

      {/* Locations */}
      <SectionCard icon={MapPin} title="Preferred Locations">
        <TagInput
          label="Add locations you'd consider working in"
          tags={profile.locations}
          placeholder="e.g. San Francisco, CA"
          onAdd={(t) => setProfile({ ...profile, locations: [...profile.locations, t] })}
          onRemove={(t) => setProfile({ ...profile, locations: profile.locations.filter((x) => x !== t) })}
        />
      </SectionCard>

      {/* Work Arrangement */}
      <SectionCard icon={Monitor} title="Work Arrangement">
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">Preferred arrangements (select all that apply)</p>
          <div className="flex gap-3 flex-wrap">
            {WORK_ARRANGEMENTS.map(({ value, label }) => {
              const isActive = profile.workArrangements.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleArrangement(value)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg border font-medium transition-colors",
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard icon={Globe} title="Language">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="language">
            Interface Language
          </label>
          <select
            id="language"
            value={profile.language}
            onChange={(e) => setProfile({ ...profile, language: e.target.value })}
            className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          >
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Multi-language support will be added in a future release.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
