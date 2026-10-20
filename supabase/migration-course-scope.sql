-- ============================================================
-- TACSFON ACADEMIC HUB: COURSE SCOPE MIGRATION
-- Run in the Supabase SQL Editor AFTER schema.sql (and the structure seed, if used).
-- Safe to run more than once.
--
-- What it does:
-- 1. Courses get a scope: general (university-wide), school or department.
-- 2. Adds editable scope rules (course_scope_rules) and seeds the agreed ones.
-- 3. Materials keep the session/semester printed on the paper (exam_session /
--    exam_semester); school, department and access-semester links become optional
--    (a subscription opens the whole library).
-- 4. Merges duplicate courses (same code, e.g. GST 131 under 20 departments) into one
--    record, repointing any materials, then applies the scope rules.
-- Nothing else is deleted.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Course scope columns
-- ------------------------------------------------------------
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'department';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.courses ALTER COLUMN department_id DROP NOT NULL;

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_scope_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_scope_check
  CHECK (scope IN ('general', 'school', 'department'));

-- ------------------------------------------------------------
-- 2. Scope rules
--    match_type 'course' = one exact course code (e.g. CSC 101)
--    match_type 'prefix' = every code with that prefix, optionally up to max_level
--    listed_under_department_ids = departments that list a general course among
--    their own courses (same course, same files; display only)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_scope_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_type TEXT NOT NULL CHECK (match_type IN ('course', 'prefix')),
  pattern TEXT NOT NULL,
  max_level INTEGER CHECK (max_level IN (100, 200, 300, 400, 500)),
  scope TEXT NOT NULL CHECK (scope IN ('general', 'school', 'department')),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  listed_under_department_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (scope <> 'school' OR school_id IS NOT NULL),
  CHECK (scope <> 'department' OR department_id IS NOT NULL OR match_type = 'prefix')
);

CREATE UNIQUE INDEX IF NOT EXISTS course_scope_rules_unique
  ON public.course_scope_rules (match_type, upper(replace(pattern, ' ', '')), coalesce(max_level, 0));

ALTER TABLE public.course_scope_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read course_scope_rules" ON public.course_scope_rules;
CREATE POLICY "Public read course_scope_rules" ON public.course_scope_rules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full course_scope_rules" ON public.course_scope_rules;
CREATE POLICY "Admin full course_scope_rules" ON public.course_scope_rules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 3. Materials: printed session/semester; optional structure links
-- ------------------------------------------------------------
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS exam_session TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS exam_semester TEXT;
ALTER TABLE public.materials ALTER COLUMN school_id DROP NOT NULL;
ALTER TABLE public.materials ALTER COLUMN department_id DROP NOT NULL;
ALTER TABLE public.materials ALTER COLUMN academic_session_id DROP NOT NULL;
ALTER TABLE public.materials ALTER COLUMN semester_id DROP NOT NULL;

UPDATE public.materials m SET exam_session = s.name
  FROM public.academic_sessions s
  WHERE m.exam_session IS NULL AND s.id = m.academic_session_id;

UPDATE public.materials m SET exam_semester = sem.name
  FROM public.semesters sem
  WHERE m.exam_semester IS NULL AND sem.id = m.semester_id;

-- ------------------------------------------------------------
-- 4. Normalize codes ("csc308" / "CSC  308" -> "CSC 308") and merge duplicates
-- ------------------------------------------------------------
UPDATE public.courses
  SET code = upper(regexp_replace(code, '^\s*([A-Za-z]{3})\s*([0-9]{3})\s*$', '\1 \2'))
  WHERE code ~ '^\s*[A-Za-z]{3}\s*[0-9]{3}\s*$'
    AND code <> upper(regexp_replace(code, '^\s*([A-Za-z]{3})\s*([0-9]{3})\s*$', '\1 \2'));

-- Each statement below stands alone (the Supabase SQL Editor commits statement by
-- statement, so no temporary tables are used).
--
-- Duplicate ranking: keep the copy owned by the department whose code matches the
-- prefix (CSC -> Computer Science), otherwise the oldest one.

-- 4a. Point materials at the copy that will be kept
UPDATE public.materials m SET course_id = keep.id
  FROM (
    SELECT c.id, upper(replace(c.code, ' ', '')) AS norm,
           row_number() OVER (
             PARTITION BY upper(replace(c.code, ' ', ''))
             ORDER BY (upper(coalesce(d.code, '')) = upper(regexp_replace(c.code, '[^A-Za-z]', '', 'g'))) DESC,
                      c.created_at, c.id
           ) AS rn
    FROM public.courses c
    LEFT JOIN public.departments d ON d.id = c.department_id
  ) dup
  JOIN (
    SELECT c.id, upper(replace(c.code, ' ', '')) AS norm,
           row_number() OVER (
             PARTITION BY upper(replace(c.code, ' ', ''))
             ORDER BY (upper(coalesce(d.code, '')) = upper(regexp_replace(c.code, '[^A-Za-z]', '', 'g'))) DESC,
                      c.created_at, c.id
           ) AS rn
    FROM public.courses c
    LEFT JOIN public.departments d ON d.id = c.department_id
  ) keep ON keep.norm = dup.norm AND keep.rn = 1
  WHERE m.course_id = dup.id AND dup.rn > 1;

-- 4b. While all copies still exist: a course shared by several departments with no owning
-- department becomes school-wide (all in one school) or general (several schools).
-- Rules below can override this.
UPDATE public.courses c
  SET scope = CASE WHEN s.school_count = 1 THEN 'school' ELSE 'general' END,
      school_id = CASE WHEN s.school_count = 1 THEN s.one_school_id END,
      department_id = NULL
  FROM (
    SELECT
      upper(replace(c2.code, ' ', '')) AS norm,
      count(DISTINCT c2.department_id) AS dept_count,
      count(DISTINCT d.school_id) AS school_count,
      (array_agg(d.school_id))[1] AS one_school_id,
      coalesce(bool_or(upper(d.code) = upper(regexp_replace(c2.code, '[^A-Za-z]', '', 'g'))), false) AS has_owner
    FROM public.courses c2
    LEFT JOIN public.departments d ON d.id = c2.department_id
    GROUP BY 1
  ) s
  WHERE s.norm = upper(replace(c.code, ' ', ''))
    AND s.dept_count > 1 AND NOT s.has_owner
    AND c.scope = 'department';

-- 4c. Remove the extra copies (same ranking as 4a)
DELETE FROM public.courses c
  USING (
    SELECT c.id,
           row_number() OVER (
             PARTITION BY upper(replace(c.code, ' ', ''))
             ORDER BY (upper(coalesce(d.code, '')) = upper(regexp_replace(c.code, '[^A-Za-z]', '', 'g'))) DESC,
                      c.created_at, c.id
           ) AS rn
    FROM public.courses c
    LEFT JOIN public.departments d ON d.id = c.department_id
  ) r
  WHERE c.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS courses_code_normalized_unique
  ON public.courses (upper(replace(code, ' ', '')));

-- ------------------------------------------------------------
-- 5. Seed the agreed rules (skipped if they already exist)
-- ------------------------------------------------------------
INSERT INTO public.course_scope_rules (match_type, pattern, max_level, scope)
SELECT 'prefix', 'GST', NULL, 'general'
WHERE NOT EXISTS (SELECT 1 FROM public.course_scope_rules WHERE match_type = 'prefix' AND upper(pattern) = 'GST' AND max_level IS NULL);

INSERT INTO public.course_scope_rules (match_type, pattern, max_level, scope, listed_under_department_ids)
SELECT 'prefix', 'MTH', 200, 'general',
  coalesce((SELECT array_agg(id) FROM public.departments WHERE lower(name) IN ('industrial mathematics', 'statistics')), '{}')
WHERE NOT EXISTS (SELECT 1 FROM public.course_scope_rules WHERE match_type = 'prefix' AND upper(pattern) = 'MTH' AND max_level = 200);

INSERT INTO public.course_scope_rules (match_type, pattern, max_level, scope, listed_under_department_ids)
SELECT 'prefix', 'ENT', 200, 'general',
  coalesce((SELECT array_agg(id) FROM public.departments WHERE lower(name) IN
    ('accounting', 'business management', 'entrepreneurship', 'project management', 'economics')), '{}')
WHERE NOT EXISTS (SELECT 1 FROM public.course_scope_rules WHERE match_type = 'prefix' AND upper(pattern) = 'ENT' AND max_level = 200);

INSERT INTO public.course_scope_rules (match_type, pattern, scope, school_id)
SELECT 'course', v.code, 'school', s.id
FROM (VALUES ('CSC 101'), ('CSC 102')) AS v(code)
JOIN public.schools s ON lower(s.name) = 'school of computing'
WHERE NOT EXISTS (
  SELECT 1 FROM public.course_scope_rules r
  WHERE r.match_type = 'course' AND upper(replace(r.pattern, ' ', '')) = upper(replace(v.code, ' ', ''))
);

-- ------------------------------------------------------------
-- 6. Apply rules to existing courses (exact course rules win over prefix rules)
-- ------------------------------------------------------------
UPDATE public.courses c
  SET scope = r.scope,
      school_id = CASE WHEN r.scope = 'school' THEN r.school_id END,
      department_id = CASE WHEN r.scope = 'department' THEN coalesce(r.department_id, c.department_id) END
  FROM public.course_scope_rules r
  WHERE r.match_type = 'course'
    AND upper(replace(r.pattern, ' ', '')) = upper(replace(c.code, ' ', ''))
    AND (r.scope <> 'department' OR coalesce(r.department_id, c.department_id) IS NOT NULL);

UPDATE public.courses c
  SET scope = r.scope,
      school_id = CASE WHEN r.scope = 'school' THEN r.school_id END,
      department_id = CASE WHEN r.scope = 'department' THEN c.department_id END
  FROM public.course_scope_rules r
  WHERE r.match_type = 'prefix'
    AND upper(r.pattern) = upper(regexp_replace(c.code, '[^A-Za-z]', '', 'g'))
    AND (r.max_level IS NULL OR c.level <= r.max_level)
    AND (r.scope <> 'department' OR c.department_id IS NOT NULL)
    AND NOT EXISTS (
      SELECT 1 FROM public.course_scope_rules cr
      WHERE cr.match_type = 'course' AND upper(replace(cr.pattern, ' ', '')) = upper(replace(c.code, ' ', ''))
    );

-- Every course now has the owner its scope needs
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_scope_owner_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_scope_owner_check CHECK (
  scope = 'general'
  OR (scope = 'school' AND school_id IS NOT NULL)
  OR (scope = 'department' AND department_id IS NOT NULL)
);

COMMIT;
