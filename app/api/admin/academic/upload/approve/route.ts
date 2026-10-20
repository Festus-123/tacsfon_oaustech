import { NextResponse } from "next/server";
import { isAcademicHubUnlocked } from "@/lib/security/academic-hub-key";
import {
  NebulaDocumentGroup,
  formatNormalizedFilename,
  resolveClassification,
  describePendingCreations,
} from "@/lib/nebula/client";
import { getNebulaSortingContext } from "@/lib/nebula/context";
import { coursePrefix } from "@/lib/academic/course-scope";
import { createClient } from "@/lib/supabase/server";

const ACADEMIC_BUCKET = "academic-materials";
const INGESTION_PREFIX = "ingestion/";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/^school of\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "school";

const MIGRATION_HINT =
  "If this mentions a missing column, run supabase/migration-course-scope.sql in the Supabase SQL Editor.";

export async function POST(req: Request) {
  try {
    const unlocked = await isAcademicHubUnlocked();
    if (!unlocked) {
      return NextResponse.json(
        { success: false, error: "Academic Hub security gate locked." },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Admin session expired. Please log in again." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const group: NebulaDocumentGroup = body.group;
    const confirmCreate = body.confirm_create === true;

    if (!group || !group.classification) {
      return NextResponse.json(
        { success: false, error: "Missing document group metadata." },
        { status: 400 }
      );
    }

    // Re-resolve server-side against the live structure; never trust client-supplied IDs
    const context = await getNebulaSortingContext();
    const { classification: c, problem } = resolveClassification(group.classification, context);

    if (problem) {
      return NextResponse.json({ success: false, error: `Cannot publish: ${problem}` }, { status: 400 });
    }

    const creations = describePendingCreations(c);
    if (creations.length > 0 && !confirmCreate) {
      return NextResponse.json(
        {
          success: false,
          needs_confirmation: true,
          creations,
          error: "Publishing this material will create new Academic Structure entries.",
        },
        { status: 409 }
      );
    }

    const sourcePaths = group.source_file_ids.filter((id) => id.startsWith(INGESTION_PREFIX) && !id.includes(".."));
    if (sourcePaths.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Source file not found in ingestion storage. Please re-upload the document.",
        },
        { status: 400 }
      );
    }

    // Undo list in case a later step fails, so storage and structure stay consistent
    const created: { table: "schools" | "departments" | "courses"; id: string }[] = [];
    const movedPaths: { from: string; to: string }[] = [];

    const rollback = async () => {
      for (const moved of movedPaths.reverse()) {
        await supabase.storage.from(ACADEMIC_BUCKET).move(moved.to, moved.from);
      }
      for (const entry of created.reverse()) {
        await supabase.from(entry.table).delete().eq("id", entry.id);
      }
    };

    const fail = async (message: string, status = 500) => {
      await rollback();
      return NextResponse.json({ success: false, error: message }, { status });
    };

    // 1. School (school- and department-scoped courses)
    let schoolId = c.school_id;
    if (c.scope !== "general" && !schoolId && c.school) {
      const { data: existingCodes } = await supabase.from("schools").select("code");
      const taken = new Set((existingCodes || []).map((s: { code: string }) => s.code));
      let code = slugify(c.school);
      for (let n = 2; taken.has(code); n++) code = `${slugify(c.school)}-${n}`;

      const { data: school, error } = await supabase
        .from("schools")
        .insert({ name: c.school, code })
        .select("id")
        .single();
      if (error || !school) return fail(`Could not create school "${c.school}": ${error?.message}`);
      created.push({ table: "schools", id: school.id });
      schoolId = school.id;
    }

    // 2. Department (department-scoped courses)
    let departmentId = c.department_id;
    if (c.scope === "department" && !departmentId && c.department) {
      const { data: department, error } = await supabase
        .from("departments")
        .insert({ school_id: schoolId, name: c.department, code: coursePrefix(c.course) })
        .select("id")
        .single();
      if (error || !department) return fail(`Could not create department "${c.department}": ${error?.message}`);
      created.push({ table: "departments", id: department.id });
      departmentId = department.id;
    }

    // 3. Course
    let courseId = c.course_id;
    if (!courseId) {
      const { data: course, error } = await supabase
        .from("courses")
        .insert({
          code: c.course,
          title: c.course_title || c.course,
          level: c.level,
          scope: c.scope,
          department_id: c.scope === "department" ? departmentId : null,
          school_id: c.scope === "school" ? schoolId : null,
        })
        .select("id")
        .single();
      if (error || !course) return fail(`Could not create course ${c.course}: ${error?.message}. ${MIGRATION_HINT}`);
      created.push({ table: "courses", id: course.id });
      courseId = course.id;
    }

    const confirmed = { ...c, school_id: schoolId, department_id: departmentId, course_id: courseId };

    // Final filename is generated here from confirmed metadata, never trusted from the client/LLM
    const finalFilename = formatNormalizedFilename(confirmed, group.original_filenames[0] || "file.pdf");
    const sessionFolder = (confirmed.session || "undated").replace(/[^a-zA-Z0-9]+/g, "-");

    // 4. Move raw ingestion files to their final Academic Hub location
    for (const [index, from] of sourcePaths.entries()) {
      const name =
        index === 0 ? finalFilename : finalFilename.replace(/(\.[a-z0-9]+)$/i, `-part${index + 1}$1`);
      const to = `${sessionFolder}/${name}`;
      const { error: moveError } = await supabase.storage.from(ACADEMIC_BUCKET).move(from, to);

      if (moveError) {
        console.error(`Failed to move ${from} -> ${to}:`, moveError);
        return fail(`Could not store "${name}" in Academic Hub storage: ${moveError.message}`);
      }
      movedPaths.push({ from, to });
    }

    // 5. Material record
    const sessionLabel = [confirmed.session, confirmed.semester].filter(Boolean).join(" ");
    const title = `${confirmed.course} — ${confirmed.material_type}${sessionLabel ? ` (${sessionLabel})` : ""}`;
    const ext = finalFilename.split(".").pop()?.toLowerCase() || "pdf";

    const { data: inserted, error: insertError } = await supabase
      .from("materials")
      .insert({
        title,
        material_type_id: confirmed.material_type_id,
        school_id: confirmed.scope === "general" ? null : schoolId || null,
        department_id: confirmed.scope === "department" ? departmentId : null,
        course_id: courseId,
        level: confirmed.level,
        exam_session: confirmed.session || null,
        exam_semester: confirmed.semester || null,
        academic_session_id: null,
        semester_id: null,
        original_filename: group.original_filenames.join(", "),
        storage_path: movedPaths[0].to,
        file_type: ext,
        mime_type: group.mime_type || "application/octet-stream",
        file_size: group.file_size || 0,
        page_count: null,
        is_published: true,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      console.error("Supabase materials insert error:", insertError);
      return fail(`Failed to save material record: ${insertError?.message || "unknown error"}. ${MIGRATION_HINT}`);
    }

    const materialType = context.materialTypes.find((t) => t.id === confirmed.material_type_id);
    const material = {
      ...inserted,
      material_type_name: confirmed.material_type,
      material_type_slug: materialType?.slug,
      school_name: confirmed.school || undefined,
      department_name: confirmed.department || confirmed.school || "General Studies",
      course_code: confirmed.course,
      course_title: confirmed.course_title,
      academic_session_name: confirmed.session,
      semester_name: confirmed.semester,
    };

    return NextResponse.json({
      success: true,
      material,
      created: creations,
      message: `Successfully published ${title} to Academic Hub.`,
    });
  } catch (err) {
    console.error("Approve error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to publish approved material." },
      { status: 500 }
    );
  }
}
