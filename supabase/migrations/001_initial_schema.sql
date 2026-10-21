-- ============================================================
-- CareerPilot AI — Migration 001: Full Secure Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Safe to run on a fresh project. If you ran supabase-schema.sql
-- before, this migration handles the upgrade safely.
-- ============================================================

-- ─── 0. Helpers ──────────────────────────────────────────────────────────────

-- updated_at trigger function (CREATE OR REPLACE = idempotent)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 1. application_status ENUM ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'saved', 'applied', 'interview', 'rejected', 'offer'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2. profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT,
  avatar_url            TEXT,
  preferred_job_titles  TEXT[]    NOT NULL DEFAULT '{}',
  preferred_locations   TEXT[]    NOT NULL DEFAULT '{}',
  preferred_work_mode   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 3. resumes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name        TEXT        NOT NULL,
  storage_path     TEXT        NOT NULL,
  file_size        BIGINT,
  mime_type        TEXT        NOT NULL DEFAULT 'application/pdf',
  extracted_text   TEXT,                         -- nullable; populated by future AI step
  skills           TEXT[]      NOT NULL DEFAULT '{}',
  experience_data  JSONB       NOT NULL DEFAULT '[]',
  education_data   JSONB       NOT NULL DEFAULT '[]',
  projects_data    JSONB       NOT NULL DEFAULT '[]',
  is_default       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS resumes_updated_at ON resumes;
CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON resumes(created_at DESC);

-- ─── 4. job_applications ─────────────────────────────────────────────────────
-- Create fresh if not exists; if it exists, add user_id safely.
CREATE TABLE IF NOT EXISTS job_applications (
  id               UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID               NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title        TEXT               NOT NULL,
  company          TEXT               NOT NULL,
  location         TEXT,
  application_date DATE               NOT NULL DEFAULT CURRENT_DATE,
  status           application_status NOT NULL DEFAULT 'applied',
  job_url          TEXT,
  notes            TEXT,
  salary           TEXT,
  work_mode        TEXT,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- If table existed without user_id, add it (safe)
DO $$ BEGIN
  ALTER TABLE job_applications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- If table existed without work_mode, add it
DO $$ BEGIN
  ALTER TABLE job_applications ADD COLUMN work_mode TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DROP TRIGGER IF EXISTS job_applications_updated_at ON job_applications;
CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx  ON job_applications(status);
CREATE INDEX IF NOT EXISTS job_applications_date_idx    ON job_applications(application_date DESC);

-- Remove old seed data that has no user_id (safe — it has specific UUIDs)
DELETE FROM job_applications WHERE user_id IS NULL;

-- ─── 5. analyses ─────────────────────────────────────────────────────────────
-- Drop and recreate if the old version lacked user_id and required columns.
-- We check for user_id column existence first.
DO $$ BEGIN
  -- Only drop+recreate if user_id column is missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analyses' AND column_name = 'user_id'
  ) THEN
    DROP TABLE IF EXISTS analyses CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS analyses (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id            UUID        REFERENCES resumes(id) ON DELETE SET NULL,
  job_application_id   UUID        REFERENCES job_applications(id) ON DELETE SET NULL,
  job_title            TEXT        NOT NULL,
  company              TEXT,
  job_description      TEXT        NOT NULL DEFAULT '',
  match_score          SMALLINT    CHECK (match_score BETWEEN 0 AND 100),
  matched_skills       TEXT[]      NOT NULL DEFAULT '{}',
  missing_skills       TEXT[]      NOT NULL DEFAULT '{}',
  experience_evidence  TEXT[]      NOT NULL DEFAULT '{}',
  recommendations      JSONB       NOT NULL DEFAULT '[]',
  analysis_status      TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (analysis_status IN ('pending','completed','failed')),
  error_message        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analyses_user_id_idx           ON analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx        ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS analyses_resume_id_idx         ON analyses(resume_id);
CREATE INDEX IF NOT EXISTS analyses_job_application_id_idx ON analyses(job_application_id);

-- ─── 6. Cross-user integrity check ──────────────────────────────────────────
-- Prevent a user linking another user's resume to their analysis.
-- Enforced via RLS insert policy (see below) — no FK across users.

-- ─── 7. Automatic profile creation on signup ─────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;   -- safe to re-run / idempotent
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 8. Row Level Security ───────────────────────────────────────────────────

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles: owner select"  ON profiles;
DROP POLICY IF EXISTS "profiles: owner insert"  ON profiles;
DROP POLICY IF EXISTS "profiles: owner update"  ON profiles;
DROP POLICY IF EXISTS "profiles: owner delete"  ON profiles;
CREATE POLICY "profiles: owner select" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles: owner insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles: owner update" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles: owner delete" ON profiles FOR DELETE USING (id = auth.uid());

-- resumes
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "resumes: owner select"  ON resumes;
DROP POLICY IF EXISTS "resumes: owner insert"  ON resumes;
DROP POLICY IF EXISTS "resumes: owner update"  ON resumes;
DROP POLICY IF EXISTS "resumes: owner delete"  ON resumes;
CREATE POLICY "resumes: owner select" ON resumes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "resumes: owner insert" ON resumes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "resumes: owner update" ON resumes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "resumes: owner delete" ON resumes FOR DELETE USING (user_id = auth.uid());

-- job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "job_applications: owner select"  ON job_applications;
DROP POLICY IF EXISTS "job_applications: owner insert"  ON job_applications;
DROP POLICY IF EXISTS "job_applications: owner update"  ON job_applications;
DROP POLICY IF EXISTS "job_applications: owner delete"  ON job_applications;
CREATE POLICY "job_applications: owner select" ON job_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "job_applications: owner insert" ON job_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "job_applications: owner update" ON job_applications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "job_applications: owner delete" ON job_applications FOR DELETE USING (user_id = auth.uid());

-- analyses (also checks that referenced resume/application belong to same user)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analyses: owner select"  ON analyses;
DROP POLICY IF EXISTS "analyses: owner insert"  ON analyses;
DROP POLICY IF EXISTS "analyses: owner update"  ON analyses;
DROP POLICY IF EXISTS "analyses: owner delete"  ON analyses;
CREATE POLICY "analyses: owner select" ON analyses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "analyses: owner insert" ON analyses FOR INSERT WITH CHECK (
  user_id = auth.uid()
  -- Prevent cross-user resume reference
  AND (resume_id IS NULL OR EXISTS (
    SELECT 1 FROM resumes WHERE id = resume_id AND user_id = auth.uid()
  ))
  -- Prevent cross-user application reference
  AND (job_application_id IS NULL OR EXISTS (
    SELECT 1 FROM job_applications WHERE id = job_application_id AND user_id = auth.uid()
  ))
);
CREATE POLICY "analyses: owner update" ON analyses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "analyses: owner delete" ON analyses FOR DELETE USING (user_id = auth.uid());

-- ─── 9. Storage: resumes bucket ──────────────────────────────────────────────
-- Run this block AFTER creating the bucket in Supabase Dashboard → Storage.
-- Bucket name: resumes  |  Public: NO

-- Storage RLS policies (storage.objects table)
DROP POLICY IF EXISTS "resumes bucket: owner select"  ON storage.objects;
DROP POLICY IF EXISTS "resumes bucket: owner insert"  ON storage.objects;
DROP POLICY IF EXISTS "resumes bucket: owner update"  ON storage.objects;
DROP POLICY IF EXISTS "resumes bucket: owner delete"  ON storage.objects;

CREATE POLICY "resumes bucket: owner select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resumes bucket: owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resumes bucket: owner update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resumes bucket: owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
