-- ============================================================
-- CareerPilot AI — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Application status enum
CREATE TYPE application_status AS ENUM (
  'saved', 'applied', 'interview', 'rejected', 'offer'
);

-- 2. Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title     TEXT NOT NULL,
  company       TEXT NOT NULL,
  location      TEXT,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status        application_status NOT NULL DEFAULT 'applied',
  job_url       TEXT,
  notes         TEXT,
  salary        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title           TEXT NOT NULL,
  company             TEXT NOT NULL,
  match_score         SMALLINT NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  matched_skills      TEXT[] NOT NULL DEFAULT '{}',
  missing_skills      TEXT[] NOT NULL DEFAULT '{}',
  experience_evidence TEXT[] NOT NULL DEFAULT '{}',
  recommendations     TEXT[] NOT NULL DEFAULT '{}',
  resume_used         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Disable RLS for now (no auth yet — Phase 3 will add it)
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;

-- 5. Seed sample data (matches the mock data in the app)
INSERT INTO job_applications (id, job_title, company, location, application_date, status, job_url, notes, salary) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Senior Frontend Developer', 'Stripe',  'San Francisco, CA (Hybrid)', '2026-10-15', 'interview', 'https://stripe.com/jobs',  'Technical screen scheduled for Oct 25. Focus on React and TypeScript.', '$160k–$200k'),
  ('11111111-1111-1111-1111-111111111102', 'React Engineer',           'Vercel',  'Remote',                    '2026-10-12', 'applied',   'https://vercel.com/careers','Applied via LinkedIn. Referral from Jane Doe.', '$140k–$180k'),
  ('11111111-1111-1111-1111-111111111103', 'Software Engineer II',     'Notion',  'San Francisco, CA (Onsite)','2026-10-08', 'rejected',  NULL, 'Automated rejection after 4 days.', NULL),
  ('11111111-1111-1111-1111-111111111104', 'Frontend Engineer',        'Linear',  'Remote',                    '2026-10-05', 'offer',     'https://linear.app/careers','Offer: $150k base + equity. Deadline: Oct 30.', '$150k + equity'),
  ('11111111-1111-1111-1111-111111111105', 'UI Engineer',              'Figma',   'San Francisco, CA (Hybrid)','2026-10-02', 'saved',     'https://figma.com/careers', 'Great role — need to tailor resume.', NULL),
  ('11111111-1111-1111-1111-111111111106', 'Full Stack Developer',     'Loom',    'Remote',                    '2026-09-28', 'applied',   'https://loom.com/careers',  NULL, '$130k–$160k');

INSERT INTO analyses (id, job_title, company, match_score, matched_skills, missing_skills, experience_evidence, recommendations, resume_used) VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    'Senior Frontend Developer', 'Stripe', 82,
    ARRAY['React','TypeScript','JavaScript','CSS','REST APIs','Git','Node.js'],
    ARRAY['GraphQL','Go','Kubernetes'],
    ARRAY['3+ years React matches requirement','TypeScript usage throughout current role','Payment UI experience relevant to Stripe'],
    ARRAY['Add a GraphQL project','Highlight payment or fintech work','Quantify performance improvements','Mention design systems experience'],
    'Alex_Johnson_Resume_v3.pdf'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'React Engineer', 'Vercel', 76,
    ARRAY['React','Next.js','TypeScript','JavaScript','Vercel deployment','CSS','Git'],
    ARRAY['Rust','WebAssembly','Edge Functions'],
    ARRAY['Next.js experience directly relevant','CI/CD with Vercel platform','Open-source contributions match culture'],
    ARRAY['Highlight Next.js App Router usage','Add edge computing experience','Emphasize open-source contributions','Mention Core Web Vitals optimization'],
    'Alex_Johnson_Resume_v3.pdf'
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'UI Engineer', 'Figma', 69,
    ARRAY['React','TypeScript','CSS','JavaScript','Accessibility'],
    ARRAY['Canvas API','WebGL','C++','Design systems (documented)'],
    ARRAY['Complex UI experience matches Figma','Accessibility work in current role'],
    ARRAY['Build a Canvas API demo','Document design systems work','Add accessibility metrics','Contribute to a Figma plugin'],
    'Alex_Johnson_Resume_v2.pdf'
  );
