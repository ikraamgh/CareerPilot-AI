// CareerPilot AI — Shared Mock Data
// Single source of truth for all demo content across the application

import {
  JobApplication,
  AnalysisResult,
  ActivityItem,
  ImprovementCategory,
  UserProfile,
} from "./types";

// ─── User Profile ────────────────────────────────────────────────────────────
export const mockUserProfile: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  jobTitles: ["Frontend Developer", "React Developer", "Full Stack Engineer"],
  locations: ["San Francisco, CA", "Remote"],
  workArrangements: ["remote", "hybrid"],
  language: "en",
};

// ─── Job Applications ─────────────────────────────────────────────────────────
export const mockApplications: JobApplication[] = [
  {
    id: "app-1",
    jobTitle: "Senior Frontend Developer",
    company: "Stripe",
    location: "San Francisco, CA (Hybrid)",
    applicationDate: "2026-10-15",
    status: "interview",
    jobUrl: "https://stripe.com/jobs",
    notes: "Technical screen scheduled for Oct 25. Focus on React and TypeScript.",
    salary: "$160k–$200k",
  },
  {
    id: "app-2",
    jobTitle: "React Engineer",
    company: "Vercel",
    location: "Remote",
    applicationDate: "2026-10-12",
    status: "applied",
    jobUrl: "https://vercel.com/careers",
    notes: "Applied via LinkedIn. Referral from Jane Doe.",
    salary: "$140k–$180k",
  },
  {
    id: "app-3",
    jobTitle: "Software Engineer II",
    company: "Notion",
    location: "San Francisco, CA (Onsite)",
    applicationDate: "2026-10-08",
    status: "rejected",
    notes: "Automated rejection after 4 days. Position may have been filled internally.",
  },
  {
    id: "app-4",
    jobTitle: "Frontend Engineer",
    company: "Linear",
    location: "Remote",
    applicationDate: "2026-10-05",
    status: "offer",
    jobUrl: "https://linear.app/careers",
    notes: "Offer: $150k base + equity. Deadline to respond: Oct 30.",
    salary: "$150k + equity",
  },
  {
    id: "app-5",
    jobTitle: "UI Engineer",
    company: "Figma",
    location: "San Francisco, CA (Hybrid)",
    applicationDate: "2026-10-02",
    status: "saved",
    jobUrl: "https://figma.com/careers",
    notes: "Great role — need to tailor resume to emphasize design systems work.",
  },
  {
    id: "app-6",
    jobTitle: "Full Stack Developer",
    company: "Loom",
    location: "Remote",
    applicationDate: "2026-09-28",
    status: "applied",
    jobUrl: "https://loom.com/careers",
    salary: "$130k–$160k",
  },
];

// ─── Analysis History ─────────────────────────────────────────────────────────
export const mockAnalysisHistory: AnalysisResult[] = [
  {
    id: "analysis-1",
    jobTitle: "Senior Frontend Developer",
    company: "Stripe",
    date: "2026-10-14",
    matchScore: 82,
    resumeUsed: "Alex_Johnson_Resume_v3.pdf",
    matchedSkills: [
      "React",
      "TypeScript",
      "JavaScript",
      "CSS",
      "REST APIs",
      "Git",
      "Node.js",
    ],
    missingSkills: ["GraphQL", "Go", "Kubernetes"],
    experienceEvidence: [
      "3+ years of React experience matches requirement of 2+ years",
      "TypeScript usage throughout current role aligns with requirement",
      "Experience building payment UI components relevant to Stripe's domain",
    ],
    recommendations: [
      "Add a GraphQL project or learning milestone to your resume",
      "Highlight any payment or fintech-related project work",
      "Quantify your performance improvements (e.g. 'reduced load time by 40%')",
      "Mention experience with design systems or component libraries",
    ],
  },
  {
    id: "analysis-2",
    jobTitle: "React Engineer",
    company: "Vercel",
    date: "2026-10-11",
    matchScore: 76,
    resumeUsed: "Alex_Johnson_Resume_v3.pdf",
    matchedSkills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Vercel deployment",
      "CSS",
      "Git",
    ],
    missingSkills: ["Rust", "WebAssembly", "Edge Functions"],
    experienceEvidence: [
      "Next.js experience directly relevant to Vercel's core product",
      "CI/CD experience with Vercel platform",
      "Open-source contributions match Vercel's culture",
    ],
    recommendations: [
      "Highlight specific Next.js features you've used (App Router, Server Components)",
      "Add any edge computing or CDN-related experience",
      "Emphasize open-source contributions on GitHub",
      "Mention any performance optimization work with Core Web Vitals",
    ],
  },
  {
    id: "analysis-3",
    jobTitle: "UI Engineer",
    company: "Figma",
    date: "2026-10-01",
    matchScore: 69,
    resumeUsed: "Alex_Johnson_Resume_v2.pdf",
    matchedSkills: [
      "React",
      "TypeScript",
      "CSS",
      "JavaScript",
      "Accessibility",
    ],
    missingSkills: [
      "Canvas API",
      "WebGL",
      "C++",
      "Design systems (documented)",
    ],
    experienceEvidence: [
      "Frontend experience with complex UIs matches Figma's requirements",
      "Accessibility work mentioned in current role",
    ],
    recommendations: [
      "Build a small Canvas API or WebGL demo project",
      "Document and showcase any design systems work",
      "Add accessibility-related achievements with metrics",
      "Consider contributing to a Figma plugin to demonstrate product understanding",
    ],
  },
];

// ─── Recent Activity ──────────────────────────────────────────────────────────
export const mockActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "status_change",
    title: "Interview scheduled at Stripe",
    description: "Application status updated to Interview",
    date: "2026-10-15T14:30:00Z",
  },
  {
    id: "act-2",
    type: "application",
    title: "Applied to React Engineer at Vercel",
    description: "Application submitted via LinkedIn",
    date: "2026-10-12T10:00:00Z",
  },
  {
    id: "act-3",
    type: "analysis",
    title: "Resume analyzed for Stripe",
    description: "Match score: 82% — 7 matched skills",
    date: "2026-10-14T09:15:00Z",
  },
  {
    id: "act-4",
    type: "application",
    title: "Offer received from Linear",
    description: "Application status updated to Offer",
    date: "2026-10-10T16:00:00Z",
  },
  {
    id: "act-5",
    type: "analysis",
    title: "Resume analyzed for Vercel",
    description: "Match score: 76% — 7 matched skills",
    date: "2026-10-11T11:45:00Z",
  },
  {
    id: "act-6",
    type: "resume",
    title: "Resume uploaded",
    description: "Alex_Johnson_Resume_v3.pdf uploaded successfully",
    date: "2026-10-10T08:00:00Z",
  },
];

// ─── Improvement Plan ─────────────────────────────────────────────────────────
export const mockImprovementPlan: ImprovementCategory[] = [
  {
    id: "resume",
    title: "Resume Improvements",
    icon: "FileText",
    items: [
      {
        id: "r-1",
        title: "Quantify your impact",
        description:
          "Replace vague descriptions like 'improved performance' with specific metrics such as 'reduced page load time by 42% using code splitting and lazy loading'.",
        priority: "high",
        actionable: "Review each bullet point and add measurable outcomes.",
      },
      {
        id: "r-2",
        title: "Tailor your summary",
        description:
          "Your current summary is generic. Customize it for each application type to match the role's language and requirements.",
        priority: "high",
        actionable: "Write 2–3 resume variants for different job types.",
      },
      {
        id: "r-3",
        title: "Add a skills section",
        description:
          "Recruiters scan for keywords. A dedicated skills section improves both ATS compatibility and readability.",
        priority: "medium",
        actionable: "Group skills by category: Languages, Frameworks, Tools, etc.",
      },
      {
        id: "r-4",
        title: "Highlight open-source contributions",
        description:
          "Technical roles value community involvement. Add any notable GitHub projects, PRs to popular repos, or package downloads.",
        priority: "low",
        actionable: "Add a Projects section with links to GitHub repositories.",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills to Develop",
    icon: "BookOpen",
    items: [
      {
        id: "s-1",
        title: "GraphQL",
        description:
          "GraphQL appeared as a gap in 2 of your 3 recent analyses. Many modern SaaS products use it, especially with Apollo or URQL.",
        priority: "high",
        actionable:
          "Complete the official GraphQL tutorial and refactor a REST project to use GraphQL.",
      },
      {
        id: "s-2",
        title: "Testing (Jest + Playwright)",
        description:
          "Automated testing skills are rarely highlighted in your resume but are frequently listed in job descriptions.",
        priority: "high",
        actionable:
          "Add tests to an existing project and document the testing strategy.",
      },
      {
        id: "s-3",
        title: "System design fundamentals",
        description:
          "Senior roles often include system design interviews. Strengthening this area will improve your performance in later interview stages.",
        priority: "medium",
        actionable: "Study 'System Design Interview' by Alex Xu and practice on Excalidraw.",
      },
      {
        id: "s-4",
        title: "Edge computing and serverless",
        description:
          "Next.js Edge Runtime, Cloudflare Workers, and Vercel Edge Functions are increasingly common in modern frontend roles.",
        priority: "low",
        actionable: "Build a simple API with Cloudflare Workers or Next.js Route Handlers.",
      },
    ],
  },
  {
    id: "projects",
    title: "Suggested Portfolio Projects",
    icon: "Layers",
    items: [
      {
        id: "p-1",
        title: "Design system with Storybook",
        description:
          "A documented component library demonstrates architectural thinking and attention to consistency — highly valued at product companies.",
        priority: "high",
        actionable:
          "Build a small design system with 10–15 components and publish it on GitHub.",
      },
      {
        id: "p-2",
        title: "Real-time collaboration feature",
        description:
          "Projects using WebSockets, CRDTs, or presence indicators stand out in applications to companies like Figma, Linear, and Notion.",
        priority: "medium",
        actionable: "Add a real-time cursor or chat feature to an existing project.",
      },
      {
        id: "p-3",
        title: "Performance-optimized Next.js app",
        description:
          "Demonstrating a perfect or near-perfect Lighthouse score shows advanced frontend knowledge.",
        priority: "medium",
        actionable: "Create a Next.js project optimized for Core Web Vitals and document the results.",
      },
    ],
  },
  {
    id: "next-steps",
    title: "Actionable Next Steps",
    icon: "CheckSquare",
    items: [
      {
        id: "n-1",
        title: "Follow up on Stripe interview",
        description:
          "Your interview with Stripe is coming up. Prepare by reviewing their engineering blog and public API documentation.",
        priority: "high",
        actionable: "Review Stripe's engineering blog and prepare 3 questions for your interviewer.",
      },
      {
        id: "n-2",
        title: "Respond to Linear offer",
        description:
          "You have a deadline of October 30 to respond to the offer from Linear. Consider negotiating the equity component.",
        priority: "high",
        actionable: "Decide and respond before October 30, 2026.",
      },
      {
        id: "n-3",
        title: "Apply to saved Figma role",
        description:
          "You saved the UI Engineer role at Figma but haven't applied. Update your resume first, then submit.",
        priority: "medium",
        actionable: "Tailor resume to highlight Canvas API or complex rendering work.",
      },
      {
        id: "n-4",
        title: "Expand your professional network",
        description:
          "Referrals significantly increase interview rates. Reach out to connections at companies you're targeting.",
        priority: "low",
        actionable: "Send 3 LinkedIn connection requests per week to engineers at target companies.",
      },
    ],
  },
];

// ─── Sample Resume Data (Demo) ────────────────────────────────────────────────
export const mockResumeData = {
  name: "Alex Johnson",
  title: "Senior Frontend Developer",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexjohnson",
  github: "github.com/alexjohnson",
  summary:
    "Experienced frontend developer with 5+ years building scalable web applications using React, TypeScript, and Next.js. Passionate about performance, accessibility, and clean component architecture.",
  skills: {
    languages: ["JavaScript", "TypeScript", "HTML5", "CSS3", "Python"],
    frameworks: ["React", "Next.js", "Node.js", "Express"],
    tools: ["Git", "Webpack", "Vite", "Docker", "Figma", "Storybook"],
    other: ["REST APIs", "Agile", "CI/CD", "Accessibility (WCAG 2.1)"],
  },
  experience: [
    {
      title: "Senior Frontend Developer",
      company: "Acme Corp",
      location: "San Francisco, CA",
      period: "Jan 2023 – Present",
      bullets: [
        "Lead frontend development of a B2B SaaS dashboard serving 10,000+ users",
        "Reduced page load time by 42% through code splitting and lazy loading",
        "Mentored 2 junior developers and established frontend code review standards",
        "Migrated legacy jQuery codebase to React 18 with zero production downtime",
      ],
    },
    {
      title: "Frontend Developer",
      company: "StartupXYZ",
      location: "Remote",
      period: "Jun 2021 – Dec 2022",
      bullets: [
        "Built responsive marketing pages and e-commerce storefront with Next.js",
        "Implemented CI/CD pipeline using GitHub Actions reducing deploy time by 60%",
        "Improved Lighthouse score from 58 to 94 through asset optimization",
      ],
    },
    {
      title: "Junior Web Developer",
      company: "Digital Agency",
      location: "Portland, OR",
      period: "Aug 2019 – May 2021",
      bullets: [
        "Developed 20+ client websites using HTML, CSS, JavaScript, and WordPress",
        "Collaborated with design team to implement pixel-perfect UI from Figma mockups",
      ],
    },
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      school: "University of Oregon",
      period: "2015–2019",
      notes: "GPA: 3.7 — Dean's List",
    },
  ],
  projects: [
    {
      name: "OpenDash",
      description:
        "Open-source React dashboard component library with 200+ GitHub stars",
      tech: ["React", "TypeScript", "Storybook"],
      url: "github.com/alexjohnson/opendash",
    },
    {
      name: "JobTrackr",
      description: "Personal job application tracker built with Next.js and Supabase",
      tech: ["Next.js", "TypeScript", "Supabase"],
      url: "github.com/alexjohnson/jobtrackr",
    },
  ],
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const mockDashboardStats = {
  totalApplications: mockApplications.length,
  interviews: mockApplications.filter((a) => a.status === "interview").length,
  savedJobs: mockApplications.filter((a) => a.status === "saved").length,
  completedAnalyses: mockAnalysisHistory.length,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  rejected: "Rejected",
  offer: "Offer",
};

export const STATUS_COLORS: Record<string, string> = {
  saved: "bg-slate-100 text-slate-700 border-slate-200",
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  interview: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(dateStr: string, now?: number): string {
  const diff = (now ?? Date.parse(new Date().toISOString())) - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(dateStr);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
