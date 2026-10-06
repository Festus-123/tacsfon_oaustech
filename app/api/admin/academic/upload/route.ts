import { NextResponse } from "next/server";
import { isAcademicHubUnlocked } from "@/lib/security/academic-hub-key";
import {
  sendSortingRequestToNebula,
  RawUploadedFile,
  NebulaSortingContext,
} from "@/lib/nebula/client";
import {
  getMaterialTypes,
  getSchools,
  getDepartments,
  getCourses,
  getSemesters,
} from "@/lib/supabase/academic";

const MAX_TOTAL_BYTES = 100 * 1024 * 1024; // 100 MB per sorting request
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "docx"];

export async function POST(req: Request) {
  try {
    // 1. Security Gate Check
    const unlocked = await isAcademicHubUnlocked();
    if (!unlocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Academic Hub security gate locked. Please enter master security key first.",
        },
        { status: 401 }
      );
    }

    // 2. Content Length Check
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Payload exceeds the 100 MB limit per sorting request (${(
            parseInt(contentLength, 10) /
            (1024 * 1024)
          ).toFixed(1)} MB received).`,
        },
        { status: 413 }
      );
    }

    // 3. Parse FormData
    const formData = await req.formData();
    const files: File[] = [];

    for (const entry of formData.entries()) {
      const [key, value] = entry;
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files received for sorting." },
        { status: 400 }
      );
    }

    // 4. Validate Files and Total Size
    let totalSize = 0;
    const rawFiles: RawUploadedFile[] = [];

    for (const file of files) {
      totalSize += file.size;
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" has unsupported format .${ext}. Only PDF, JPG, JPEG, PNG, WebP, and DOCX are allowed.`,
          },
          { status: 400 }
        );
      }

      // Convert small preview slice to base64 if needed
      rawFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      });
    }

    if (totalSize > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Total upload size exceeds 100 MB (${(totalSize / (1024 * 1024)).toFixed(
            1
          )} MB). Please select fewer documents.`,
        },
        { status: 413 }
      );
    }

    // 5. Gather Dynamic Academic Hub Context
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

    // 6. Dispatch to Nebula AI
    const result = await sendSortingRequestToNebula(rawFiles, context);

    return NextResponse.json({
      success: true,
      message: `Nebula analyzed ${files.length} document(s). Review ready.`,
      result,
    });
  } catch (err) {
    console.error("Document ingestion error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process raw document sorting request.",
      },
      { status: 500 }
    );
  }
}
