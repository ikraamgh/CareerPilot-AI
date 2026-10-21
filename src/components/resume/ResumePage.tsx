"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, RefreshCw,
  Trash2, User, Briefcase, GraduationCap, Code, ChevronDown, ChevronUp,
  ExternalLink, Loader2, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockResumeData } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { ResumeRow } from "@/lib/database.types";
import { fetchResumes, insertResume, deleteResume, setDefaultResume } from "@/lib/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function SectionHeader({ icon: Icon, title, expanded, onToggle }: {
  icon: React.ElementType; title: string; expanded: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between py-3 text-left">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
    </button>
  );
}

export function ResumePage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    skills: true, experience: true, education: true, projects: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const data = mockResumeData;

  const toggleSection = (key: keyof typeof expandedSections) =>
    setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  // ── Load resumes from Supabase ──────────────────────────────────────────
  const loadResumes = useCallback(async () => {
    setLoadingResumes(true);
    const { data } = await fetchResumes();
    setResumes(data);
    setLoadingResumes(false);
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  // ── Upload to Supabase Storage ─────────────────────────────────────────
  const handleUpload = async (f: File) => {
    setUploadError(null);

    if (f.type !== "application/pdf") {
      setUploadError("Only PDF files are accepted. Please select a .pdf file.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setUploadError(`File too large (${formatSize(f.size)}). Maximum is 10 MB.`);
      return;
    }

    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadError("You must be signed in to upload a resume."); setUploading(false); return; }

    // Generate storage path: {user_id}/{uuid}/filename
    const resumeId = crypto.randomUUID();
    const storagePath = `${user.id}/${resumeId}/${f.name}`;

    const { error: storageError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, f, { contentType: "application/pdf", upsert: false });

    if (storageError) {
      setUploadError(`Upload failed: ${storageError.message}`);
      setUploading(false);
      return;
    }

    // Save metadata to resumes table
    const { error: dbError } = await insertResume(user.id, {
      id: resumeId,
      file_name: f.name,
      storage_path: storagePath,
      file_size: f.size,
      mime_type: "application/pdf",
      is_default: resumes.length === 0, // first upload becomes default
      extracted_text: null,
      skills: [],
      experience_data: [],
      education_data: [],
      projects_data: [],
    });

    if (dbError) {
      // Clean up orphaned storage file
      await supabase.storage.from("resumes").remove([storagePath]);
      setUploadError(`Could not save resume record: ${dbError.message}`);
      setUploading(false);
      return;
    }

    await loadResumes();
    setUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  }, [resumes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (resume: ResumeRow) => {
    if (!confirm(`Delete "${resume.file_name}"? This cannot be undone.`)) return;
    await supabase.storage.from("resumes").remove([resume.storage_path]);
    await deleteResume(resume.id);
    await loadResumes();
  };

  const handleSetDefault = async (resume: ResumeRow) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await setDefaultResume(resume.id, user.id);
    await loadResumes();
  };

  const handleDownload = async (resume: ResumeRow) => {
    const { data: signedData, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resume.storage_path, 60); // 60-second signed URL
    if (error || !signedData?.signedUrl) { alert("Could not generate download link."); return; }
    window.open(signedData.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Resume"
        description="Upload your PDF resume to Supabase Storage, then use it for job match analysis."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload + Resume List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Upload Resume</h2>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all",
                uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                isDragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
              )}
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                {uploading
                  ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                  : <Upload className="w-6 h-6 text-slate-400" />
                }
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                {uploading ? "Uploading to Supabase Storage…" : "Drop your resume here"}
              </p>
              {!uploading && <p className="text-xs text-slate-400 mb-4">or click to browse</p>}
              {!uploading && (
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Select PDF File
                </button>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="sr-only" onChange={handleFileChange} />

            {uploadError && (
              <div className="mt-3 flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 flex-1">{uploadError}</p>
                <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs text-slate-400 mt-3 text-center">
              PDF only · Maximum 10 MB · Stored privately in Supabase
            </p>
          </div>

          {/* Uploaded resumes list */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Uploaded Resumes</h2>
            {loadingResumes ? (
              <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
            ) : resumes.length === 0 ? (
              <EmptyState icon={FileText} title="No resumes yet" description="Upload your first PDF to get started." />
            ) : (
              <div className="space-y-2">
                {resumes.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-slate-800 truncate">{r.file_name}</p>
                        {r.is_default && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">default</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {r.file_size ? formatSize(r.file_size) : "—"} · {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!r.is_default && (
                        <button onClick={() => handleSetDefault(r)} title="Set as default" className="p-1.5 rounded text-slate-400 hover:text-amber-500 hover:bg-amber-50" aria-label="Set default">
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDownload(r)} title="Download" className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50" aria-label="Download">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(r)} title="Delete" className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DemoBanner
            type="info"
            message="ℹ️ Your PDF is stored privately in Supabase Storage. The sample profile below is illustrative — AI-powered text extraction is coming in Phase 3."
          />
        </div>

        {/* Sample Resume Details Panel (illustrative) */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{data.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full">Sample</span>
                  </div>
                  <p className="text-slate-300 text-sm">{data.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                    <span>{data.email}</span>
                    <span>{data.location}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {data.name.split(" ").map((n) => n[0]).join("")}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{data.summary}</p>
            </div>

            <div className="divide-y divide-slate-100 px-5">
              {[
                { key: "skills" as const, icon: Code, title: "Skills" },
                { key: "experience" as const, icon: Briefcase, title: "Experience" },
                { key: "education" as const, icon: GraduationCap, title: "Education" },
                { key: "projects" as const, icon: User, title: "Projects" },
              ].map(({ key, icon, title }) => (
                <div key={key}>
                  <SectionHeader icon={icon} title={title} expanded={expandedSections[key]} onToggle={() => toggleSection(key)} />
                  {expandedSections[key] && (
                    <div className="pb-4">
                      {key === "skills" && (
                        <div className="space-y-2">
                          {Object.entries(data.skills).map(([cat, skills]) => (
                            <div key={cat}>
                              <p className="text-xs font-medium text-slate-500 capitalize mb-1.5">{cat}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {skills.map((s) => (
                                  <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {key === "experience" && (
                        <div className="space-y-4">
                          {data.experience.map((exp, i) => (
                            <div key={i}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{exp.title}</p>
                                  <p className="text-xs text-slate-500">{exp.company} · {exp.location}</p>
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{exp.period}</span>
                              </div>
                              <ul className="mt-2 space-y-1">
                                {exp.bullets.map((b, j) => (
                                  <li key={j} className="text-xs text-slate-600 flex gap-2">
                                    <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                      {key === "education" && (
                        <div className="space-y-2">
                          {data.education.map((edu, i) => (
                            <div key={i} className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{edu.degree}</p>
                                <p className="text-xs text-slate-500">{edu.school}</p>
                                {edu.notes && <p className="text-xs text-slate-400 mt-0.5">{edu.notes}</p>}
                              </div>
                              <span className="text-xs text-slate-400 shrink-0">{edu.period}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {key === "projects" && (
                        <div className="space-y-3">
                          {data.projects.map((proj, i) => (
                            <div key={i}>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800">{proj.name}</p>
                                <a href={`https://${proj.url}`} className="text-emerald-600 hover:text-emerald-700">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {proj.tech.map((t) => (
                                  <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
