import { createPublicClient } from "./client";
import { createServiceClient, SERVICE_KEY_MISSING } from "./admin";
import type { CourseScopeRule } from "@/lib/academic/course-scope";
import {
  Semester,
  School,
  Department,
  Course,
  MaterialType,
  AcademicMaterial,
  DemoMaterial,
  AcademicSession,
  initialAcademicSessions,
  initialSemesters,
  initialSchools,
  initialDepartments,
  initialCourses,
  initialMaterialTypes,
  initialMaterials,
  initialDemoMaterials,
} from "@/data/academic";


// ============================================================
// PUBLIC BROWSING & ACCESS QUERIES
// ============================================================

export async function getActiveSemester(): Promise<Semester | null> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return initialSemesters.find((s) => s.status === "ACTIVE") || initialSemesters[0];
    }
    const { data, error } = await supabase
      .from("semesters")
      .select(`
        *,
        academic_sessions (name)
      `)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return initialSemesters.find((s) => s.status === "ACTIVE") || initialSemesters[0];
    }

    return {
      ...data,
      academic_session_name: data.academic_sessions?.name || "2024/2025",
    };
  } catch (err) {
    console.error("Error retrieving active semester:", err);
    return initialSemesters.find((s) => s.status === "ACTIVE") || initialSemesters[0];
  }
}

export async function getSemesters(): Promise<Semester[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return initialSemesters;

    const { data, error } = await supabase
      .from("semesters")
      .select(`
        *,
        academic_sessions (name)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return initialSemesters;

    type SemesterDbRecord = Semester & { academic_sessions?: { name?: string } };
    return (data as unknown as SemesterDbRecord[]).map((d) => ({
      ...d,
      academic_session_name: d.academic_sessions?.name,
    }));
  } catch {
    return initialSemesters;
  }
}

export async function getAcademicSessions(): Promise<AcademicSession[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return initialAcademicSessions;

    const { data, error } = await supabase
      .from("academic_sessions")
      .select("*")
      .order("name", { ascending: false });

    if (error || !data) return initialAcademicSessions;
    return data;
  } catch {
    return initialAcademicSessions;
  }
}

export async function getMaterialTypes(): Promise<MaterialType[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return initialMaterialTypes;

    const { data, error } = await supabase
      .from("material_types")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !data) return initialMaterialTypes;
    return data;
  } catch {
    return initialMaterialTypes;
  }
}

export async function getSchools(): Promise<School[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return initialSchools;

    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error || !data) return initialSchools;
    return data;
  } catch {
    return initialSchools;
  }
}

export async function getDepartments(schoolId?: string): Promise<Department[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      if (schoolId) return initialDepartments.filter((d) => d.school_id === schoolId);
      return initialDepartments;
    }

    let query = supabase.from("departments").select("*, schools(name)").eq("is_active", true);
    if (schoolId) query = query.eq("school_id", schoolId);

    const { data, error } = await query.order("name", { ascending: true });
    if (error || !data) {
      if (schoolId) return initialDepartments.filter((d) => d.school_id === schoolId);
      return initialDepartments;
    }

    type DeptDbRecord = Department & { schools?: { name?: string } };
    return (data as unknown as DeptDbRecord[]).map((d) => ({
      ...d,
      school_name: d.schools?.name,
    }));
  } catch {
    return schoolId ? initialDepartments.filter((d) => d.school_id === schoolId) : initialDepartments;
  }
}

export async function getCourses(departmentId?: string, level?: number): Promise<Course[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      let filtered = initialCourses;
      if (departmentId) filtered = filtered.filter((c) => c.department_id === departmentId);
      if (level) filtered = filtered.filter((c) => c.level === level);
      return filtered;
    }

    let query = supabase
      .from("courses")
      .select("*, departments(name, school_id)")
      .eq("is_active", true);
    if (departmentId) query = query.eq("department_id", departmentId);
    if (level) query = query.eq("level", level);

    const { data, error } = await query.order("code", { ascending: true });
    if (error || !data) {
      let filtered = initialCourses;
      if (departmentId) filtered = filtered.filter((c) => c.department_id === departmentId);
      if (level) filtered = filtered.filter((c) => c.level === level);
      return filtered;
    }

    type CourseDbRecord = Course & { departments?: { name?: string; school_id?: string } | null };
    return (data as unknown as CourseDbRecord[]).map(({ departments, ...c }) => ({
      ...c,
      scope: c.scope || "department",
      // department-owned courses inherit their department's school
      school_id: c.school_id || departments?.school_id || null,
      department_name: departments?.name,
    }));
  } catch {
    let filtered = initialCourses;
    if (departmentId) filtered = filtered.filter((c) => c.department_id === departmentId);
    if (level) filtered = filtered.filter((c) => c.level === level);
    return filtered;
  }
}

export async function getCourseScopeRules(): Promise<CourseScopeRule[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("course_scope_rules")
      .select("*")
      .order("created_at", { ascending: true });

    // Table only exists once supabase/migration-course-scope.sql has been run
    if (error || !data) return [];
    return data as CourseScopeRule[];
  } catch {
    return [];
  }
}

export async function getPublishedMaterials(filters?: {
  typeSlug?: string;
  level?: number;
  schoolId?: string;
  departmentId?: string;
  courseId?: string;
}): Promise<AcademicMaterial[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      let list = initialMaterials.filter((m) => m.is_published);
      if (filters?.typeSlug) list = list.filter((m) => m.material_type_slug === filters.typeSlug);
      if (filters?.level) list = list.filter((m) => m.level === Number(filters.level));
      if (filters?.schoolId) list = list.filter((m) => m.school_id === filters.schoolId);
      if (filters?.departmentId) list = list.filter((m) => m.department_id === filters.departmentId);
      if (filters?.courseId) list = list.filter((m) => m.course_id === filters.courseId);
      return list;
    }

    let query = supabase
      .from("materials")
      .select(`
        *,
        material_types (name, slug),
        schools (name),
        departments (name),
        courses (code, title),
        academic_sessions (name),
        semesters (name)
      `)
      .eq("is_published", true);

    if (filters?.level) query = query.eq("level", filters.level);
    if (filters?.schoolId) query = query.eq("school_id", filters.schoolId);
    if (filters?.departmentId) query = query.eq("department_id", filters.departmentId);
    if (filters?.courseId) query = query.eq("course_id", filters.courseId);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error || !data) {
      let list = initialMaterials.filter((m) => m.is_published);
      if (filters?.typeSlug) list = list.filter((m) => m.material_type_slug === filters.typeSlug);
      if (filters?.level) list = list.filter((m) => m.level === Number(filters.level));
      return list;
    }

    type MaterialDbRecord = AcademicMaterial & {
      material_types?: { name?: string; slug?: string };
      schools?: { name?: string };
      departments?: { name?: string };
      courses?: { code?: string; title?: string };
      academic_sessions?: { name?: string };
      semesters?: { name?: string };
    };

    let formatted: AcademicMaterial[] = (data as unknown as MaterialDbRecord[]).map((d) => ({
      ...d,
      material_type_name: d.material_types?.name,
      material_type_slug: d.material_types?.slug,
      school_name: d.schools?.name,
      department_name: d.departments?.name || d.schools?.name || "General Studies",
      course_code: d.courses?.code,
      course_title: d.courses?.title,
      academic_session_name: d.exam_session || d.academic_sessions?.name,
      semester_name: d.exam_semester || d.semesters?.name,
    }));

    if (filters?.typeSlug) {
      formatted = formatted.filter((m) => m.material_type_slug === filters.typeSlug);
    }

    return formatted;
  } catch {
    return initialMaterials.filter((m) => m.is_published);
  }
}

export async function getMaterialById(id: string): Promise<AcademicMaterial | null> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return initialMaterials.find((m) => m.id === id) || null;
    }

    const { data, error } = await supabase
      .from("materials")
      .select(`
        *,
        material_types (name, slug),
        schools (name),
        departments (name),
        courses (code, title),
        academic_sessions (name),
        semesters (name)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return initialMaterials.find((m) => m.id === id) || null;
    }

    return {
      ...data,
      material_type_name: data.material_types?.name,
      material_type_slug: data.material_types?.slug,
      school_name: data.schools?.name,
      department_name: data.departments?.name || data.schools?.name || "General Studies",
      course_code: data.courses?.code,
      course_title: data.courses?.title,
      academic_session_name: data.exam_session || data.academic_sessions?.name,
      semester_name: data.exam_semester || data.semesters?.name,
    };
  } catch {
    return initialMaterials.find((m) => m.id === id) || null;
  }
}

export async function getDemoMaterials(): Promise<DemoMaterial[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return initialDemoMaterials;

    const { data, error } = await supabase
      .from("demo_materials")
      .select("*")
      .eq("is_visible", true);

    if (error || !data || data.length === 0) return initialDemoMaterials;
    return data;
  } catch {
    return initialDemoMaterials;
  }
}

// ============================================================
// ENTITLEMENT ACTIVATION
// Students are not Supabase users, so entitlements and payments are written with the
// server-only service client (RLS only lets admins write these tables).
// ============================================================

/**
 * Records a verified payment and grants semester access. Idempotent per payment reference,
 * so verifying the same payment twice (redirect + webhook) never creates a duplicate.
 */
export async function activateSemesterEntitlement(
  userEmail: string,
  semesterId: string,
  paymentReference: string,
  details: { amount?: number; userId?: string; metadata?: Record<string, unknown> } = {}
): Promise<{ success: boolean; expiresAt?: string; error?: string }> {
  const supabase = createServiceClient();
  if (!supabase) {
    console.error(SERVICE_KEY_MISSING);
    return { success: false, error: SERVICE_KEY_MISSING };
  }

  try {
    const email = userEmail.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("academic_entitlements")
      .select("id, expires_at")
      .eq("payment_reference", paymentReference)
      .maybeSingle();
    if (existing) {
      return { success: true, expiresAt: existing.expires_at };
    }

    const { data: semester, error: semesterError } = await supabase
      .from("semesters")
      .select("id, end_date, price")
      .eq("id", semesterId)
      .maybeSingle();
    if (semesterError || !semester) {
      return { success: false, error: "Semester not found" };
    }

    // Access lasts until the end of the semester's last day
    const expiresAt = new Date(`${semester.end_date}T23:59:59Z`).toISOString();
    const startsAt = new Date().toISOString();

    await supabase.from("academic_payments").upsert(
      {
        user_id: details.userId || null,
        user_email: email,
        semester_id: semesterId,
        paystack_reference: paymentReference,
        amount: details.amount ?? Number(semester.price),
        status: "SUCCESS",
        paid_at: startsAt,
        metadata: details.metadata || null,
      },
      { onConflict: "paystack_reference" }
    );

    const { error: insertError } = await supabase.from("academic_entitlements").insert({
      user_id: details.userId || null,
      user_email: email,
      semester_id: semesterId,
      payment_reference: paymentReference,
      starts_at: startsAt,
      expires_at: expiresAt,
      status: "ACTIVE",
    });

    if (insertError) {
      console.error("Failed to save academic entitlement:", insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, expiresAt };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to activate entitlement";
    return { success: false, error: errorMsg };
  }
}

export { parseNormalizedFilename, type ParsedFilenameMetadata } from "@/lib/academic/parser";

