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
