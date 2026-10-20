import { NebulaSortingContext } from "@/lib/nebula/client";
import {
  getMaterialTypes,
  getSchools,
  getDepartments,
  getCourses,
  getSemesters,
} from "@/lib/supabase/academic";

/**
 * Builds the sorting context (allowed values) from the live Academic Hub configuration,
 * so nothing about schools, departments or courses is hardcoded into the Nebula request.
 */
export async function getNebulaSortingContext(): Promise<NebulaSortingContext> {
  const [materialTypes, schools, departments, courses, semesters] = await Promise.all([
    getMaterialTypes(),
    getSchools(),
    getDepartments(),
    getCourses(),
    getSemesters(),
  ]);

  return {
    materialTypes: materialTypes.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    schools: schools.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    departments: departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      school_id: d.school_id,
    })),
    courses: courses.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      department_id: c.department_id,
      level: c.level,
    })),
    semesters: semesters.map((s) => ({
      id: s.id,
      name: s.name,
      academic_session_name: s.academic_session_name,
    })),
    sessions: Array.from(
      new Set(semesters.map((s) => s.academic_session_name).filter((n): n is string => !!n))
    ),
    levels: [100, 200, 300, 400, 500],
  };
}
