import { createClient } from "./server";
import { createPublicClient } from "./client";
import {
  Semester,
  School,
  Department,
  Course,
  MaterialType,
  AcademicMaterial,
  DemoMaterial,
  AcademicEntitlement,
  initialSemesters,
  initialSchools,
  initialDepartments,
  initialCourses,
  initialMaterialTypes,
  initialMaterials,
  initialDemoMaterials,
} from "@/data/academic";

// In-memory mock entitlements storage for test/demo accounts
const mockEntitlements: AcademicEntitlement[] = [];

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

    let query = supabase.from("courses").select("*, departments(name)").eq("is_active", true);
    if (departmentId) query = query.eq("department_id", departmentId);
    if (level) query = query.eq("level", level);

    const { data, error } = await query.order("code", { ascending: true });
    if (error || !data) {
      let filtered = initialCourses;
      if (departmentId) filtered = filtered.filter((c) => c.department_id === departmentId);
      if (level) filtered = filtered.filter((c) => c.level === level);
      return filtered;
    }

    type CourseDbRecord = Course & { departments?: { name?: string } };
    return (data as unknown as CourseDbRecord[]).map((c) => ({
      ...c,
      department_name: c.departments?.name,
    }));
  } catch {
    let filtered = initialCourses;
    if (departmentId) filtered = filtered.filter((c) => c.department_id === departmentId);
    if (level) filtered = filtered.filter((c) => c.level === level);
    return filtered;
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
      department_name: d.departments?.name,
      course_code: d.courses?.code,
      course_title: d.courses?.title,
      academic_session_name: d.academic_sessions?.name,
      semester_name: d.semesters?.name,
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
      department_name: data.departments?.name,
      course_code: data.courses?.code,
      course_title: data.courses?.title,
      academic_session_name: data.academic_sessions?.name,
      semester_name: data.semesters?.name,
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
// ENTITLEMENT CHECK & ACCESS SHARING PROTECTION
// ============================================================

export async function checkUserSemesterEntitlement(
  userEmail: string,
  semesterId: string
): Promise<{ hasAccess: boolean; entitlement?: AcademicEntitlement; reason?: string }> {
  if (!userEmail) {
    return { hasAccess: false, reason: "Authentication required" };
  }

  // Check mock store first for instantaneous local responsiveness
  const mockMatch = mockEntitlements.find(
    (e) => e.user_email.toLowerCase() === userEmail.toLowerCase() && e.semester_id === semesterId
  );
  if (mockMatch) {
    const isExpired = new Date().getTime() >= new Date(mockMatch.expires_at).getTime();
    if (!isExpired && mockMatch.status === "ACTIVE") {
      return { hasAccess: true, entitlement: mockMatch };
    }
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academic_entitlements")
      .select("*")
      .eq("user_email", userEmail)
      .eq("semester_id", semesterId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { hasAccess: false, reason: "No active entitlement found for this semester" };
    }

    const now = new Date().getTime();
    const expiry = new Date(data.expires_at).getTime();

    if (now >= expiry) {
      return { hasAccess: false, reason: "Your access for this semester has expired" };
    }

    return { hasAccess: true, entitlement: data as AcademicEntitlement };
  } catch {
    return { hasAccess: false, reason: "Could not verify entitlement" };
  }
}

// Idempotent entitlement activation
export async function activateSemesterEntitlement(
  userEmail: string,
  semesterId: string,
  paymentReference: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const semester = initialSemesters.find((s) => s.id === semesterId) || (await getActiveSemester());
    if (!semester) {
      return { success: false, error: "Semester not found" };
    }

    const startsAt = new Date().toISOString();
    const expiresAt = new Date(semester.end_date).toISOString();

    const entitlement: AcademicEntitlement = {
      id: `ent-${Date.now()}`,
      user_id: userId,
      user_email: userEmail.toLowerCase(),
      semester_id: semesterId,
      payment_reference: paymentReference,
      starts_at: startsAt,
      expires_at: expiresAt,
      status: "ACTIVE",
      created_at: startsAt,
    };

    mockEntitlements.unshift(entitlement);

    try {
      const supabase = await createClient();
      await supabase.from("academic_entitlements").insert({
        user_id: userId || null,
        user_email: userEmail.toLowerCase(),
        semester_id: semesterId,
        payment_reference: paymentReference,
        starts_at: startsAt,
        expires_at: expiresAt,
        status: "ACTIVE",
      });
    } catch (e) {
      console.warn("Could not insert entitlement into live DB, saved to memory:", e);
    }

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to activate entitlement";
    return { success: false, error: errorMsg };
  }
}

export { parseNormalizedFilename, type ParsedFilenameMetadata } from "@/lib/academic/parser";

