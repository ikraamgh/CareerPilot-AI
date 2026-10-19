"use client";

import Link from "next/link";
import {
  Upload,
  Briefcase,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  BookmarkPlus,
  BarChart2,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  mockDashboardStats,
  mockActivity,
  mockApplications,
  mockAnalysisHistory,
  formatDate,
  timeAgo,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ApplicationStatus } from "@/lib/types";

const statCards = [
  {
    label: "Total Applications",
    value: mockDashboardStats.totalApplications,
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/applications",
  },
  {
    label: "Interviews",
    value: mockDashboardStats.interviews,
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: "/applications?status=interview",
  },
  {
    label: "Saved Jobs",
    value: mockDashboardStats.savedJobs,
    icon: BookmarkPlus,
    color: "text-slate-600",
    bg: "bg-slate-100",
    href: "/applications?status=saved",
  },
  {
    label: "Analyses Done",
    value: mockDashboardStats.completedAnalyses,
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/history",
  },
];

const activityIcons: Record<string, React.ElementType> = {
  application: Briefcase,
  analysis: BarChart2,
  resume: Upload,
  status_change: Activity,
};

export function OverviewPage() {
  const statusCounts = Object.entries(
    mockApplications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, Alex 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Your career workspace — track applications, analyze job matches, and improve your resume.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/resume"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </Link>
          <Link
            href="/job-match"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Analyze Job
          </Link>
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-500 text-white text-sm font-medium hover:bg-lime-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Application Status</h2>
            <Link
              href="/applications"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {statusCounts.map(([status, count]) => {
              const pct = Math.round((count / mockApplications.length) * 100);
              const barColors: Record<string, string> = {
                saved: "bg-slate-400",
                applied: "bg-blue-500",
                interview: "bg-amber-500",
                rejected: "bg-red-400",
                offer: "bg-emerald-500",
              };
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs font-medium">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${barColors[status]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Activity</h2>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-4">
            {mockActivity.slice(0, 5).map((item) => {
              const Icon = activityIcons[item.type] || Activity;
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 pt-0.5">
                    {timeAgo(item.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Recent Analyses</h2>
          <Link
            href="/history"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            View history <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {mockAnalysisHistory.slice(0, 3).map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {analysis.jobTitle} @ {analysis.company}
                </p>
                <p className="text-xs text-slate-500">{formatDate(analysis.date)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 bg-slate-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      analysis.matchScore >= 80
                        ? "bg-emerald-500"
                        : analysis.matchScore >= 60
                        ? "bg-amber-500"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${analysis.matchScore}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-bold ${
                    analysis.matchScore >= 80
                      ? "text-emerald-600"
                      : analysis.matchScore >= 60
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                >
                  {analysis.matchScore}%
                </span>
              </div>
              <Link
                href="/history"
                className="text-xs text-emerald-600 hover:underline shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Recent Applications</h2>
          <Link
            href="/applications"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4 hidden sm:table-cell">
                  Company
                </th>
                <th className="text-left text-xs font-medium text-slate-500 pb-2 pr-4 hidden md:table-cell">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-slate-500 pb-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockApplications.slice(0, 5).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-slate-800">
                    {app.jobTitle}
                    <span className="sm:hidden text-slate-500 font-normal">
                      {" "}
                      @ {app.company}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600 hidden sm:table-cell">
                    {app.company}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 hidden md:table-cell">
                    {formatDate(app.applicationDate)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={app.status as ApplicationStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
