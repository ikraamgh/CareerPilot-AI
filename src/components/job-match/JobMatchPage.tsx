"use client";

import { useState, useEffect } from "react";
import {
  Briefcase, Building2, BarChart2, CheckCircle2, XCircle,
  Lightbulb, FileText, ArrowRight, ChevronDown, ChevronUp,
  AlertTriangle, Sparkles, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { insertAnalysis, fetchResumes } from "@/lib/queries";
import type { ResumeRow } from "@/lib/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  resumeId: string;
  jobTitle: string;
  company: string;
  description: string;
}

interface FormErrors {
  jobTitle?: string;
  company?: string;
  description?: string;
}

interface AnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  experienceEvidence: string[];
  recommendations: string[];
  jobTitle: string;
  company: string;
}

type PageState = "form" | "loading" | "results" | "error";

// ─── Score Gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="110" height="110" className="-rotate-90">
        <circle cx="55" cy="55" r="40" fill="none" stroke="#e2e8f0" strokeWidth="9" />
        <circle
          cx="55" cy="55" r="40" fill="none"
          stroke={color} strokeWidth="9"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <div className="-mt-[74px] flex flex-col items-center mb-6">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
    </div>
  );
}

// ─── Expandable Section ───────────────────────────────────────────────────────
function Section({ title, icon: Icon, iconColor, items, expanded, onToggle, pill }: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  items: string[];
  expanded: boolean;
  onToggle: () => void;
  pill?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-4 h-4", iconColor)} />
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          {pill && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {pill}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-100">
          <ul className="space-y-2 mt-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function JobMatchPage() {
  const [pageState, setPageState] = useState<PageState>("form");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [form, setForm] = useState<FormState>({
    resumeId: "",
    jobTitle: "",
    company: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [expanded, setExpanded] = useState({
    matched: true, missing: true, evidence: false, recommendations: false,
  });

  // Load user's resumes
  useEffect(() => {
    fetchResumes().then(({ data }) => {
      setResumes(data);
      // Auto-select default or first resume
      const def = data.find((r) => r.is_default) ?? data[0];
      if (def) setForm((f) => ({ ...f, resumeId: def.id }));
    });
  }, []);

  const validate = () => {
    const errs: FormErrors = {};
    if (!form.jobTitle.trim()) errs.jobTitle = "Job title is required.";
    if (!form.company.trim()) errs.company = "Company name is required.";
    if (!form.description.trim() || form.description.trim().length < 50)
      errs.description = "Please paste a job description (at least 50 characters).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    setPageState("loading");
    setErrorMsg("");

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated. Please sign in.");

      // 2. Create a pending analysis record
      const { data: analysisRecord } = await insertAnalysis(user.id, {
        job_title: form.jobTitle,
        company: form.company || null,
        job_description: form.description,
        resume_id: form.resumeId || null,
        job_application_id: null,
        analysis_status: "pending",
        match_score: null,
        matched_skills: [],
        missing_skills: [],
        experience_evidence: [],
        recommendations: [],
        error_message: null,
      });

      if (!analysisRecord) throw new Error("Failed to create analysis record.");

      // 3. Call the AI API route
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysisRecord.id,
          resumeId: form.resumeId || null,
          jobTitle: form.jobTitle,
          company: form.company,
          jobDescription: form.description,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? `API error ${response.status}`);
      }

      const data = await response.json();

      setResult({
        matchScore: data.matchScore,
        summary: data.summary,
        matchedSkills: data.matchedSkills,
        missingSkills: data.missingSkills,
        experienceEvidence: data.experienceEvidence,
        recommendations: data.recommendations,
        jobTitle: form.jobTitle,
        company: form.company,
      });
      setPageState("results");

    } catch (err) {
      console.error("[JobMatch] Analysis failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setPageState("error");
    }
  };

  const handleReset = () => {
    setPageState("form");
    setResult(null);
    setErrors({});
    setForm((f) => ({ ...f, jobTitle: "", company: "", description: "" }));
  };

  const toggle = (key: keyof typeof expanded) =>
    setExpanded((e) => ({ ...e, [key]: !e[key] }));

  // ── Loading ──────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">Analyzing with Gemini AI…</p>
          <p className="text-sm text-slate-500 mt-1">Reading your resume and job description</p>
        </div>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (pageState === "error") {
    return (
      <div className="space-y-5">
        <PageHeader title="Job Match" description="AI-powered resume analysis" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">Analysis Failed</p>
            <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (pageState === "results" && result) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Job Match"
          description="AI-powered resume analysis"
          action={
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> New Analysis
            </button>
          }
        />

        {/* AI Badge */}
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini AI — real analysis based on your resume
        </div>

        {/* Score + Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={result.matchScore} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-bold text-slate-900">{result.jobTitle}</h2>
              {result.company && (
                <p className="text-sm text-slate-500 mt-0.5">{result.company}</p>
              )}
              <p className="text-sm text-slate-700 mt-3 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </div>

        {/* Skills pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-800">Matched Skills</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium ml-auto">
                {result.matchedSkills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-slate-800">Missing Skills</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium ml-auto">
                {result.missingSkills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expandable sections */}
        <div className="space-y-3">
          <Section
            title="Experience Evidence"
            icon={FileText} iconColor="text-blue-600"
            items={result.experienceEvidence}
            expanded={expanded.evidence} onToggle={() => toggle("evidence")}
            pill={`${result.experienceEvidence.length} points`}
          />
          <Section
            title="Recommendations"
            icon={Lightbulb} iconColor="text-amber-500"
            items={result.recommendations}
            expanded={expanded.recommendations} onToggle={() => toggle("recommendations")}
            pill={`${result.recommendations.length} tips`}
          />
        </div>

        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Analyze Another Job
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <PageHeader
        title="Job Match"
        description="Paste a job description and let Gemini AI analyze your resume fit."
      />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {/* Resume selector */}
        <div className="p-5">
          <label className="text-sm font-semibold text-slate-800 block mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Resume
          </label>
          {resumes.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              No resume uploaded yet. The AI will give general recommendations.
            </div>
          ) : (
            <select
              value={form.resumeId}
              onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            >
              <option value="">— No resume (general analysis) —</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name}{r.is_default ? " ⭐ (default)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Job Title */}
        <div className="p-5">
          <label className="text-sm font-semibold text-slate-800 block mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Job Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Frontend Developer"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            className={cn(
              "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
              errors.jobTitle ? "border-red-300 bg-red-50" : "border-slate-200"
            )}
          />
          {errors.jobTitle && <p className="text-xs text-red-600 mt-1">{errors.jobTitle}</p>}
        </div>

        {/* Company */}
        <div className="p-5">
          <label className="text-sm font-semibold text-slate-800 block mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Company Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Google"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className={cn(
              "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
              errors.company ? "border-red-300 bg-red-50" : "border-slate-200"
            )}
          />
          {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
        </div>

        {/* Job Description */}
        <div className="p-5">
          <label className="text-sm font-semibold text-slate-800 block mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            Job Description <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={10}
            placeholder="Paste the full job description here…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={cn(
              "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-y font-mono",
              errors.description ? "border-red-300 bg-red-50" : "border-slate-200"
            )}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description
              ? <p className="text-xs text-red-600">{errors.description}</p>
              : <p className="text-xs text-slate-400">Minimum 50 characters</p>
            }
            <p className="text-xs text-slate-400">{form.description.length} chars</p>
          </div>
        </div>

        {/* Submit */}
        <div className="p-5">
          <button
            onClick={handleAnalyze}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Analyze with Gemini AI
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            Powered by Google Gemini 1.5 Flash — real AI analysis
          </p>
        </div>
      </div>
    </div>
  );
}
