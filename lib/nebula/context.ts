import { NebulaSortingContext } from "@/lib/nebula/client";
import {
  getMaterialTypes,
  getSchools,
  getDepartments,
  getCourses,
  getCourseScopeRules,
} from "@/lib/supabase/academic";

/**
 * Builds the sorting context (allowed values, course records and scope rules) from the live
 * Academic Hub configuration, so nothing about the structure is hardcoded into the Nebula request.
 */
export async function getNebulaSortingContext(): Promise<NebulaSortingContext> {
  const [materialTypes, schools, departments, courses, rules] = await Promise.all([
    getMaterialTypes(),
    getSchools(),
    getDepartments(),
    getCourses(),
    getCourseScopeRules(),
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
      level: c.level,
      scope: c.scope || "department",
      department_id: c.department_id,
      school_id: c.school_id ?? null,
    })),
    rules,
    levels: [100, 200, 300, 400, 500],
  };
}
