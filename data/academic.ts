export interface AcademicSession {
  id: string;
  name: string; // e.g. "2024/2025"
  is_active: boolean;
  created_at: string;
}

export type SemesterStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "EXPIRED";

export interface Semester {
  id: string;
  academic_session_id: string;
  academic_session_name?: string;
  name: string; // e.g. "First Semester"
  start_date: string;
  end_date: string;
  price: number; // e.g. 1500 NGN
  status: SemesterStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  school_id: string;
  school_name?: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  department_id: string;
  department_name?: string;
  code: string; // e.g. "CSC 308"
  title: string;
  level: number; // 100, 200, 300, 400, 500
  is_active: boolean;
  created_at: string;
}

export interface MaterialType {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface AcademicMaterial {
  id: string;
  title: string;
  material_type_id: string;
  material_type_name?: string;
  material_type_slug?: string;
  school_id: string;
  school_name?: string;
  department_id: string;
  department_name?: string;
  course_id: string;
  course_code?: string;
  course_title?: string;
  level: number;
  academic_session_id: string;
  academic_session_name?: string;
  semester_id: string;
  semester_name?: string;
  original_filename: string;
  storage_path: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  page_count: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicPayment {
  id: string;
  user_id?: string;
  user_email: string;
  semester_id: string;
  semester_name?: string;
  paystack_reference: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED";
  paid_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AcademicEntitlement {
  id: string;
  user_id?: string;
  user_email: string;
  semester_id: string;
  payment_reference: string;
  starts_at: string;
  expires_at: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  created_at: string;
}

export interface DemoMaterial {
  id: string;
  title: string;
  type: "video" | "pdf" | "image";
  file_url: string;
  description: string;
  is_visible: boolean;
  created_at: string;
}

export const academicSupport = {
  email: "festusphillip19@gmail.com",
  phone: "09153741926",
  watermarkText: "TACSFON × FC STUDIO",
};

// Initial Seed Data for Academic Hub
export const initialAcademicSessions: AcademicSession[] = [
  {
    id: "session-2024-2025",
    name: "2024/2025",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "session-2025-2026",
    name: "2025/2026",
    is_active: false,
    created_at: new Date().toISOString(),
  },
];

export const initialSemesters: Semester[] = [
  {
    id: "sem-2024-first",
    academic_session_id: "session-2024-2025",
    academic_session_name: "2024/2025",
    name: "First Semester",
    start_date: "2024-10-15",
    end_date: "2025-02-28",
    price: 1500,
    status: "ACTIVE",
    description: "Full access to all past questions, manuals, lecture notes, and workbooks for the 2024/2025 First Semester.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sem-2024-second",
    academic_session_id: "session-2024-2025",
    academic_session_name: "2024/2025",
    name: "Second Semester",
    start_date: "2025-03-15",
    end_date: "2025-07-30",
    price: 1500,
    status: "DRAFT",
    description: "Upcoming Second Semester access package.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialSchools: School[] = [
  {
    id: "school-science",
    name: "School of Science",
    code: "science",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "school-engineering",
    name: "School of Engineering & Engineering Technology",
    code: "engineering",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "school-agriculture",
    name: "School of Agriculture, Food & Natural Resources",
    code: "agriculture",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const initialDepartments: Department[] = [
  {
    id: "dept-csc",
    school_id: "school-science",
    school_name: "School of Science",
    name: "Computer Science",
    code: "computer_science",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-mth",
    school_id: "school-science",
    school_name: "School of Science",
    name: "Mathematical Sciences",
    code: "mathematics",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-eee",
    school_id: "school-engineering",
    school_name: "School of Engineering & Engineering Technology",
    name: "Electrical & Electronics Engineering",
    code: "electrical_engineering",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const initialCourses: Course[] = [
  {
    id: "course-csc308",
    department_id: "dept-csc",
    department_name: "Computer Science",
    code: "CSC 308",
    title: "Operating Systems Principles",
    level: 300,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "course-csc301",
    department_id: "dept-csc",
    department_name: "Computer Science",
    code: "CSC 301",
    title: "Database Management Systems",
    level: 300,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "course-csc201",
    department_id: "dept-csc",
    department_name: "Computer Science",
    code: "CSC 201",
    title: "Computer Programming I (Python/C++)",
    level: 200,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "course-mth201",
    department_id: "dept-mth",
    department_name: "Mathematical Sciences",
    code: "MTH 201",
    title: "Linear Algebra I",
    level: 200,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const initialMaterialTypes: MaterialType[] = [
  {
    id: "type-pq",
    name: "Past Questions",
    slug: "past_questions",
    description: "Past examination question papers categorized by course and semester.",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "type-manuals",
    name: "Manuals & Lecture Notes",
    slug: "manuals",
    description: "Official practical manuals, laboratory guides, and comprehensive lecture notes.",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "type-workbooks",
    name: "Workbooks",
    slug: "workbooks",
    description: "Problem-solving workbooks, tutorial sheets, and structured study exercises.",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "type-materials",
    name: "Materials",
    slug: "materials",
    description: "Curated supplementary reading, textbook extracts, and reference slides.",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const initialMaterials: AcademicMaterial[] = [
  {
    id: "mat-001",
    title: "CSC 308 Past Examination Questions (2021 - 2024)",
    material_type_id: "type-pq",
    material_type_name: "Past Questions",
    material_type_slug: "past_questions",
    school_id: "school-science",
    school_name: "School of Science",
    department_id: "dept-csc",
    department_name: "Computer Science",
    course_id: "course-csc308",
    course_code: "CSC 308",
    course_title: "Operating Systems Principles",
    level: 300,
    academic_session_id: "session-2024-2025",
    academic_session_name: "2024/2025",
    semester_id: "sem-2024-first",
    semester_name: "First Semester",
    original_filename: "past_questions__300__science__computer_science__CSC_308__2024-2025.pdf",
    storage_path: "sem-2024-first/mat-001.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 2450000,
    page_count: 14,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mat-002",
    title: "CSC 301 Laboratory Manual & Database Queries",
    material_type_id: "type-manuals",
    material_type_name: "Manuals & Lecture Notes",
    material_type_slug: "manuals",
    school_id: "school-science",
    school_name: "School of Science",
    department_id: "dept-csc",
    department_name: "Computer Science",
    course_id: "course-csc301",
    course_code: "CSC 301",
    course_title: "Database Management Systems",
    level: 300,
    academic_session_id: "session-2024-2025",
    academic_session_name: "2024/2025",
    semester_id: "sem-2024-first",
    semester_name: "First Semester",
    original_filename: "manual__300__science__computer_science__CSC_301__2024-2025.pdf",
    storage_path: "sem-2024-first/mat-002.pdf",
    file_type: "pdf",
    mime_type: "application/pdf",
    file_size: 3820000,
    page_count: 32,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialDemoMaterials: DemoMaterial[] = [
  {
    id: "demo-video",
    title: "Academic Hub Platform Walkthrough & Study Guide",
    type: "video",
    file_url: "/assets/ins_link_DXCjyWIDVnm_1788818855788.mp4",
    description: "A quick 60-second tour showing how materials are indexed and accessed on phone and desktop.",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-pdf",
    title: "Sample Past Questions Preview (SAMPLE)",
    type: "pdf",
    file_url: "/assets/sunday-service.jpg",
    description: "Sample preview illustrating formatting, watermarking, and clarity of our verified course documents.",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-image",
    title: "Sample Curated Notes Architecture (SAMPLE)",
    type: "image",
    file_url: "/assets/example-hero-page.webp",
    description: "Visual preview of how complex formulas, diagrams, and lecture outlines are organized.",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
];
