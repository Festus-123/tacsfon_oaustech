import { NextResponse } from "next/server";
import { isAcademicHubUnlocked } from "@/lib/security/academic-hub-key";
import {
  reevaluateIsolatedGroup,
  NebulaDocumentGroup,
  NebulaClassification,
  NebulaSortingContext,
} from "@/lib/nebula/client";
import {
  getMaterialTypes,
  getSchools,
  getDepartments,
  getCourses,
  getSemesters,
} from "@/lib/supabase/academic";

export async function POST(req: Request) {
  try {
    const unlocked = await isAcademicHubUnlocked();
    if (!unlocked) {
      return NextResponse.json(
        { success: false, error: "Academic Hub security gate locked" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const group: NebulaDocumentGroup = body.group;
    const corrections: Partial<NebulaClassification> = body.corrections;

    if (!group || !corrections) {
      return NextResponse.json(
        { success: false, error: "Missing group or correction data" },
        { status: 400 }
      );
    }

    const [materialTypes, schools, departments, courses, semesters] = await Promise.all([
      getMaterialTypes(),
      getSchools(),
      getDepartments(),
      getCourses(),
      getSemesters(),
    ]);

    const context: NebulaSortingContext = {
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
      sessions: ["2024/2025", "2025/2026", "2026/2027"],
      levels: [100, 200, 300, 400, 500],
    };

    const updatedGroup = await reevaluateIsolatedGroup(group, corrections, context);

    return NextResponse.json({
      success: true,
      group: updatedGroup,
      message: "Document re-evaluated with administrator metadata and approved.",
    });
  } catch (err) {
    console.error("Resubmit error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to re-evaluate document with Nebula." },
      { status: 500 }
    );
  }
}
