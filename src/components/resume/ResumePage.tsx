"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Briefcase,
  GraduationCap,
  Code,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockResumeData } from "@/lib/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoBanner } from "@/components/shared/DemoBanner";

interface UploadedFile {
  name: string;
  size: number;
  uploadedAt: Date;
  status: "success" | "error";
  errorMessage?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function SectionHeader({
  icon: Icon,
  title,
  expanded,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      {expanded ? (
        <ChevronUp className="w-4 h-4 text-slate-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}

export function ResumePage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    experience: true,
    education: true,
    projects: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (key: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const processFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setFile({
        name: f.name,
        size: f.size,
        uploadedAt: new Date(),
        status: "error",
        errorMessage: "Only PDF files are accepted. Please select a .pdf file.",
      });
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFile({
        name: f.name,
        size: f.size,
        uploadedAt: new Date(),
        status: "error",
        errorMessage: `File is too large (${formatSize(f.size)}). Maximum size is 10 MB.`,
      });
      return;
    }
    setFile({
      name: f.name,
      size: f.size,
      uploadedAt: new Date(),
      status: "success",
    });
    setShowDetails(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const data = mockResumeData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Resume"
        description="Upload your resume and view a sample analysis of your skills and experience."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Upload Resume</h2>

            {!file || file.status === "error" ? (
              <>
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all",
                    isDragOver
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  )}
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Drop your resume here
                  </p>
                  <p className="text-xs text-slate-400 mb-4">or click to browse</p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Select PDF File
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />

                {/* Error */}
                {file?.status === "error" && (
                  <div className="mt-3 flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-red-700">{file.name}</p>
                      <p className="text-xs text-red-600 mt-0.5">{file.errorMessage}</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="ml-auto text-red-400 hover:text-red-600"
                      aria-label="Dismiss error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-3 text-center">
                  PDF only · Maximum 10 MB
                </p>
              </>
            ) : (
              /* Uploaded State */
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatSize(file.size)} · Uploaded {file.uploadedAt.toLocaleTimeString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">File selected</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Replace
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Remove uploaded file"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <DemoBanner
            type="info"
            message="ℹ️ For this demo, no PDF parsing is performed. The details panel below shows sample resume data to illustrate how the parsed content would appear."
          />
        </div>

        {/* Resume Details Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Resume Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{data.name}</h2>
                  <p className="text-slate-300 text-sm mt-0.5">{data.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                    <span>{data.email}</span>
                    <span>{data.location}</span>
                    <a href={`https://${data.linkedin}`} className="hover:text-white transition-colors flex items-center gap-1">
                      {data.linkedin} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {data.name.split(" ").map(n => n[0]).join("")}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{data.summary}</p>
            </div>

            <div className="divide-y divide-slate-100 px-5">
              {/* Skills */}
              <div>
                <SectionHeader
                  icon={Code}
                  title="Skills"
                  expanded={expandedSections.skills}
                  onToggle={() => toggleSection("skills")}
                />
                {expandedSections.skills && (
                  <div className="pb-4 space-y-2">
                    {Object.entries(data.skills).map(([category, skills]) => (
                      <div key={category}>
                        <p className="text-xs font-medium text-slate-500 capitalize mb-1.5">{category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div>
                <SectionHeader
                  icon={Briefcase}
                  title="Experience"
                  expanded={expandedSections.experience}
                  onToggle={() => toggleSection("experience")}
                />
                {expandedSections.experience && (
                  <div className="pb-4 space-y-4">
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
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div>
                <SectionHeader
                  icon={GraduationCap}
                  title="Education"
                  expanded={expandedSections.education}
                  onToggle={() => toggleSection("education")}
                />
                {expandedSections.education && (
                  <div className="pb-4 space-y-2">
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
              </div>

              {/* Projects */}
              <div>
                <SectionHeader
                  icon={User}
                  title="Projects"
                  expanded={expandedSections.projects}
                  onToggle={() => toggleSection("projects")}
                />
                {expandedSections.projects && (
                  <div className="pb-4 space-y-3">
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
                            <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
