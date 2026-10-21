"use client";

import { useState } from "react";
import {
  Search,
  Briefcase,
  Building2,
  BarChart2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { mockAnalysisHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { insertAnalysis } from "@/lib/queries";

interface FormState {
  resume: string;
  jobTitle: string;
  company: string;
  description: string;
}

interface FormErrors {
  jobTitle?: string;
  company?: string;
  description?: string;
}

type PageState = "form" | "loading" | "results";

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#ef4444";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="-mt-[68px] flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-slate-500 mt-0.5">Match</span>
      </div>
      <div className="mt-10" />
    </div>
  );
}

export function JobMatchPage() {
  const [pageState, setPageState] = useState<PageState>("form");
  const [selectedAnalysis, setSelectedAnalysis] = useState(mockAnalysisHistory[0]);
  const [form, setForm] = useState<FormState>({
    resume: "demo-resume",
    jobTitle: "",
    company: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAllMatched, setShowAllMatched] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);

  const validate = (): boolean => {
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

    // Save a pending analysis record — AI integration is Phase 3
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await insertAnalysis(user.id, {
          job_title: form.jobTitle,
          company: form.company || null,
          job_description: form.description,
          analysis_status: "pending",
          resume_id: null,
          job_application_id: null,
          match_score: null,
          matched_skills: [],
          missing_skills: [],
          experience_evidence: [],
          recommendations: [],
          error_message: null,
        });
      }
    } catch {
      // Non-blocking — demo result still shows
    }

    setTimeout(() => {
      // Show demo result — clearly labelled as sample data
      const result = {
        ...mockAnalysisHistory[0],
        jobTitle: form.jobTitle,
        company: form.company,
      };
      setSelectedAnalysis(result);
      setPageState("results");
    }, 2200);
  };

  const handleReset = () => {
    setPageState("form");
    setForm({ resume: "demo-resume", jobTitle: "", company: "", description: "" });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Match"
        description="Analyze how well your resume matches a job description."
        action={
          pageState === "results" ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              New Analysis
            </button>
          ) : undefined
        }
      />

      {pageState === "loading" && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center">
          <LoadingSpinner size="lg" label="Simulating analysis…" />
          <p className="text-sm text-slate-500 mt-6 text-center max-w-sm">
            Comparing your resume against the job description. This demo will show
            sample results in a moment.
          </p>
        </div>
      )}

      {pageState === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Job Details</h2>

              {/* Resume selector */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="resume-select">
                  Resume to Use
                </label>
                <select
                  id="resume-select"
                  value={form.resume}
                  onChange={(e) => setForm({ ...form, resume: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="demo-resume">Demo Resume — Alex Johnson</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your resume on the My Resume page to use your own.
                </p>
              </div>

              {/* Job title */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="job-title">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="job-title"
                    type="text"
                    placeholder="e.g. Senior Frontend Developer"
                    value={form.jobTitle}
                    onChange={(e) => { setForm({ ...form, jobTitle: e.target.value }); setErrors({ ...errors, jobTitle: undefined }); }}
                    className={cn(
                      "w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
                      errors.jobTitle ? "border-red-300 bg-red-50" : "border-slate-200"
                    )}
                  />
                </div>
                {errors.jobTitle && (
                  <p className="text-xs text-red-600 mt-1">{errors.jobTitle}</p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="company">
                  Company <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="company"
                    type="text"
                    placeholder="e.g. Stripe"
                    value={form.company}
                    onChange={(e) => { setForm({ ...form, company: e.target.value }); setErrors({ ...errors, company: undefined }); }}
                    className={cn(
                      "w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
                      errors.company ? "border-red-300 bg-red-50" : "border-slate-200"
                    )}
                  />
                </div>
                {errors.company && (
                  <p className="text-xs text-red-600 mt-1">{errors.company}</p>
                )}
              </div>

              {/* Job description */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="jd">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="jd"
                  placeholder="Paste the full job description here…"
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: undefined }); }}
                  rows={10}
                  className={cn(
                    "w-full px-3 py-2 text-sm border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
                    errors.description ? "border-red-300 bg-red-50" : "border-slate-200"
                  )}
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-xs text-red-600">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-slate-400">{form.description.length} chars</span>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
              >
                <Search className="w-4 h-4" />
                Analyze Match
              </button>
            </div>
          </div>

          {/* Sidebar tips */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Tips for best results</h3>
              <ul className="space-y-2.5">
                {[
                  "Paste the full job description — not just the title.",
                  "Include the requirements and responsibilities sections.",
                  "The more text, the more accurate the skill matching.",
                  "Try different job postings to compare match scores.",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <DemoBanner
              type="info"
              message="ℹ️ Demo mode — after clicking Analyze Match, sample results will be shown. No real AI analysis is performed."
            />
          </div>
        </div>
      )}

      {pageState === "results" && (
        <div className="space-y-5">
          <DemoBanner />

          {/* Score + Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <ScoreGauge score={selectedAnalysis.matchScore} />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedAnalysis.jobTitle} @ {selectedAnalysis.company}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Resume: {selectedAnalysis.resumeUsed}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">
                      {selectedAnalysis.matchedSkills.length}
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">Skills matched</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-700">
                      {selectedAnalysis.missingSkills.length}
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">Not found in resume</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Matched Skills */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-800">Skills Found in Resume</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(showAllMatched
                  ? selectedAnalysis.matchedSkills
                  : selectedAnalysis.matchedSkills.slice(0, 6)
                ).map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
              </div>
              {selectedAnalysis.matchedSkills.length > 6 && (
                <button
                  onClick={() => setShowAllMatched(!showAllMatched)}
                  className="mt-3 text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  {showAllMatched ? (
                    <><ChevronUp className="w-3 h-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Show {selectedAnalysis.matchedSkills.length - 6} more</>
                  )}
                </button>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800">Not Found in Resume</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(showAllMissing
                  ? selectedAnalysis.missingSkills
                  : selectedAnalysis.missingSkills.slice(0, 6)
                ).map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-full"
                  >
                    <XCircle className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 italic">
                These skills were not found in your resume. This does not mean you lack these
                skills — they may simply not be documented yet.
              </p>
              {selectedAnalysis.missingSkills.length > 6 && (
                <button
                  onClick={() => setShowAllMissing(!showAllMissing)}
                  className="mt-2 text-xs text-amber-600 hover:underline flex items-center gap-1"
                >
                  {showAllMissing ? (
                    <><ChevronUp className="w-3 h-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Show more</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Experience Evidence */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-800">Relevant Experience Evidence</h3>
            </div>
            <ul className="space-y-2">
              {selectedAnalysis.experienceEvidence.map((ev, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  {ev}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-lime-600" />
              <h3 className="text-sm font-semibold text-slate-800">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {selectedAnalysis.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex gap-3 p-3 bg-lime-50 border border-lime-100 rounded-lg text-sm text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-lime-200 text-lime-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Simulated Results</p>
              <p>
                These results are generated from sample data and do not reflect actual analysis
                of your resume or the job description you entered. Real AI-powered analysis will
                be available in Phase 2.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
