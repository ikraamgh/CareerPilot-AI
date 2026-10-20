"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, Pencil, Trash2, ExternalLink, LayoutList, Columns3,
  X, AlertTriangle, MapPin, Calendar, ChevronDown, SortAsc, SortDesc,
  Loader2, WifiOff,
} from "lucide-react";
import { JobApplication, ApplicationStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS, formatDate } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { AppRow } from "@/lib/db-types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

const STATUSES: ApplicationStatus[] = ["saved", "applied", "interview", "rejected", "offer"];

// Map DB row → app type
function rowToApp(row: {
  id: string;
  job_title: string;
  company: string;
  location: string | null;
  application_date: string;
  status: ApplicationStatus;
  job_url: string | null;
  notes: string | null;
  salary: string | null;
}): JobApplication {
  return {
    id: row.id,
    jobTitle: row.job_title,
    company: row.company,
    location: row.location ?? "",
    applicationDate: row.application_date,
    status: row.status,
    jobUrl: row.job_url ?? "",
    notes: row.notes ?? "",
    salary: row.salary ?? "",
  };
}

// Map app type → DB insert/update shape
function appToRow(app: Omit<JobApplication, "id">) {
  return {
    job_title: app.jobTitle,
    company: app.company,
    location: app.location || null,
    application_date: app.applicationDate,
    status: app.status,
    job_url: app.jobUrl || null,
    notes: app.notes || null,
    salary: app.salary || null,
  };
}

// ─── Application Form Dialog ──────────────────────────────────────────────────
interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (app: JobApplication) => void;
  initial?: JobApplication | null;
  saving?: boolean;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function emptyForm(): Omit<JobApplication, "id"> {
  return {
    jobTitle: "",
    company: "",
    location: "",
    applicationDate: "2026-10-19",
    status: "applied",
    jobUrl: "",
    notes: "",
    salary: "",
  };
}

function FormDialog({ open, onClose, onSave, initial, saving }: FormDialogProps) {
  const [form, setForm] = useState<Omit<JobApplication, "id">>(
    initial ? { ...initial } : emptyForm()
  );
  const [errors, setErrors] = useState<Partial<Record<keyof JobApplication, string>>>({});

  useEffect(() => {
    if (open) {
      const base = initial ? { ...initial } : emptyForm();
      if (!initial) base.applicationDate = getToday();
      setForm(base);
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.jobTitle.trim()) errs.jobTitle = "Job title is required.";
    if (!form.company.trim()) errs.company = "Company is required.";
    if (!form.applicationDate) errs.applicationDate = "Date is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ id: initial?.id ?? "", ...form });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {initial ? "Edit Application" : "Add Application"}
          </h2>
          <button onClick={onClose} aria-label="Close dialog" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { id: "jobTitle", label: "Job Title *", placeholder: "e.g. Frontend Developer" },
            { id: "company", label: "Company *", placeholder: "e.g. Stripe" },
            { id: "location", label: "Location", placeholder: "e.g. San Francisco, CA" },
            { id: "salary", label: "Salary Range", placeholder: "e.g. $120k–$160k" },
            { id: "jobUrl", label: "Job URL", placeholder: "https://company.com/job" },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor={id}>{label}</label>
              <input
                id={id}
                type={id === "jobUrl" ? "url" : "text"}
                placeholder={placeholder}
                value={(form as Record<string, string>)[id] ?? ""}
                onChange={(e) => { setForm({ ...form, [id]: e.target.value }); setErrors({ ...errors, [id]: undefined }); }}
                className={cn(
                  "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
                  errors[id as keyof JobApplication] ? "border-red-300 bg-red-50" : "border-slate-200"
                )}
              />
              {errors[id as keyof JobApplication] && (
                <p className="text-xs text-red-600 mt-1">{errors[id as keyof JobApplication]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="date">Application Date *</label>
            <input
              id="date"
              type="date"
              value={form.applicationDate}
              onChange={(e) => setForm({ ...form, applicationDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="status">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add any notes about this application…"
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? "Save Changes" : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, appName, deleting }: {
  open: boolean; onClose: () => void; onConfirm: () => void; appName: string; deleting?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Delete Application</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete <strong>{appName}</strong>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({ status, apps, onEdit, onDelete, onStatusChange }: {
  status: ApplicationStatus;
  apps: JobApplication[];
  onEdit: (a: JobApplication) => void;
  onDelete: (a: JobApplication) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  const headerColors: Record<ApplicationStatus, string> = {
    saved: "border-t-slate-400", applied: "border-t-blue-500",
    interview: "border-t-amber-500", rejected: "border-t-red-400", offer: "border-t-emerald-500",
  };
  const countColors: Record<ApplicationStatus, string> = {
    saved: "bg-slate-200 text-slate-700", applied: "bg-blue-100 text-blue-700",
    interview: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-700", offer: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div className={`bg-slate-50 rounded-xl border border-slate-200 border-t-2 ${headerColors[status]} flex flex-col min-h-[200px]`}>
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-700">{STATUS_LABELS[status]}</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${countColors[status]}`}>{apps.length}</span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {apps.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No applications</p>}
        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow">
            <p className="text-xs font-semibold text-slate-800 line-clamp-2">{app.jobTitle}</p>
            <p className="text-xs text-slate-500 mt-0.5">{app.company}</p>
            {app.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-400 truncate">{app.location}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400">{formatDate(app.applicationDate)}</span>
              <div className="flex gap-1">
                <button onClick={() => onEdit(app)} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100" aria-label="Edit">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => onDelete(app)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<JobApplication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch from Supabase ──────────────────────────────────────────────────
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("application_date", { ascending: false });

    if (error) {
      setError("Could not load applications. Check your Supabase connection.");
      console.error(error);
    } else {
      setApplications((data ?? []).map(rowToApp));
    }
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleAdd = async (app: JobApplication) => {
    setSaving(true);
    const { data, error } = await supabase
      .from("job_applications")
      .insert(appToRow(app))
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Failed to save application. Please try again.");
    } else if (data) {
      setApplications((prev) => [rowToApp(data), ...prev]);
      setFormOpen(false);
    }
    setSaving(false);
  };

  const handleEdit = async (app: JobApplication) => {
    setSaving(true);
    const { data, error } = await supabase
      .from("job_applications")
      .update(appToRow(app))
      .eq("id", app.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Failed to update application. Please try again.");
    } else if (data) {
      setApplications((prev) => prev.map((a) => (a.id === app.id ? rowToApp(data) : a)));
      setEditTarget(null);
      setFormOpen(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      console.error(error);
      alert("Failed to delete application. Please try again.");
    } else {
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    // Optimistic update
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const { error } = await supabase
      .from("job_applications")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error);
      fetchApplications(); // revert on error
    }
  };

  // ── Filter / sort ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let apps = applications;
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter((a) => a.jobTitle.toLowerCase().includes(q) || a.company.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") apps = apps.filter((a) => a.status === statusFilter);
    apps = [...apps].sort((a, b) => {
      const diff = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
      return sortDir === "asc" ? diff : -diff;
    });
    return apps;
  }, [applications, search, statusFilter, sortDir]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <PageHeader
        title="Applications"
        description="Track your job applications — saved to Supabase in real time."
        action={
          <button
            onClick={() => { setEditTarget(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
          <button onClick={fetchApplications} className="ml-auto text-red-600 underline text-xs whitespace-nowrap">Retry</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search by title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
            className="appearance-none w-full sm:w-40 pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          {sortDir === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
          <span className="hidden sm:inline">{sortDir === "desc" ? "Newest" : "Oldest"}</span>
        </button>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
          {(["list", "kanban"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn("flex items-center gap-1.5 px-3 py-2 text-sm transition-colors", view === v ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50")}
            >
              {v === "list" ? <LayoutList className="w-4 h-4" /> : <Columns3 className="w-4 h-4" />}
              <span className="hidden sm:inline capitalize">{v}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex justify-center">
          <LoadingSpinner size="lg" label="Loading applications…" />
        </div>
      )}

      {/* List View */}
      {!loading && view === "list" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="No applications found"
              description={search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Add your first job application to get started."}
              action={!search && statusFilter === "all" ? (
                <button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
                  Add Application
                </button>
              ) : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden sm:table-cell">Company</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden lg:table-cell">Location</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{app.jobTitle}</p>
                        {app.salary && <p className="text-xs text-slate-400">{app.salary}</p>}
                        <span className="sm:hidden text-xs text-slate-500">{app.company}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{app.company}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {app.location && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3" /><span className="text-xs">{app.location}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" /><span className="text-xs">{formatDate(app.applicationDate)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="appearance-none text-xs pr-4 py-0.5 rounded-full border font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                            style={{ paddingLeft: "8px" }}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                          <span className={`absolute inset-0 rounded-full pointer-events-none border ${STATUS_COLORS[app.status]}`} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {app.jobUrl && (
                            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label="View posting">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => { setEditTarget(app); setFormOpen(true); }} className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(app)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
                Showing {filtered.length} of {applications.length} applications · Stored in Supabase
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {!loading && view === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              apps={filtered.filter((a) => a.status === status)}
              onEdit={(app) => { setEditTarget(app); setFormOpen(true); }}
              onDelete={(app) => setDeleteTarget(app)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <FormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={editTarget ? handleEdit : handleAdd}
        initial={editTarget}
        saving={saving}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        appName={deleteTarget ? `${deleteTarget.jobTitle} @ ${deleteTarget.company}` : ""}
        deleting={deleting}
      />
    </div>
  );
}
