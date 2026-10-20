/**
 * Course code normalization and scope rules, shared by the Nebula integration,
 * the admin review UI, the approval route and the student catalog.
 *
 * Scope:
 *   general    - university-wide (e.g. GST, MTH up to 200L); no school or department
 *   school     - shared by one school (e.g. CSC 101 / 102 -> School of Computing)
 *   department - owned by one department (e.g. CSC 308 -> Computer Science)
 */

export type CourseScope = "general" | "school" | "department";

export interface CourseScopeRule {
  id: string;
  match_type: "course" | "prefix";
  pattern: string; // "CSC 101" for course rules, "GST" for prefix rules
  max_level: number | null; // prefix rules only; null = any level
  scope: CourseScope;
  school_id: string | null;
  department_id: string | null;
  listed_under_department_ids: string[];
  created_at?: string;
}

export const COURSE_SCOPE_LABELS: Record<CourseScope, string> = {
  general: "General (university-wide)",
  school: "School-wide",
  department: "Department",
};

const CODE_PATTERN = /^\s*([A-Za-z]{3})\s*-?\s*(\d{3})\s*$/;

/** "csc356", "CSC-356", " csc 356 " -> "CSC 356"; null when it is not a course code. */
export function normalizeCourseCode(input?: string | null): string | null {
  const match = (input || "").match(CODE_PATTERN);
  return match ? `${match[1].toUpperCase()} ${match[2]}` : null;
}

/** Comparison key that ignores spacing and case. */
export function courseCodeKey(input?: string | null): string {
  return (input || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function coursePrefix(code: string): string {
  return courseCodeKey(code).replace(/\d+$/, "");
}

/** CSC 308 -> 300; null when the first digit is not 1-5. */
export function levelFromCourseCode(code?: string | null): number | null {
  const normalized = normalizeCourseCode(code);
  if (!normalized) return null;
  const digit = Number(normalized.split(" ")[1][0]);
  return digit >= 1 && digit <= 5 ? digit * 100 : null;
}

/** "2023/24", "2023-2024", "2023 / 2024" -> "2023/2024"; null when unrecognised. */
export function normalizeSession(input?: string | null): string | null {
  const match = (input || "").match(/(20\d{2})\s*[/\-–]\s*(20)?(\d{2})/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(`${match[2] || String(start).slice(0, 2)}${match[3]}`);
  return end === start + 1 ? `${start}/${end}` : null;
}

/** "1st semester", "first", "Harmattan" -> "First Semester"; null when unrecognised. */
export function normalizeExamSemester(input?: string | null): string | null {
  const text = (input || "").toLowerCase();
  if (/\b(first|1st|one|harmattan)\b/.test(text) || /^\s*1\s*$/.test(text)) return "First Semester";
  if (/\b(second|2nd|two|rain)\b/.test(text) || /^\s*2\s*$/.test(text)) return "Second Semester";
  return null;
}

/**
 * The rule that applies to a course code, most specific first:
 * exact course rule > prefix rule with the lowest matching max level > prefix rule for any level.
 */
export function findScopeRule(
  code: string,
  level: number | null,
  rules: CourseScopeRule[]
): CourseScopeRule | undefined {
  const key = courseCodeKey(code);
  const exact = rules.find((r) => r.match_type === "course" && courseCodeKey(r.pattern) === key);
  if (exact) return exact;

  const prefix = coursePrefix(code);
  return rules
    .filter(
      (r) =>
        r.match_type === "prefix" &&
        r.pattern.trim().toUpperCase() === prefix &&
        (r.max_level === null || (level !== null && level <= r.max_level))
    )
    .sort((a, b) => (a.max_level ?? 9999) - (b.max_level ?? 9999))[0];
}

export interface ScopeSuggestion {
  scope: CourseScope;
  school_id?: string;
  department_id?: string;
  rule?: CourseScopeRule;
}

/**
 * Suggested scope/owner for a course that is not registered yet. Without a rule, the
 * department whose code matches the prefix owns it (CSC -> Computer Science).
 */
export function suggestScopeForNewCourse(
  code: string,
  rules: CourseScopeRule[],
  departments: { id: string; code: string; school_id: string }[]
): ScopeSuggestion {
  const level = levelFromCourseCode(code);
  const rule = findScopeRule(code, level, rules);
  const prefixDepartment = departments.find((d) => d.code.trim().toUpperCase() === coursePrefix(code));

  if (rule) {
    if (rule.scope === "general") return { scope: "general", rule };
    if (rule.scope === "school") return { scope: "school", school_id: rule.school_id || undefined, rule };
    const department = departments.find((d) => d.id === rule.department_id) || prefixDepartment;
    return { scope: "department", department_id: department?.id, school_id: department?.school_id, rule };
  }

  return {
    scope: "department",
    department_id: prefixDepartment?.id,
    school_id: prefixDepartment?.school_id,
  };
}
