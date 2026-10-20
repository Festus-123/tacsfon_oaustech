-- ============================================================
-- TACSFON ACADEMIC HUB: SCHOOLS, DEPARTMENTS & COURSES SEED
-- Source: 'CSC CCMAS OAUSTECH CURRICULUM' (Computer Science 100-400L)
--         'Nnamdi CCMAS Complete Courses for 100L-200L' (all other programmes)
-- Safe to run more than once: existing rows (matched by name/code) are skipped.
-- Run in the Supabase SQL Editor.
-- ============================================================

BEGIN;

-- 1. Schools / Faculties
INSERT INTO public.schools (name, code) SELECT 'School of Computing', 'computing' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Computing') OR code = 'computing');
INSERT INTO public.schools (name, code) SELECT 'School of Science', 'science' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Science') OR code = 'science');
INSERT INTO public.schools (name, code) SELECT 'School of Earth Science', 'earth-science' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Earth Science') OR code = 'earth-science');
INSERT INTO public.schools (name, code) SELECT 'School of Nursing and Allied Health Science', 'nursing-allied-health' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Nursing and Allied Health Science') OR code = 'nursing-allied-health');
INSERT INTO public.schools (name, code) SELECT 'School of Agriculture, Food and Natural Science', 'agriculture-food-natural-science' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Agriculture, Food and Natural Science') OR code = 'agriculture-food-natural-science');
INSERT INTO public.schools (name, code) SELECT 'School of Engineering and Engineering Technology', 'engineering' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Engineering and Engineering Technology') OR code = 'engineering');
INSERT INTO public.schools (name, code) SELECT 'School of Management Science', 'management-science' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Management Science') OR code = 'management-science');
INSERT INTO public.schools (name, code) SELECT 'School of Applied Geography', 'applied-geography' WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE lower(name) = lower('School of Applied Geography') OR code = 'applied-geography');

-- 2. Departments
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Public Health Science', 'PHS' FROM public.schools s WHERE lower(s.name) = lower('School of Nursing and Allied Health Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Public Health Science'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Medical Laboratory Science', 'MLS' FROM public.schools s WHERE lower(s.name) = lower('School of Nursing and Allied Health Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Medical Laboratory Science'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Economics', 'ECO' FROM public.schools s WHERE lower(s.name) = lower('School of Management Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Economics'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Public Administration', 'PAD' FROM public.schools s WHERE lower(s.name) = lower('School of Management Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Public Administration'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Chemical Engineering', 'CHE' FROM public.schools s WHERE lower(s.name) = lower('School of Engineering and Engineering Technology') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Chemical Engineering'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Petroleum and Gas Engineering', 'PGE' FROM public.schools s WHERE lower(s.name) = lower('School of Engineering and Engineering Technology') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Petroleum and Gas Engineering'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Industrial Chemistry', 'ICH' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Industrial Chemistry'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Biochemistry', 'BCH' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Biochemistry'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Botany', 'BOT' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Botany'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Microbiology', 'MCB' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Microbiology'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Zoology', 'ZOO' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Zoology'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Physics', 'PHY' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Physics'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Industrial Mathematics', 'IMT' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Industrial Mathematics'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Statistics', 'STA' FROM public.schools s WHERE lower(s.name) = lower('School of Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Statistics'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Computer Science', 'CSC' FROM public.schools s WHERE lower(s.name) = lower('School of Computing') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Computer Science'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Geophysics', 'GPY' FROM public.schools s WHERE lower(s.name) = lower('School of Earth Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Geophysics'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Geology', 'GLY' FROM public.schools s WHERE lower(s.name) = lower('School of Earth Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Geology'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Nursing Science', 'NSC' FROM public.schools s WHERE lower(s.name) = lower('School of Nursing and Allied Health Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Nursing Science'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Agricultural Economics and Extension', 'AEE' FROM public.schools s WHERE lower(s.name) = lower('School of Agriculture, Food and Natural Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Agricultural Economics and Extension'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Animal Production and Health', 'APH' FROM public.schools s WHERE lower(s.name) = lower('School of Agriculture, Food and Natural Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Animal Production and Health'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Crop, Soil and Pest Management', 'CSP' FROM public.schools s WHERE lower(s.name) = lower('School of Agriculture, Food and Natural Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Crop, Soil and Pest Management'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Food Science and Technology', 'FST' FROM public.schools s WHERE lower(s.name) = lower('School of Agriculture, Food and Natural Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Food Science and Technology'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Fisheries and Aquaculture', 'FAQ' FROM public.schools s WHERE lower(s.name) = lower('School of Agriculture, Food and Natural Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Fisheries and Aquaculture'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Forest Resources and Wildlife Management', 'FWM' FROM public.schools s WHERE lower(s.name) = lower('School of Agriculture, Food and Natural Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Forest Resources and Wildlife Management'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Civil Engineering', 'CVE' FROM public.schools s WHERE lower(s.name) = lower('School of Engineering and Engineering Technology') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Civil Engineering'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Electrical and Electronic Engineering', 'EEE' FROM public.schools s WHERE lower(s.name) = lower('School of Engineering and Engineering Technology') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Electrical and Electronic Engineering'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Mechanical Engineering', 'MEE' FROM public.schools s WHERE lower(s.name) = lower('School of Engineering and Engineering Technology') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Mechanical Engineering'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Accounting', 'ACC' FROM public.schools s WHERE lower(s.name) = lower('School of Management Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Accounting'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Business Management', 'BUS' FROM public.schools s WHERE lower(s.name) = lower('School of Management Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Business Management'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Entrepreneurship', 'ENT' FROM public.schools s WHERE lower(s.name) = lower('School of Management Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Entrepreneurship'));
INSERT INTO public.departments (school_id, name, code) SELECT s.id, 'Project Management', 'PMT' FROM public.schools s WHERE lower(s.name) = lower('School of Management Science') AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.school_id = s.id AND lower(d.name) = lower('Project Management'));

-- 3. Courses (a shared course such as GST 131 is listed under each department that takes it)
-- Public Health Science (36 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('GST 131', 'Communication in English', 100),
  ('MTH 131', 'Elementary Mathematics I', 100),
  ('COS 101', 'Introduction to Computing Sciences', 100),
  ('BIO 101', 'General Biology I', 100),
  ('BIO 107', 'General Biology Practical I', 100),
  ('CHM 101', 'General Chemistry I', 100),
  ('CHM 107', 'General Chemistry Practical I', 100),
  ('PHY 101', 'General Physics I', 100),
  ('PHY 117', 'General Physics Practical I', 100),
  ('GST 112', 'Nigerian Peoples and Culture', 100),
  ('BIO 102', 'General Biology II', 100),
  ('BIO 108', 'General Biology Practical II', 100),
  ('CHM 102', 'General Chemistry II', 100),
  ('CHM 108', 'General Chemistry Practical II', 100),
  ('PHY 102', 'General Physics II', 100),
  ('PHY 118', 'General Physics Practical II', 100),
  ('MTH 132', 'Elementary Mathematics II', 100),
  ('STA 112', 'Probability I', 100),
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('MCB 201', 'General Microbiology', 200),
  ('ANA 201', 'Anatomy of Upper and Lower Limbs', 200),
  ('BCH 201', 'General Biochemistry I', 200),
  ('PIO 201', 'Introductory Physiology and Blood', 200),
  ('PHS 201', 'Introduction to Public Health', 200),
  ('PHS 203', 'Principles of Epidemiology (infectious disease epidemiology and Immunisation techniques)', 200),
  ('PHS 211', 'History and Evolution of Public Health', 200),
  ('PHS 213', 'Health Anthropology and Sociology', 200),
  ('PHS 299', 'Fieldwork I/SIWES (Community Diagnosis)', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('PHS 202', 'Biostatistics', 200),
  ('PHS 204', 'Demography and Social Statistics in Public Health', 200),
  ('PHS 208', 'Health Communication and Instructional Design', 200),
  ('PHS 206', 'Introduction to Health Informatics', 200),
  ('PHS 210', 'Psychological Foundations of Health, Development, Behaviour, & Change process', 200),
  ('PHS 212', 'Introduction to Primary Health Care', 200),
  ('PHS 216', 'Developmental Psychology', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Public Health Science')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Nursing and Allied Health Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Medical Laboratory Science (37 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('GST 131', 'Communication in English', 100),
  ('MTH 131', 'Elementary Mathematics I', 100),
  ('COS 101', 'Introduction to Computing Sciences', 100),
  ('BIO 101', 'General Biology I', 100),
  ('BIO 107', 'General Biology Practical I', 100),
  ('CHM 101', 'General Chemistry I', 100),
  ('CHM 107', 'General Chemistry Practical I', 100),
  ('PHY 101', 'General Physics I', 100),
  ('PHY 117', 'General Physics Practical I', 100),
  ('GST 112', 'Nigerian Peoples and Culture', 100),
  ('BIO 102', 'General Biology II', 100),
  ('BIO 108', 'General Biology Practical II', 100),
  ('CHM 102', 'General Chemistry II', 100),
  ('CHM 108', 'General Chemistry Practical II', 100),
  ('PHY 102', 'General Physics II', 100),
  ('PHY 118', 'General Physics Practical II', 100),
  ('MTH 132', 'Elementary Mathematics II', 100),
  ('STA 112', 'Probability I', 100),
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('ANA 203', 'General and Systemic Embryology', 200),
  ('BCH 201', 'General Biochemistry I', 200),
  ('BCH 203', 'General Biochemistry Practical', 200),
  ('MCB 201', 'General Microbiology', 200),
  ('MLS 201', 'Introduction to Medical Laboratory Science I', 200),
  ('PIO 201', 'Introductory Physiology and Blood', 200),
  ('PIO 203', 'Physiology of Excitable Tissues', 200),
  ('ANA 201', 'Anatomy of Upper and Lower Limb', 200),
  ('STA 201', 'Statistics for Agriculture & Biological Sciences', 200),
  ('ANA 205', 'Neuroscience', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('ANA 202', 'Histology of Basic Tissues', 200),
  ('BCH 202', 'General Biochemistry II', 200),
  ('PIO 214', 'Introduction to Cardiovascular and Respiratory Physiology', 200),
  ('PIO 216', 'Gastrointestinal Physiology', 200),
  ('ANA 204', 'Anatomy of Thorax, Abdomen, Pelvis & Perineum', 200),
  ('MLS 204', 'Endocrinology and Reproductive Physiology', 200),
  ('MLS 202', 'Introduction to Medical Laboratory Science II', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Medical Laboratory Science')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Nursing and Allied Health Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Economics (28 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('GST 111', 'Communication Skills in English', 100),
  ('ECO 101', 'Principles of Economics I', 100),
  ('ECO 103', 'Introductory Mathematics I', 100),
  ('ECO 105', 'Economic History of Nigeria', 100),
  ('ACC 111', 'Introduction to Financial Accounting I', 100),
  ('ECO 109', 'Introduction to Finance', 100),
  ('GST 112', 'Nigerian Peoples and Culture', 100),
  ('ECO 102', 'Principles of Economics ll', 100),
  ('ECO 104', 'Introductory Mathematics ll', 100),
  ('ACC 112', 'Introduction to Financial Accounting II', 100),
  ('ECO 108', 'Introduction to Coastal Economics', 100),
  ('ECO 112', 'Introduction to Business', 100),
  ('ENT 211', 'Entrepreneurship and Innovation 2', 200),
  ('ECO 201', 'Introduction to Microeconomics I', 200),
  ('ECO 203', 'Introduction to Macroeconomics I', 200),
  ('ECO 205', 'Structure of the Nigerian Economy', 200),
  ('ECO 207', 'Mathematics for Economists', 200),
  ('ECO 209', 'Agriculture and Nigeria Economy', 200),
  ('ECO 211', 'Money and Banking', 200),
  ('ECO 213', 'Health Economics', 200),
  ('SSC 202', 'Introduction to Computer and its Application', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('ECO 202', 'Introduction to Microeconomics ll', 200),
  ('ECO 204', 'Introduction to Macroeconomics ll', 200),
  ('ECO 206', 'Statistics for Economists', 200),
  ('ECO 208', 'Managerial Economics', 200),
  ('ECO 210', 'Introduction to Public Finance', 200),
  ('ACC 204', 'Cost Accounting', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Economics')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Management Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Public Administration (32 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('GST 111', 'Communication in English', 100),
  ('AMS 101', 'Principles of Management', 100),
  ('AMS 103', 'Introduction to Computer', 100),
  ('PAD 101', 'Elements of Public Administration', 100),
  ('PAD 103', 'Individual groups and Society', 100),
  ('ECO 101', 'Principles of Economics I', 100),
  ('ACC 111', 'Introduction to financial Accounting I', 100),
  ('GST 112', 'Nigerian Peoples and Culture', 100),
  ('AMS 102', 'Basic Mathematics', 100),
  ('AMS 104', 'Principles of Project Management', 100),
  ('PAD 102', 'Element of Government', 100),
  ('PAD 106', 'Citizenship and State', 100),
  ('ECO 102', 'Principles of Economics II', 100),
  ('ACC 112', 'Introduction to financial Accounting II', 100),
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('PAD 201', 'Introduction to Public Administration', 200),
  ('PAD 205', 'Office Administration', 200),
  ('PAD 211', 'Rural and Community Development', 200),
  ('PAD 203', 'Descriptive Statistics for Public Administration', 200),
  ('PAD 209', 'Economics and Social Development', 200),
  ('PAD 213', 'Civil Society Organization', 200),
  ('PAD 207', 'Introduction to International Relations', 200),
  ('ECO 201', 'Introduction to Microeconomics I', 200),
  ('GST 212', 'Philosophy, Logic, and Human Existence', 200),
  ('PAD 202', 'Nigerian Government & Administration', 200),
  ('PAD 204', 'Introduction to Political Science', 200),
  ('PAD 206', 'Inferential Statistics for Public Administration', 200),
  ('PAD 208', 'Introduction to Local Government Administration and Management', 200),
  ('ACC 204', 'Cost Accounting', 200),
  ('ECO 204', 'Introduction to Macroeconomics II', 200),
  ('PAD 210', 'Issues in Development', 200),
  ('PAD 212', 'Entrepreneurship Development', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Public Administration')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Management Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Chemical Engineering (35 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('GST 111', 'Communication in English', 100),
  ('GET 101', 'Engineer in Society', 100),
  ('CHM 101', 'General Chemistry I', 100),
  ('CHM 107', 'General Practical Chemistry I', 100),
  ('MTH 101', 'Elementary Mathematics I', 100),
  ('PHY 101', 'General Physics I', 100),
  ('PHY 107', 'General Practical Physics I', 100),
  ('TCH 101', 'Introduction to Chemical Engineering', 100),
  ('MTH 103', 'Elementary Mathematics III', 100),
  ('PHY 103', 'General Physic III', 100),
  ('COS 101', 'Introduction to Computing Sciences', 100),
  ('GST 112', 'Nigerian People and Culture', 100),
  ('GET 102', 'Engineering Graphics and Solid Modelling I', 100),
  ('CHM 102', 'General Chemistry II', 100),
  ('CHM 108', 'General Practical Chemistry II', 100),
  ('MTH 102', 'Elementary Mathematics II', 100),
  ('PHY 102', 'General Physics II', 100),
  ('PHY 108', 'General Practical Physics II', 100),
  ('PHY 104', 'General Physic IV', 100),
  ('STA 112', 'Probability I', 100),
  ('GET 104', 'Introduction to Workshop practice', 100),
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('GET 205', 'Fundamentals of Fluid Mechanics', 200),
  ('GET 209', 'Engineering Mathematics I', 200),
  ('GET 211', 'Computing and Software Engineering', 200),
  ('TCH 201', 'Chemical Engineering Fundamentals', 200),
  ('GET 201', 'Applied Electricity I', 200),
  ('GET 207', 'Applied Mechanics', 200),
  ('TCH 207', 'Engineering Chemistry 1 (Physical Chemistry)', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('GET 204', 'Students'' Workshop Practice', 200),
  ('GET 206', 'Fundamentals of Thermodynamics', 200),
  ('GET 210', 'Engineering Mathematics II', 200),
  ('TCH 202', 'Material Science', 200),
  ('TCH 206', 'Statistics for Chemical Engineers', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Chemical Engineering')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Engineering and Engineering Technology')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Petroleum and Gas Engineering (34 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('GST 111', 'Communication in English', 100),
  ('GET 101', 'Engineer in Society', 100),
  ('CHM 101', 'General Chemistry I', 100),
  ('CHM 107', 'General Practical Chemistry I', 100),
  ('MTH 101', 'Elementary Mathematics I', 100),
  ('PHY 101', 'General Physics I', 100),
  ('PHY 107', 'General Practical Physics I', 100),
  ('TCH 101', 'Introduction to Chemical Engineering', 100),
  ('MTH 103', 'Elementary Mathematics III', 100),
  ('PHY 103', 'General Physic III', 100),
  ('COS 101', 'Introduction to Computing Sciences', 100),
  ('GST 112', 'Nigerian People and Culture', 100),
  ('GET 102', 'Engineering Graphics and Solid Modelling I', 100),
  ('CHM 102', 'General Chemistry II', 100),
  ('CHM 108', 'General Practical Chemistry II', 100),
  ('MTH 102', 'Elementary Mathematics II', 100),
  ('PHY 102', 'General Physics II', 100),
  ('PHY 108', 'General Practical Physics II', 100),
  ('PHY 104', 'General Physic IV', 100),
  ('STA 112', 'Probability I', 100),
  ('GET 104', 'Introduction to Workshop practice', 100),
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('GET 201', 'Applied Electricity I', 200),
  ('GET 205', 'Fundamentals of Fluid Mechanics', 200),
  ('GET 209', 'Engineering Mathematics I', 200),
  ('GET 211', 'Computing and Software Engineering', 200),
  ('GET 207', 'Applied Mechanics', 200),
  ('PGE 201', 'Petroleum Geology', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('GET 202', 'Engineering Materials', 200),
  ('GET 204', 'Students'' Workshop Practice', 200),
  ('GET 206', 'Fundamentals of Thermodynamics', 200),
  ('GET 210', 'Engineering Mathematics II', 200),
  ('GET 208', 'Strength of Materials', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Petroleum and Gas Engineering')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Engineering and Engineering Technology')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Industrial Chemistry (16 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('CHM 211', 'Organic Chemistry I', 200),
  ('CHM 207', 'General Practical Chemistry 1', 200),
  ('ICH 213', 'Analytical Chemistry I', 200),
  ('ICH 251', 'Process Science I', 200),
  ('COS 201', 'Computer programming I', 200),
  ('ICH 227', 'Industrial Raw Materials resource Inventory', 200),
  ('ICH 275', 'Experimental Chemistry 1', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('CHM 210', 'Physical Chemistry I', 200),
  ('CHM 212', 'Inorganic Chemistry I', 200),
  ('CHM 208', 'General Practical Chemistry 11', 200),
  ('ICH 252', 'Process Science II', 200),
  ('ICH 226', 'Introductory Material Science', 200),
  ('ICH 228', 'Analytical Chemistry II', 200),
  ('STA 202', 'Statistics for Physical Sciences and Engineering', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Industrial Chemistry')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Biochemistry (16 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('BCH 201', 'General Biochemistry I', 200),
  ('BCH 203', 'General Biochemistry Practical', 200),
  ('STA 201', 'Statistics for Agriculture & Biological Sciences', 200),
  ('MCB 221', 'General Microbiology I', 200),
  ('MCB 231', 'Basic Techniques In Microbiology', 200),
  ('CHM 211', 'Organic Chemistry I', 200),
  ('COS 201', 'Computer programming I', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('BCH 202', 'General Biochemistry II', 200),
  ('BCH 206', 'Food and Nutritional Biochemistry', 200),
  ('BCH 212', 'General Biochemistry Practical II', 200),
  ('BIO 204', 'Biological Techniques', 200),
  ('CHM 210', 'Physical Chemistry I', 200),
  ('CHM 212', 'Inorganic Chemistry I', 200),
  ('BOT 202', 'Seedless plants', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Biochemistry')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Botany (16 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('BIO 201', 'Genetics 1', 200),
  ('BIO 203', 'General Physiology', 200),
  ('BIO 205', 'Introductory Developmental/Cell Biology', 200),
  ('BOT 203', 'Seed Plants', 200),
  ('MCB 221', 'General Microbiology', 200),
  ('ZOO 211', 'Invertebrate Zoology I', 200),
  ('STA 201', 'Statistics for Agricultural and Biological Sciences', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('BIO 204', 'Biological Techniques', 200),
  ('BOT 202', 'Seedless Plants', 200),
  ('BOT 204', 'Introductory Ethnobotany', 200),
  ('BOT 206', 'Afforestation', 200),
  ('ZOO 202', 'Chordate Zoology', 200),
  ('BIO 202', 'Introductory Ecology', 200),
  ('BIO 206', 'Statistics for Biological Sciences', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Botany')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Microbiology (16 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('MCB 221', 'General Microbiology', 200),
  ('MCB 231', 'Basic Techniques in Microbiology', 200),
  ('BIO 211', 'Genetics I', 200),
  ('BIO 205', 'Introductory Developmental Cell Biology', 200),
  ('BCH 201', 'General Biochemistry I', 200),
  ('CHM 211', 'Organic Chemistry I', 200),
  ('CHM 213', 'Analytical Chemistry', 200),
  ('STA 201', 'Statistics for Agricultural and Biological Sciences', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('BCH 202', 'General Biochemistry II', 200),
  ('ZOO 202', 'Chordate Zoology', 200),
  ('BOT 204', 'Introductory Ethnobotany', 200),
  ('MCB 212', 'Microbial Biotechnology', 200),
  ('MCB 214', 'Aquatic Microbiology', 200),
  ('MCB 216', 'Nutraceuticals', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Microbiology')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Zoology (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('BIO 201', 'Genetics I', 200),
  ('BIO 203', 'General Physiology', 200),
  ('STA 201', 'Statistics for Agricultural & Biological Sciences', 200),
  ('ZOO 211', 'Invertebrate Zoology I', 200),
  ('BIO 205', 'Introductory Developmental Cell Biology', 200),
  ('ZOO 207', 'Introductory Ecology', 200),
  ('BOT 203', 'Seed Plants', 200),
  ('MCB 221', 'General Microbiology', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('ZOO 212', 'Invertebrate Zoology II', 200),
  ('ZOO 202', 'Chordate Zoology', 200),
  ('BIO 204', 'Biological Techniques', 200),
  ('ZOO 204', 'Animal Behaviors and Strategies I', 200),
  ('ZOO 208', 'Basic Entomology', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Zoology')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Physics (16 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('PHY 201', 'General Physics V (Modern Physics)', 200),
  ('PHY 205', 'Thermal Physics', 200),
  ('PHY 207', 'General Practical Physics III', 200),
  ('PHY 211', 'Workshop Practice', 200),
  ('PHY 213', 'Materials Science', 200),
  ('MTH 201', 'Mathematical Methods I', 200),
  ('COS 201', 'Computer Programming I', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('PHY 202', 'Introduction to Electric Circuits & Electronics', 200),
  ('PHY 204', 'General Physics VI (Waves and Optics)', 200),
  ('PHY 206', 'General Physics VII (Energy & Environment)', 200),
  ('PHY 208', 'General Practical Physics IV', 200),
  ('MTH 202', 'Elementary Differential Equation', 200),
  ('PHY 210', 'Intro. to Astronomy and Astrophysics', 200),
  ('STA 202', 'Statistics for Physical Sciences & Engineering', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Physics')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Industrial Mathematics (17 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('COS 201', 'Computer Programming I', 200),
  ('MTH 201', 'Mathematical Methods I', 200),
  ('MTH 203', 'Sets, Logics and Algebra', 200),
  ('MTH 205', 'Linear Algebra II', 200),
  ('MTH 207', 'Real Analysis', 200),
  ('MTH 209', 'Introduction to Numerical Analysis', 200),
  ('STA 221', 'Statistical Inference II', 200),
  ('MTH 213', 'Vectorial Mechanics', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('MTH 202', 'Elementary Differential Equations', 200),
  ('MTH 204', 'Linear Algebra I', 200),
  ('IMT 206', 'Abstract Algebra', 200),
  ('MTH 210', 'Vector Analysis I', 200),
  ('COS 202', 'Computer Programming II', 200),
  ('MTH 214', 'Complex Analysis I', 200),
  ('MTH 216', 'Mathematical Methods II', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Industrial Mathematics')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Statistics (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('STA 211', 'Probability II', 200),
  ('STA 221', 'Statistical Inference II', 200),
  ('STA 231', 'Statistical Computing II', 200),
  ('STA 299', 'Industrial Attachment I (12 Weeks)', 200),
  ('COS 201', 'Computer Programming I', 200),
  ('MTH 201', 'Mathematical Methods I', 200),
  ('MTH 203', 'Sets, Logics and Algebra', 200),
  ('MTH 209', 'Introduction to Numerical Analysis', 200),
  ('GST 212', 'Philosophy, Logic, and Human Existence', 200),
  ('STA 202', 'Statistics for Physical Sciences & Engineering', 200),
  ('STA 212', 'Introduction to Social & Economic Statistics', 200),
  ('COS 202', 'Computer Programming II', 200),
  ('MTH 214', 'Complex Analysis I', 200),
  ('MTH 216', 'Mathematical Method II', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Statistics')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Computer Science (63 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('MTH 201', 'Mathematical Methods I', 200),
  ('COS 201', 'Computer Programming I', 200),
  ('CSC 203', 'Discrete Structures', 200),
  ('CSC 299', 'SIWES I', 200),
  ('IFT 211', 'Digital Logic Design', 200),
  ('SEN 201', 'Introduction to Software Engineering', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('MTH 202', 'Elementary Differential Equations', 200),
  ('COS 202', 'Computer Programming II', 200),
  ('IFT 212', 'Computer Architecture and Organization', 200),
  ('CSC 202', 'Computer Programming II', 200),
  ('CSC 204', 'Computer Architecture and Organisation', 200),
  ('CSC 206', 'Internet-of-Things', 200),
  ('GST 131', 'Communication in English', 100),
  ('MTH 131', 'Elementary Mathematics I', 100),
  ('PHY 101', 'General Physics I', 100),
  ('PHY 107', 'General Practical Physics I', 100),
  ('STA 151', 'Descriptive Statistics', 100),
  ('COS 101', 'Introduction to Computing Sciences', 100),
  ('CSC 103', 'Computer Application Packages Practical I', 100),
  ('GST 112', 'Nigerian Peoples and Culture', 100),
  ('MTH 132', 'Elementary Mathematics II', 100),
  ('PHY 102', 'General Physics II', 100),
  ('PHY 118', 'General Practical Physics II', 100),
  ('COS 102', 'Problem Solving', 100),
  ('CSC 104', 'Elementary Data Processing', 100),
  ('CSC 122', 'Computer Application Packages Practical II', 100),
  ('CSC 201', 'Computer Programming I', 200),
  ('CSC 205', 'Digital Logic Design', 200),
  ('CSC 207', 'Introduction to Software Engineering', 200),
  ('CSC 208', 'Computer Vision', 200),
  ('CSC 210', 'Web Design and Data Security', 200),
  ('CSC 301', 'Data Structures', 300),
  ('CSC 303', 'Expert System', 300),
  ('CSC 305', 'Control Systems', 300),
  ('CSC 307', 'Computer Simulation and Modelling', 300),
  ('CSC 309', 'Artificial Intelligence', 300),
  ('CSC 311', 'Introduction to Cybersecurity and Strategy', 300),
  ('CSC 313', 'Data Communication System & Network', 300),
  ('CSC 302', 'Operating Systems', 300),
  ('CSC 304', 'Computer Science Innovation and New Technologies', 300),
  ('CSC 306', 'Computer Graphics', 300),
  ('CSC 308', 'Data Management I', 300),
  ('CSC 310', 'Mobile Application Development', 300),
  ('CSC 312', 'Data Warehouse', 300),
  ('CSC 399', 'SIWES II', 300),
  ('GST 312', 'Peace and Conflict Resolution', 300),
  ('ENT 312', 'Venture Creation', 300),
  ('COS 401', 'Research Methodology and Technical Report Writing', 400),
  ('CSC 403', 'Algorithms and Complexity Analysis', 400),
  ('CSC 405', 'Project Management', 400),
  ('CSC 407', 'Cloud Computing', 400),
  ('CSC 497', 'Final Year Project I', 400),
  ('CSC 409', 'Survey of Programming Language', 400),
  ('CSC 411', 'Mobile Forensics', 400),
  ('CSC 413', 'Blue Economy Computing', 400),
  ('CSC 402', 'Ethics and Legal Issues in Computer Science', 400),
  ('CSC 404', 'Distributed Computing System', 400),
  ('CSC 406', 'Embedded System', 400),
  ('CSC 408', 'Blockchain Technology', 400),
  ('CSC 410', 'E-Commerce', 400),
  ('CSC 498', 'Final Year Project II', 400)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Computer Science')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Computing')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Geophysics (17 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('PHY 205', 'Thermal Physics', 200),
  ('PHY 207', 'Practical Physics III', 200),
  ('GPH 201', 'Introduction to Earth Physics', 200),
  ('GPH 211', 'Geomathematics', 200),
  ('COS 201', 'Computer Programming I', 200),
  ('PHY 201', 'General Physics V (Modern Physics)', 200),
  ('MTH 201', 'Mathematical Methods I', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('PHY 204', 'General Physics VI (Waves and Optics)', 200),
  ('PHY 208', 'Practical Physics IV', 200),
  ('GEY 210', 'Geological Map Interpretation', 200),
  ('GEY 212', 'Introduction to Geological Field Mapping', 200),
  ('MTH 202', 'Elementary Differential Equations', 200),
  ('GPH 228', 'Seismic Refraction Prospecting Methods', 200),
  ('GPH 232', 'Elementary Surveying and Photogrammetry', 200),
  ('PHY 202', 'Introduction to Electric Circuits & Electronics', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Geophysics')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Earth Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Geology (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('GEY 203', 'Introduction to Petrology', 200),
  ('GEY 205', 'Invertebrate Palaeontology', 200),
  ('GEY 207', 'Principles of Stratigraphy', 200),
  ('GEY 209', 'Introduction to Surveying', 200),
  ('COS 201', 'Computer Programming I', 200),
  ('CHM 211', 'Organic Chemistry I', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('GEY 202', 'Crystallography and Systematic Mineralogy', 200),
  ('GEY 210', 'Introduction to Structural Geology and Geological Map Interpretation', 200),
  ('GEY 212', 'Introduction to Field Mapping', 200),
  ('BUA 208', 'Business Ethics and Corporate Social Responsibility', 200),
  ('GPH 232', 'Elementary Surveying and Photogrammetry', 200),
  ('GPH 228', 'Introduction Seismic Refraction Prospecting Methods', 200),
  ('ICH 226', 'Introductory Material Science', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Geology')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Earth Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Nursing Science (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('ANA 203', 'General and Systemic embryology', 200),
  ('ANA 201', 'Anatomy of upper and Lower Limb', 200),
  ('PIO 201', 'Introductory Physiology and Blood', 200),
  ('BCH 201', 'General Biochemistry I', 200),
  ('NSC 201', 'Foundation of Professional Nursing Practice I', 200),
  ('NSC 203', 'Developmental Psychology', 200),
  ('BCH 203', 'General Biochemistry Practical', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('PIO 212', 'Renal and Body Fluids Physiology', 200),
  ('ANA 204', 'Anatomy of Thorax, Abdomen, Pelvis and Perinium', 200),
  ('BCH 202', 'General Biochemistry II', 200),
  ('NSC 202', 'Foundation of Nursing II', 200),
  ('NSC 206', 'General and Cellular Pathology', 200),
  ('MMP 202', 'Medical Microbiology and Parasitology', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Nursing Science')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Nursing and Allied Health Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Agricultural Economics and Extension (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('AGR 201', 'Principles of Agronomy', 200),
  ('AGR 205', 'Introduction to Fisheries and Aquaculture', 200),
  ('AGE 211', 'Introduction to Community Organisation', 200),
  ('ANS 203', 'Introduction to Agricultural Biochemistry', 200),
  ('CPS 205', 'Agricultural Climatology', 200),
  ('CPS 213', 'Vertebrate Pests of Crops and Control', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('AGR 202', 'Introduction to Agricultural Economics, Extension and Rural Sociology', 200),
  ('AGR 204', 'Introduction to Animal Production', 200),
  ('AGR 206', 'Principles of Family and Consumer Sciences, Food Science and Technology', 200),
  ('FWM 204', 'Introduction to Forest Resources and Wildlife Management', 200),
  ('AGE 208', 'Basic Mathematics and Statistics for Agricultural Students', 200),
  ('ANS 202', 'Anatomy and Physiology of Farm Animals', 200),
  ('CPS 210', 'General Agriculture (Practical)', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Agricultural Economics and Extension')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Agriculture, Food and Natural Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Animal Production and Health (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('AGR 201', 'Principles of Agronomy', 200),
  ('AGR 205', 'Introduction to Fisheries and Aquaculture', 200),
  ('AGE 211', 'Introduction to Community Organisation', 200),
  ('ANS 203', 'Introduction to Agricultural Biochemistry', 200),
  ('CPS 205', 'Agricultural Climatology', 200),
  ('CPS 213', 'Vertebrate Pests of Crops and Control', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('AGR 202', 'Introduction to Agricultural Economics, Extension and Rural Sociology', 200),
  ('AGR 204', 'Introduction to Animal Production', 200),
  ('AGR 206', 'Principles of Family and Consumer Sciences, Food Science and Technology', 200),
  ('FWM 204', 'Introduction to Forest Resources and Wildlife Management', 200),
  ('AGE 208', 'Basic Mathematics and Statistics for Agricultural Students', 200),
  ('ANS 202', 'Anatomy and Physiology of Farm Animals', 200),
  ('CPS 210', 'General Agriculture (Practical)', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Animal Production and Health')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Agriculture, Food and Natural Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Crop, Soil and Pest Management (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('AGR 201', 'Principles of Agronomy', 200),
  ('AGR 205', 'Introduction to Fisheries and Aquaculture', 200),
  ('AGE 211', 'Introduction to Community Organisation', 200),
  ('ANS 203', 'Introduction to Agricultural Biochemistry', 200),
  ('CPS 205', 'Agricultural Climatology', 200),
  ('CPS 213', 'Vertebrate Pests of Crops and Control', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('AGR 202', 'Introduction to Agricultural Economics, Extension and Rural Sociology', 200),
  ('AGR 204', 'Introduction to Animal Production', 200),
  ('AGR 206', 'Principles of Family and Consumer Sciences, Food Science and Technology', 200),
  ('FWM 204', 'Introduction to Forest Resources and Wildlife Management', 200),
  ('AGE 208', 'Basic Mathematics and Statistics for Agricultural Students', 200),
  ('ANS 202', 'Anatomy and Physiology of Farm Animals', 200),
  ('CPS 210', 'General Agriculture (Practical)', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Crop, Soil and Pest Management')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Agriculture, Food and Natural Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Food Science and Technology (17 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('AGR 201', 'Principles of Agronomy', 200),
  ('AGR 205', 'Introduction to Fisheries and Aquaculture', 200),
  ('FST 201', 'Principles of Food Processing and Preservation', 200),
  ('BCH 201', 'General Biochemistry I', 200),
  ('BCH 203', 'General Biochemistry practical', 200),
  ('CHM 213', 'Analytical Chemistry 1', 200),
  ('MCB 221', 'General Microbiology', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('AGR 202', 'Introduction to Agricultural Economics, Extension and Rural Sociology', 200),
  ('AGR 204', 'Introduction to Animal Production', 200),
  ('AGR 206', 'Principles of Family and Consumer Sciences, Food Science and Technology', 200),
  ('CSP 210', 'General Agriculture Practical', 200),
  ('FST 202', 'Fluid Mechanics in Food Processing', 200),
  ('GET 204', 'Students Workshop Practice', 200),
  ('GET 206', 'Fundamentals of Thermodynamics', 200),
  ('FWM 204', 'Introduction to Forest Resources and Wildlife Management', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Food Science and Technology')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Agriculture, Food and Natural Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Fisheries and Aquaculture (14 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('AGR 201', 'Principles of Agronomy', 200),
  ('CSP 205', 'Agricultural Climatology', 200),
  ('FAA 203', 'Fish and Fisheries Products', 200),
  ('AGR 205', 'Introduction to Fisheries and Aquaculture', 200),
  ('ANS 203', 'Introduction to Agricultural Biochemistry', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('AGR 202', 'Introduction to Agricultural Economics, Extension and Rural Sociology', 200),
  ('AGR 204', 'Introduction to Animal Production', 200),
  ('AGR 206', 'Principles of Family and Consumer Sciences, Food Science and Technology', 200),
  ('CSP 210', 'General Agriculture (Practical)', 200),
  ('FAA 210', 'Water Quality Monitoring and Assessment', 200),
  ('FAA 214', 'Practical Field Trip', 200),
  ('FWM 204', 'Introduction to Forest Resources and Wildlife Management', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Fisheries and Aquaculture')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Agriculture, Food and Natural Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Forest Resources and Wildlife Management (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('FWM 201', 'Introduction to Forest Extension and Economics', 200),
  ('FWM 203', 'Introduction to Remote Sensing and GIS Applications', 200),
  ('FWM 205', 'Principles of Silviculture', 200),
  ('AGR 201', 'Principles of Agronomy', 200),
  ('AGR 205', 'Introduction to Fisheries and Aquaculture', 200),
  ('FWM 207', 'Management of Game Birds (Ornithology)', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('FWM 202', 'Natural Ecosystems', 200),
  ('FWM 204', 'Introduction to Forest Resources and Wildlife Management', 200),
  ('FWM 206', 'Introduction to Wildlife Ecology', 200),
  ('AGR 204', 'Introduction to Animal Production', 200),
  ('FWM 208', 'Basic Principles of Climate change in Forestry and Wildlife Management', 200),
  ('FWM 210', 'Conservation of Marine Megafauna', 200),
  ('CPS 210', 'General Agriculture (Practical)', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Forest Resources and Wildlife Management')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Agriculture, Food and Natural Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Civil Engineering (13 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('GET 201', 'Applied Electricity I', 200),
  ('GET 205', 'Fundamentals of Fluid Mechanics', 200),
  ('GET 209', 'Engineering Mathematics I', 200),
  ('GET 211', 'Computing and Software Engineering', 200),
  ('CEE 201', 'Civil Engineering Drawing', 200),
  ('GET 207', 'Applied Mechanics', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('GET 202', 'Engineering Materials', 200),
  ('GET 204', 'Students Workshop Practice', 200),
  ('GET 206', 'Fundamentals of Thermodynamics', 200),
  ('GET 208', 'Strength of Materials', 200),
  ('GET 210', 'Engineering Mathematics II', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Civil Engineering')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Engineering and Engineering Technology')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Electrical and Electronic Engineering (14 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('GET 201', 'Applied Electricity I', 200),
  ('GET 203', 'Engineering Graphics and Solid Modeling II', 200),
  ('GET 205', 'Fundamentals of Fluid Mechanics', 200),
  ('GET 207', 'Applied Mechanics', 200),
  ('GET 209', 'Engineering Mathematics I', 200),
  ('GET 211', 'Computing and Software Engineering', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('GET 204', 'Students Workshop Practice', 200),
  ('GET 206', 'Fundamentals of Thermodynamics', 200),
  ('GET 210', 'Engineering Mathematics II', 200),
  ('EEE 202', 'Applied Electricity II', 200),
  ('EEE 204', 'Electrical Engineering Materials', 200),
  ('GET 208', 'Strength of Materials', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Electrical and Electronic Engineering')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Engineering and Engineering Technology')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Mechanical Engineering (14 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('GET 201', 'Applied Electricity I', 200),
  ('GET 205', 'Fundamentals of Fluid Mechanics', 200),
  ('GET 209', 'Engineering Mathematics I', 200),
  ('GET 211', 'Computing and Software Engineering', 200),
  ('GET 207', 'Applied Mechanics', 200),
  ('MEE 217', 'Manufacturing Technology I', 200),
  ('GST 212', 'Philosophy, Logic and Human Existence', 200),
  ('GET 202', 'Engineering Materials', 200),
  ('GET 204', 'Students Workshop Practice', 200),
  ('GET 206', 'Fundamentals of Thermodynamics', 200),
  ('GET 208', 'Strength of Materials', 200),
  ('GET 210', 'Engineering Mathematics II', 200),
  ('MEE 222', 'Engineering Drawing II', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Mechanical Engineering')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Engineering and Engineering Technology')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Accounting (15 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('ACC 201', 'Financial Accounting I', 200),
  ('ACC 203', 'Corporate Governance & Accounting Ethics', 200),
  ('BUA 203', 'Business Statistics', 200),
  ('ACC 215', 'International Accounting Standards (IAS)', 200),
  ('ACC 217', 'Data Analytics in Accounting', 200),
  ('ACC 219', 'Emerging Technologies in Accounting', 200),
  ('GST 212', 'Philosophy, Logic, and Human Existence', 200),
  ('ACC 202', 'Financial Accounting II', 200),
  ('ACC 204', 'Cost Accounting', 200),
  ('ACC 206', 'Accounting Laboratory', 200),
  ('BUA 204', 'Quantitative Analysis in Management', 200),
  ('BUA 216', 'Introduction to Financial Management', 200),
  ('BUA 218', 'Green Management', 200),
  ('ACC 208', 'Accounting Theory', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Accounting')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Management Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Business Management (16 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('BUA 201', 'Principles of Business Administration I', 200),
  ('BUA 203', 'Business Statistics', 200),
  ('BUA 205', 'Leadership and Governance', 200),
  ('BUA 207', 'Business Communication', 200),
  ('BUA 211', 'Business Negotiation and Conflict Resolution', 200),
  ('BUA 213', 'Principles of Marketing', 200),
  ('GST 212', 'Philosophy, Logic, and Human Existence', 200),
  ('BUA 202', 'Principles of Business Administration II', 200),
  ('BUA 204', 'Quantitative Analysis in Management', 200),
  ('BUA 216', 'Introduction to Financial Management', 200),
  ('BUA 218', 'Green Management', 200),
  ('BUA 208', 'Business Ethics and Corporate Social Responsibility', 200),
  ('BUA 210', 'Business Presentation Skills', 200),
  ('BUA 212', 'Contemporary Management Issues', 200),
  ('BUA 214', 'Product Development', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Business Management')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Management Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Entrepreneurship (18 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('ENT 223', 'Introduction to Entrepreneurial Financing', 200),
  ('ENT 225', 'Entrepreneurial Marketing', 200),
  ('ENT 227', 'Theories of Entrepreneurship', 200),
  ('ENT 215', 'Market Research', 200),
  ('BUA 201', 'Principles of Business Administration I', 200),
  ('BUA 207', 'Business Communication', 200),
  ('BUA 211', 'Business Negotiation and Conflict Resolution', 200),
  ('BUA 213', 'Principles of Marketing', 200),
  ('GST 212', 'Philosophy, Logic, and Human Existence', 200),
  ('ENT 224', 'Entrepreneurship and Change Management', 200),
  ('ENT 232', 'Industrial Learning and Tours 1', 200),
  ('ENT 234', 'Biographical Studies of Entrepreneurial Thinkers and Giants', 200),
  ('BUA 202', 'Principle of Business Administration II', 200),
  ('BUA 210', 'Business Presentation Skills', 200),
  ('BUA 214', 'Product Development', 200),
  ('ENT 238', 'Business Analytics', 200),
  ('ENT 240', 'Contemporary Issues in Entrepreneurship', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Entrepreneurship')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Management Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

-- Project Management (17 courses)
INSERT INTO public.courses (department_id, code, title, level)
SELECT d.id, v.code, v.title, v.level
FROM (VALUES
  ('ENT 211', 'Entrepreneurship and Innovation', 200),
  ('PMG 211', 'Stakeholder Management', 200),
  ('PMG 213', 'Project Finance and Resources Management', 200),
  ('PMG 221', 'Project Scheduling and Cost Management', 200),
  ('PMG 223', 'Project Planning and Work Based Learning', 200),
  ('COS 201', 'Computer Programming I', 200),
  ('GET 101', 'Engineering Drawing 1', 200),
  ('PMG 201', 'Material Management', 200),
  ('PMG 203', 'Forecasting and Planning Techniques', 200),
  ('GST 212', 'Philosophy, Logic, and Human Existence', 200),
  ('PMG 212', 'Effective Project Leadership', 200),
  ('PMG 222', 'Project Performance and Quality Assurance', 200),
  ('ACC 204', 'Cost Accounting', 200),
  ('COS 202', 'Computer Programming II', 200),
  ('MEE 222', 'Engineering Drawing 11', 200),
  ('PMG 204', 'Statistics for Management', 200),
  ('PMG 206', 'Industrial Psychology and Organizational Behavior', 200)
) AS v(code, title, level)
JOIN public.departments d ON lower(d.name) = lower('Project Management')
JOIN public.schools s ON s.id = d.school_id AND lower(s.name) = lower('School of Management Science')
WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.department_id = d.id AND upper(replace(c.code, ' ', '')) = upper(replace(v.code, ' ', '')));

COMMIT;
