import { NextResponse } from "next/server";
import { isAcademicHubUnlocked } from "@/lib/security/academic-hub-key";
import { NebulaDocumentGroup, formatNormalizedFilename } from "@/lib/nebula/client";
import { createClient } from "@/lib/supabase/server";
import {
  getMaterialTypes,
  getSchools,
  getDepartments,
  getCourses,
  getSemesters,
} from "@/lib/supabase/academic";

const ACADEMIC_BUCKET = "academic-materials";
const INGESTION_PREFIX = "ingestion/";

const sameText = (a?: string, b?: string) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

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

    if (!group || !group.classification) {
      return NextResponse.json(
        { success: false, error: "Missing document group metadata." },
        { status: 400 }
      );
    }

    const c = group.classification;

    // Resolve the confirmed metadata against the live Academic Hub structure.
    // IDs are preferred when valid; otherwise match by name/code (admin edits change names).
    const [materialTypes, schools, departments, courses, semesters] = await Promise.all([
      getMaterialTypes(),
      getSchools(),
      getDepartments(),
      getCourses(),
      getSemesters(),
    ]);

    const materialType =
      materialTypes.find((t) => t.id === c.material_type_id) ||
      materialTypes.find((t) => sameText(t.name, c.material_type) || sameText(t.slug, c.material_type));
    const school =
      schools.find((s) => s.id === c.school_id) ||
      schools.find((s) => sameText(s.name, c.school) || sameText(s.code, c.school));
    const department =
      departments.find((d) => d.id === c.department_id) ||
      departments.find(
        (d) =>
          (sameText(d.name, c.department) || sameText(d.code, c.department)) &&
          (!school || d.school_id === school.id)
      );
    const course =
      courses.find((co) => co.id === c.course_id) ||
      courses.find(
        (co) =>
          sameText(co.code.replace(/\s+/g, ""), c.course?.replace(/\s+/g, "")) &&
          (!department || co.department_id === department.id)
      );
    const semester =
      semesters.find((s) => s.id === c.semester_id) ||
      semesters.find(
        (s) => sameText(s.name, c.semester) && (!c.session || sameText(s.academic_session_name, c.session))
      );

    const missing = [
      !materialType && "material type",
      !school && "school",
      !department && "department",
      !course && "course",
      !semester && "semester/session",
    ].filter(Boolean);

    if (!materialType || !school || !department || !course || !semester) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot publish: ${missing.join(", ")} not found in the Academic Hub structure. Edit the classification or add it under Academic Structure first.`,
        },
        { status: 400 }
      );
    }

    const sessionName = semester.academic_session_name || c.session;
    const confirmed = {
      ...c,
      material_type: materialType.name,
      school: school.name,
      department: department.name,
      course: course.code,
      level: course.level,
      session: sessionName,
      semester: semester.name,
    };

    // Final filename is generated here from confirmed metadata, never trusted from the client/LLM
    const finalFilename = formatNormalizedFilename(confirmed, group.original_filenames[0] || "file.pdf");
    const sessionFolder = (sessionName || "unknown-session").replace(/[^a-zA-Z0-9]+/g, "-");

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

    // Move raw ingestion files to their final Academic Hub location
    const movedPaths: { from: string; to: string }[] = [];
    for (const [index, from] of sourcePaths.entries()) {
      const name =
        index === 0 ? finalFilename : finalFilename.replace(/(\.[a-z0-9]+)$/i, `-part${index + 1}$1`);
      const to = `${sessionFolder}/${name}`;
      const { error: moveError } = await supabase.storage.from(ACADEMIC_BUCKET).move(from, to);

      if (moveError) {
        console.error(`Failed to move ${from} -> ${to}:`, moveError);
        for (const moved of movedPaths) {
          await supabase.storage.from(ACADEMIC_BUCKET).move(moved.to, moved.from);
        }
        return NextResponse.json(
          {
            success: false,
            error: `Could not store "${name}" in Academic Hub storage: ${moveError.message}`,
          },
          { status: 500 }
        );
      }
      movedPaths.push({ from, to });
    }

    const title = `${course.code} — ${materialType.name} (${sessionName})`;
    const ext = finalFilename.split(".").pop()?.toLowerCase() || "pdf";

    const { data: inserted, error: insertError } = await supabase
      .from("materials")
      .insert({
        title,
        material_type_id: materialType.id,
        school_id: school.id,
        department_id: department.id,
        course_id: course.id,
        level: course.level,
        academic_session_id: semester.academic_session_id,
        semester_id: semester.id,
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
      // Keep storage and metadata in sync: put the files back for a retry
      for (const moved of movedPaths) {
        await supabase.storage.from(ACADEMIC_BUCKET).move(moved.to, moved.from);
      }
      return NextResponse.json(
        {
          success: false,
          error: `Failed to save material record: ${insertError?.message || "unknown error"}`,
        },
        { status: 500 }
      );
    }

    const material = {
      ...inserted,
      material_type_name: materialType.name,
      material_type_slug: materialType.slug,
      school_name: school.name,
      department_name: department.name,
      course_code: course.code,
      course_title: course.title,
      academic_session_name: sessionName,
      semester_name: semester.name,
    };

    return NextResponse.json({
      success: true,
      material,
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
