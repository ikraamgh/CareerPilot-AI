"use client";

import { useState, useMemo } from "react";
import { Search, Eye, ChevronDown, X, CheckCircle2, XCircle, Lightbulb, FileText } from "lucide-react";
import { mockAnalysisHistory, formatDate } from "@/lib/mock-data";
import { AnalysisResult } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

function ScorePill({ score }: { score: number }) {
  const colors =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 60
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={cn("text-sm font-bold px-2.5 py-1 rounded-full border", colors)}>
      {score}%
    </span>
  );
}

function DetailModal({ analysis, onClose }: { analysis: AnalysisResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">{analysis.jobTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{analysis.company} · {formatDate(analysis.date)}</p>
          </div>
          <div className="flex items-center gap-3">
            <ScorePill score={analysis.matchScore} />
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <DemoBanner />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-800">Skills Found in Resume</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedSkills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Not Found in Resume</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-slate-800">Experience Evidence</h3>
            </div>
            <ul className="space-y-1.5">
              {analysis.experienceEvidence.map((e, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-blue-400 shrink-0">→</span>{e}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-lime-600" />
              <h3 className="text-sm font-semibold text-slate-800">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {analysis.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 p-3 bg-lime-50 border border-lime-100 rounded-lg text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-lime-200 text-lime-800 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [selected, setSelected] = useState<AnalysisResult | null>(null);

  const filtered = useMemo(() => {
    let items = mockAnalysisHistory;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.jobTitle.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q)
      );
    }
    if (scoreFilter !== "all") {
      items = items.filter((a) =>
        scoreFilter === "high"
          ? a.matchScore >= 80
          : scoreFilter === "medium"
          ? a.matchScore >= 60 && a.matchScore < 80
          : a.matchScore < 60
      );
    }
    return items;
  }, [search, scoreFilter]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analysis History"
        description="Browse past job match analyses and review their details."
      />

      <DemoBanner
        type="info"
        message="ℹ️ This history shows sample analyses. When you run analyses on the Job Match page in demo mode, they do not persist to this list yet — persistence will be added in Phase 2."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search by job title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as typeof scoreFilter)}
            className="appearance-none w-full sm:w-44 pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          >
            <option value="all">All Scores</option>
            <option value="high">High match (≥80%)</option>
            <option value="medium">Medium match (60–79%)</option>
            <option value="low">Low match (&lt;60%)</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No analyses found"
            description="Try adjusting your search or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Job</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden sm:table-cell">Company</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Match</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{analysis.jobTitle}</p>
                      <p className="text-xs text-slate-500 sm:hidden">{analysis.company}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{analysis.company}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">{formatDate(analysis.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 hidden sm:block">
                          <div
                            className={cn(
                              "h-1.5 rounded-full",
                              analysis.matchScore >= 80
                                ? "bg-emerald-500"
                                : analysis.matchScore >= 60
                                ? "bg-amber-500"
                                : "bg-red-400"
                            )}
                            style={{ width: `${analysis.matchScore}%` }}
                          />
                        </div>
                        <ScorePill score={analysis.matchScore} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(analysis)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
              Showing {filtered.length} of {mockAnalysisHistory.length} analyses
            </div>
          </div>
        )}
      </div>

      {selected && (
        <DetailModal analysis={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
