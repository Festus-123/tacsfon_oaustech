-- ============================================================
-- TACSFON (OAUSTECH) SUPABASE SCHEMA & STORAGE CONFIGURATION
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  image_url TEXT,
  external_url TEXT,
  category TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering & filtering
CREATE INDEX IF NOT EXISTS events_date_published_idx ON public.events (event_date DESC, published);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (public) can view published events
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events"
  ON public.events
  FOR SELECT
  USING (published = true);

-- Policy 2: Authenticated administrators have full access to all events
DROP POLICY IF EXISTS "Authenticated users full access" ON public.events;
CREATE POLICY "Authenticated users full access"
  ON public.events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Storage Bucket Setup: event_bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event_bucket', 'event_bucket', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can view public event flyers
DROP POLICY IF EXISTS "Public can read event_bucket" ON storage.objects;
CREATE POLICY "Public can read event_bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event_bucket');

-- Storage Policy: Authenticated users can upload event flyers
DROP POLICY IF EXISTS "Authenticated users upload event_bucket" ON storage.objects;
CREATE POLICY "Authenticated users upload event_bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event_bucket');

-- Storage Policy: Authenticated users can update/delete event flyers
DROP POLICY IF EXISTS "Authenticated users manage event_bucket" ON storage.objects;
CREATE POLICY "Authenticated users manage event_bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'event_bucket')
  WITH CHECK (bucket_id = 'event_bucket');

-- 5. Initial Seed Events (from provided official flyers)
INSERT INTO public.events (title, description, event_date, event_time, location, image_url, category, published)
VALUES
  (
    'Worship With Us This Sunday',
    'Join the TACSFON family for a transformative atmosphere of passionate praise, reverent worship, and life-changing biblical exposition. Come along with your friends and coursemates!',
    CURRENT_DATE + INTERVAL '5 days',
    'Sunday School @ 8:00 AM | Main Service @ 9:00 AM',
    'TACSFON Center, Methodist Primary School Classroom, Igodan, Okitipupa',
    '/assets/sunday-service.jpg',
    'Sunday Service',
    true
  ),
  (
    'Friday Campus Prayer Meeting',
    'A charged atmosphere of intercession, petition, and spiritual refreshing. We are gathering across centers to stand in prayer for our university, families, and academic success.',
    CURRENT_DATE + INTERVAL '3 days',
    '5:30 PM Prompt',
    'TACSFON Worship Center (Igodan) & Mega Campus (500lvl Mech Hall)',
    '/assets/prayer-meeting.jpg',
    'Prayer',
    true
  ),
  (
    'Rooted in the Word — Tuesday Bible Study',
    'A foundational study session breaking down biblical truths, verse by verse. Open for questions, practical student applications, and spiritual discipleship.',
    CURRENT_DATE + INTERVAL '7 days',
    '5:30 PM Prompt',
    'TACSFON Fellowship Center, Igodan',
    '/assets/bible study.jpg',
    'Bible Study',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. PROGRAMME PAYMENT / REGISTRATION SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_name TEXT NOT NULL,
  programme_date TEXT NOT NULL,
  description TEXT,
  amount_per_person NUMERIC(10, 2) NOT NULL CHECK (amount_per_person >= 0),
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  payment_instructions TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS payment_requests_status_idx ON public.payment_requests (status, expires_at);

CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id UUID NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  total_people INTEGER NOT NULL CHECK (total_people > 0),
  amount_per_person_snapshot NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_submissions_request_idx ON public.payment_submissions (payment_request_id);

CREATE TABLE IF NOT EXISTS public.payment_submission_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.payment_submissions(id) ON DELETE CASCADE,
  payment_request_id UUID NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_submission_people_request_idx ON public.payment_submission_people (payment_request_id, created_at DESC);

-- RLS for Payment Tables
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submission_people ENABLE ROW LEVEL SECURITY;

-- Public can view payment requests (active or to show closed/expired status)
DROP POLICY IF EXISTS "Public can view payment requests" ON public.payment_requests;
CREATE POLICY "Public can view payment requests"
  ON public.payment_requests
  FOR SELECT
  USING (true);

-- Authenticated admins full access to payment requests
DROP POLICY IF EXISTS "Admin full access to payment requests" ON public.payment_requests;
CREATE POLICY "Admin full access to payment requests"
  ON public.payment_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anyone can insert payment submissions
DROP POLICY IF EXISTS "Public can insert submissions" ON public.payment_submissions;
CREATE POLICY "Public can insert submissions"
  ON public.payment_submissions
  FOR INSERT
  WITH CHECK (true);

-- Authenticated admins can view/delete submissions
DROP POLICY IF EXISTS "Admin full access to submissions" ON public.payment_submissions;
CREATE POLICY "Admin full access to submissions"
  ON public.payment_submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can view only names for payment requests
DROP POLICY IF EXISTS "Public can view registered names" ON public.payment_submission_people;
CREATE POLICY "Public can view registered names"
  ON public.payment_submission_people
  FOR SELECT
  USING (true);

-- Anyone can insert people during submission
DROP POLICY IF EXISTS "Public can insert submission people" ON public.payment_submission_people;
CREATE POLICY "Public can insert submission people"
  ON public.payment_submission_people
  FOR INSERT
  WITH CHECK (true);

-- Authenticated admins full access to submission people
DROP POLICY IF EXISTS "Admin full access to submission people" ON public.payment_submission_people;
CREATE POLICY "Admin full access to submission people"
  ON public.payment_submission_people
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 7. ACADEMIC HUB TABLES & STORAGE
-- ============================================================

-- Academic Sessions (e.g., '2024/2025', '2025/2026')
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Semesters (e.g., 'First Semester', 'Second Semester')
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date > start_date),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'EXPIRED')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schools (Faculties)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (100, 200, 300, 400, 500)),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Material Types
CREATE TABLE IF NOT EXISTS public.material_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Materials (Protected metadata)
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  material_type_id UUID NOT NULL REFERENCES public.material_types(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  department_id UUID NOT NULL REFERENCES public.departments(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  level INTEGER NOT NULL,
  academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id),
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  page_count INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Paystack Payments for Academic Hub
CREATE TABLE IF NOT EXISTS public.academic_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  paystack_reference TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'ABANDONED')),
  paid_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Entitlements
CREATE TABLE IF NOT EXISTS public.academic_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  payment_reference TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academic_entitlements_lookup_idx ON public.academic_entitlements (user_email, semester_id, status);

-- Demo Materials (Public samples)
CREATE TABLE IF NOT EXISTS public.demo_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'pdf', 'image')),
  file_url TEXT NOT NULL,
  description TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Private Bucket for Academic Materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-materials', 'academic-materials', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Academic Hub Tables
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_materials ENABLE ROW LEVEL SECURITY;

-- Public can read active structure, material types, semesters, demo materials
CREATE POLICY "Public read academic_sessions" ON public.academic_sessions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Public read schools" ON public.schools FOR SELECT USING (is_active = true);
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (is_active = true);
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public read material_types" ON public.material_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public read demo_materials" ON public.demo_materials FOR SELECT USING (is_visible = true);

-- Public can read published materials metadata
CREATE POLICY "Public read published materials" ON public.materials FOR SELECT USING (is_published = true);

-- Admin has full access to academic tables
CREATE POLICY "Admin full academic_sessions" ON public.academic_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full semesters" ON public.semesters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full schools" ON public.schools FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full departments" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full courses" ON public.courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full material_types" ON public.material_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full materials" ON public.materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full academic_payments" ON public.academic_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full academic_entitlements" ON public.academic_entitlements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full demo_materials" ON public.demo_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Initial Material Types Seed (No Tutorials category!)
INSERT INTO public.material_types (name, slug, description)
VALUES
  ('Past Questions', 'past_questions', 'Past examination questions organized by level and course.'),
  ('Manuals & Lecture Notes', 'manuals', 'Official practical manuals, comprehensive lecture notes, and study guides.'),
  ('Workbooks', 'workbooks', 'Structured worksheets, exercises, and problem sets.'),
  ('Materials', 'materials', 'Supplementary reading materials, reference slides, and textbooks.')
ON CONFLICT (slug) DO NOTHING;
