import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  schoolSchema,
  departmentSchema,
  courseSchema,
  courseScopeRuleSchema,
} from "@/lib/validation/schemas";
import { normalizeCourseCode, courseCodeKey, coursePrefix, CourseScopeRule } from "@/lib/academic/course-scope";

type EntityKey = "schools" | "departments" | "courses" | "course_scope_rules";

const LABELS: Record<EntityKey, string> = {
  schools: "School / faculty",
  departments: "Department",
  courses: "Course",
  course_scope_rules: "Scope rule",
};

const SELECTS: Record<EntityKey, string> = {
  schools: "*",
  departments: "*, schools(name)",
  courses: "*, departments(name, school_id)",
  course_scope_rules: "*",
};

/** Validates and normalizes the request body for one entity. */
function prepare(entity: EntityKey, body: unknown): { record?: Record<string, unknown>; error?: string } {
  const schema = {
    schools: schoolSchema,
    departments: departmentSchema,
    courses: courseSchema,
    course_scope_rules: courseScopeRuleSchema,
  }[entity];

  const parsed = schema.safeParse(body);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };
  const record: Record<string, unknown> = { ...parsed.data };

  if (entity === "schools") {
    record.code = String(record.code).toLowerCase().replace(/\s+/g, "-");
  } else if (entity === "departments") {
    record.code = String(record.code).toUpperCase();
  } else if (entity === "courses") {
    record.code = normalizeCourseCode(String(record.code));
    // Only the owner the scope needs is stored
    if (record.scope !== "department") record.department_id = null;
    if (record.scope !== "school") record.school_id = null;
  } else {
    if (record.match_type === "course") {
      const code = normalizeCourseCode(String(record.pattern));
      if (!code) return { error: "Course rules need a full course code such as CSC 101" };
      record.pattern = code;
      record.max_level = null;
    } else {
      const prefix = String(record.pattern).replace(/[^A-Za-z]/g, "").toUpperCase();
      if (prefix.length !== 3) return { error: "Prefix rules need a 3-letter prefix such as GST" };
      record.pattern = prefix;
    }
    if (record.scope !== "school") record.school_id = null;
    if (record.scope !== "department") record.department_id = null;
    if (record.scope !== "general") record.listed_under_department_ids = [];
  }
  return { record };
}

/**
 * Applies a new rule to the courses it matches, so existing courses follow it too.
 * Exact course rules always win over prefix rules.
 */
async function applyRuleToCourses(supabase: SupabaseClient, rule: CourseScopeRule): Promise<number> {
  const { data: courses } = await supabase.from("courses").select("id, code, level, department_id");
  const { data: courseRules } = await supabase
    .from("course_scope_rules")
    .select("pattern")
    .eq("match_type", "course");
  const exactCodes = new Set((courseRules || []).map((r: { pattern: string }) => courseCodeKey(r.pattern)));

  const matches = (courses || []).filter(
    (c: { code: string; level: number; department_id: string | null }) =>
      rule.match_type === "course"
        ? courseCodeKey(c.code) === courseCodeKey(rule.pattern)
        : coursePrefix(c.code) === rule.pattern &&
          (rule.max_level === null || c.level <= rule.max_level) &&
          !exactCodes.has(courseCodeKey(c.code)) &&
          (rule.scope !== "department" || !!c.department_id)
  );
  if (matches.length === 0) return 0;

  const update: Record<string, unknown> = { scope: rule.scope };
  if (rule.scope === "general") Object.assign(update, { department_id: null, school_id: null });
  if (rule.scope === "school") Object.assign(update, { department_id: null, school_id: rule.school_id });
  if (rule.scope === "department") {
    update.school_id = null;
    if (rule.department_id) update.department_id = rule.department_id;
  }

  const { error } = await supabase
    .from("courses")
    .update(update)
    .in(
      "id",
      matches.map((c: { id: string }) => c.id)
    );
  if (error) console.error("Failed to apply scope rule to courses:", error);
  return error ? 0 : matches.length;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity: rawEntity } = await params;
    if (!(rawEntity in LABELS)) {
      return NextResponse.json({ error: "Unknown structure type" }, { status: 404 });
    }
    const entity = rawEntity as EntityKey;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { record, error: validationError } = prepare(entity, await request.json());
    if (!record) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data, error } = await supabase.from(entity).insert(record).select(SELECTS[entity]).single();

    if (error) {
      console.error(`Supabase insert error (${entity}):`, error);
      if (error.code === "23505") {
        const what = entity === "course_scope_rules" ? `A rule for ${record.pattern}` : `${LABELS[entity]} "${record.code}"`;
        return NextResponse.json({ error: `${what} already exists.` }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const applied =
      entity === "course_scope_rules"
        ? await applyRuleToCourses(supabase, data as unknown as CourseScopeRule)
        : undefined;

    return NextResponse.json({ success: true, record: data, applied });
  } catch (err) {
    console.error("Error creating academic structure record:", err);
    return NextResponse.json({ error: "Server error saving record" }, { status: 500 });
  }
}
