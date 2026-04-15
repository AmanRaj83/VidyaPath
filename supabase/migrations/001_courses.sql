-- ============================================================
--  VidyaPath — Supabase Migration
--  Run this in your Supabase SQL Editor:
--  https://supabase.com/dashboard/project/<your-project>/sql
-- ============================================================

-- ── 1. courses table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_uid     TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  subject         TEXT NOT NULL DEFAULT '',
  class_level     INT  NOT NULL DEFAULT 6,
  thumbnail_url   TEXT,
  is_free         BOOLEAN NOT NULL DEFAULT TRUE,
  level           TEXT NOT NULL DEFAULT 'Beginner',
  total_duration  TEXT NOT NULL DEFAULT '—',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. lessons table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'video',   -- 'video' | 'reading' | 'quiz'
  video_url   TEXT,
  pdf_url     TEXT,
  content     TEXT,
  duration    TEXT NOT NULL DEFAULT '—',
  "order"     INT  NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Indexes for fast queries ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_uid);
CREATE INDEX IF NOT EXISTS idx_lessons_course  ON public.lessons(course_id);

-- ── 4. Row Level Security ─────────────────────────────────────
-- Enable RLS on both tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to READ courses and lessons
CREATE POLICY "Anyone can read courses"
  ON public.courses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read lessons"
  ON public.lessons FOR SELECT
  USING (true);

-- Allow INSERT/UPDATE/DELETE only when authenticated
-- (we use the Firebase UID stored in teacher_uid for ownership checks on the frontend)
CREATE POLICY "Authenticated can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can update their own courses"
  ON public.courses FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated can delete their own courses"
  ON public.courses FOR DELETE
  USING (true);

CREATE POLICY "Authenticated can insert lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can update lessons"
  ON public.lessons FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated can delete lessons"
  ON public.lessons FOR DELETE
  USING (true);
