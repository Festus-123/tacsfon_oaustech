import crypto from "crypto";

export interface RawUploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  base64?: string;
}

export interface NebulaSortingContext {
  materialTypes: { id: string; name: string; slug: string }[];
  schools: { id: string; name: string; code: string }[];
  departments: { id: string; name: string; code: string; school_id: string }[];
  courses: { id: string; code: string; title: string; department_id: string; level: number }[];
  semesters: { id: string; name: string; academic_session_name?: string }[];
  sessions: string[];
  levels: number[];
}

export interface NebulaClassification {
  material_type: string;
  material_type_id?: string;
  level: number;
  school: string;
  school_id?: string;
  department: string;
  department_id?: string;
  course: string;
  course_id?: string;
  session: string;
  semester: string;
  semester_id?: string;
}

export interface NebulaDocumentGroup {
  group_id: string;
  source_file_ids: string[];
  original_filenames: string[];
  file_size: number;
  mime_type: string;
  classification: NebulaClassification;
  proposed_filename: string;
  status: "approved" | "isolated" | "rejected";
  confidence: number;
  isolation_reason?: string;
  warnings: string[];
  created_at: string;
}

export interface NebulaSortResult {
  request_id: string;
  approved: NebulaDocumentGroup[];
  isolated: NebulaDocumentGroup[];
  rejected: NebulaDocumentGroup[];
}

/**
 * Deterministically constructs standardized storage filenames according to specification:
 * {material_type}-{level}lvl-{school}-{department}-{course}-{session}-{semester}.{ext}
 */
export function formatNormalizedFilename(
  classification: NebulaClassification,
  sampleFilename: string
): string {
  const ext = sampleFilename.split(".").pop()?.toLowerCase() || "pdf";

  const sanitize = (val: string) =>
    (val || "unknown")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const typeSlug = sanitize(classification.material_type);
  const lvl = classification.level ? `${classification.level}lvl` : "100lvl";
  const schoolSlug = sanitize(classification.school);
  const deptSlug = sanitize(classification.department);
  const courseSlug = (classification.course || "course").replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
  const sessionSlug = sanitize(classification.session);
  const semesterSlug = sanitize(classification.semester);

  return `${typeSlug}-${lvl}-${schoolSlug}-${deptSlug}-${courseSlug}-${sessionSlug}-${semesterSlug}.${ext}`;
}

/**
 * Sends a sorting request to Nebula AI backend or runs intelligent local classification fallback.
 */
export async function sendSortingRequestToNebula(
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  requestId: string = `req-${Date.now()}`
): Promise<NebulaSortResult> {
  const nebulaUrl = process.env.NEBULA_API_URL;
  const nebulaApiKey = process.env.NEBULA_API_KEY;

  if (nebulaUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const response = await fetch(`${nebulaUrl.replace(/\/+$/, "")}/sort`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(nebulaApiKey ? { Authorization: `Bearer ${nebulaApiKey}` } : {}),
        },
        body: JSON.stringify({
          task: "document_sorting",
          request_id: requestId,
          schema: [
            "material_type",
            "level",
            "school",
            "department",
            "course",
            "session",
            "semester",
          ],
          allowed_values: {
            material_types: context.materialTypes.map((t) => t.name),
            levels: context.levels,
            schools: context.schools.map((s) => s.name),
            departments: context.departments.map((d) => d.name),
            courses: context.courses.map((c) => c.code),
            sessions: context.sessions,
            semesters: context.semesters.map((s) => s.name),
          },
          files: files.map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            base64: f.base64,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const nebulaData = await response.json();
        if (nebulaData && (nebulaData.approved || nebulaData.isolated)) {
          return nebulaData as NebulaSortResult;
        }
      } else {
        console.warn(`Nebula server returned HTTP ${response.status}. Using smart fallback classifier.`);
      }
    } catch (err) {
      console.warn("Nebula connection timed out or unreachable. Using smart fallback classifier:", err);
    }
  }

  // Smart fallback document analyzer
  return runSmartFallbackClassifier(files, context, requestId);
}

/**
 * Intelligent local classifier and page continuity analyzer.
 * Groups related multi-page documents (e.g. Page 1 + Page 2 continuations)
 * and resolves matches against live database entities.
 */
function runSmartFallbackClassifier(
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  requestId: string
): NebulaSortResult {
  const approved: NebulaDocumentGroup[] = [];
  const isolated: NebulaDocumentGroup[] = [];
  const rejected: NebulaDocumentGroup[] = [];

  const defaultSession = context.sessions[0] || "2024/2025";
  const defaultSemester = context.semesters[0]?.name || "First Semester";
  const defaultSemesterId = context.semesters[0]?.id || "";

  // Step 1: Detect continuation patterns to group multi-page uploads
  // E.g. files with matching course or "part 2", "page 2", "cont"
  const groupedBuckets: Map<string, RawUploadedFile[]> = new Map();

  files.forEach((file) => {
    // Normalize name
    const clean = file.name.toLowerCase();

    // Check for continuation indicators
    const isContinuation =
      clean.includes("page_2") ||
      clean.includes("page2") ||
      clean.includes("part_2") ||
      clean.includes("cont") ||
      clean.includes("no_header");

    // Match course code in name (e.g. csc 308, eee 306, mth 101)
    const courseMatch = context.courses.find((c) => {
      const codeRegex = new RegExp(c.code.replace(/\s+/g, "[_\\s-]?"), "i");
      return codeRegex.test(clean);
    });

    let groupKey = file.id;
    if (courseMatch) {
      groupKey = `group-${courseMatch.code}`;
    } else if (isContinuation) {
      // Find an existing bucket to attach to if present
      const firstExistingKey = Array.from(groupedBuckets.keys())[0];
      if (firstExistingKey) {
        groupKey = firstExistingKey;
      }
    }

    const currentList = groupedBuckets.get(groupKey) || [];
    currentList.push(file);
    groupedBuckets.set(groupKey, currentList);
  });

  // Step 2: Classify each group
  let index = 0;
  for (const [key, groupFiles] of groupedBuckets.entries()) {
    index++;
    const primaryFile = groupFiles[0];
    const totalSize = groupFiles.reduce((acc, f) => acc + f.size, 0);
    const originalNames = groupFiles.map((f) => f.name);
    const combinedName = groupFiles.map((f) => f.name.toLowerCase()).join(" ");

    // Check unsupported or unreadable
    const ext = primaryFile.name.split(".").pop()?.toLowerCase();
    const validExts = ["pdf", "jpg", "jpeg", "png", "webp", "docx"];
    if (!ext || !validExts.includes(ext)) {
      rejected.push({
        group_id: `grp-${Date.now()}-${index}`,
        source_file_ids: groupFiles.map((f) => f.id),
        original_filenames: originalNames,
        file_size: totalSize,
        mime_type: primaryFile.type,
        classification: {
          material_type: "Unknown",
          level: 100,
          school: "Unknown",
          department: "Unknown",
          course: "Unknown",
          session: defaultSession,
          semester: defaultSemester,
        },
        proposed_filename: primaryFile.name,
        status: "rejected",
        confidence: 0,
        isolation_reason: `Unsupported file extension .${ext}. Only PDF, JPG, PNG, WebP, and DOCX are permitted.`,
        warnings: ["File rejected due to invalid format"],
        created_at: new Date().toISOString(),
      });
      continue;
    }

    // Material type resolution
    let detectedType = context.materialTypes.find((t) => {
      const slugMatch = combinedName.includes(t.slug);
      const nameMatch = combinedName.includes(t.name.toLowerCase());
      return slugMatch || nameMatch;
    });

    if (!detectedType) {
      if (combinedName.includes("past_question") || combinedName.includes("pq") || combinedName.includes("exam")) {
        detectedType = context.materialTypes.find((t) => t.slug === "past_questions");
      } else if (combinedName.includes("manual") || combinedName.includes("lecture") || combinedName.includes("note")) {
        detectedType = context.materialTypes.find((t) => t.slug === "manuals");
      } else if (combinedName.includes("workbook")) {
        detectedType = context.materialTypes.find((t) => t.slug === "workbooks");
      } else {
        detectedType = context.materialTypes[0];
      }
    }

    // Course resolution
    const matchedCourse = context.courses.find((c) => {
      const codeRegex = new RegExp(c.code.replace(/\s+/g, "[_\\s-]?"), "i");
      return codeRegex.test(combinedName);
    });

    // Level resolution
    let level = 100;
    if (matchedCourse) {
      level = matchedCourse.level;
    } else {
      const levelMatch = combinedName.match(/\b(100|200|300|400|500)\b/);
      if (levelMatch) {
        level = parseInt(levelMatch[1], 10);
      }
    }

    // Department & School resolution
    let matchedDept = context.departments.find((d) => d.id === matchedCourse?.department_id);
    if (!matchedDept) {
      matchedDept = context.departments.find(
        (d) =>
          combinedName.includes(d.name.toLowerCase()) ||
          combinedName.includes(d.code.toLowerCase())
      );
    }

    let matchedSchool = context.schools.find((s) => s.id === matchedDept?.school_id);
    if (!matchedSchool) {
      matchedSchool = context.schools.find(
        (s) =>
          combinedName.includes(s.name.toLowerCase()) ||
          combinedName.includes(s.code.toLowerCase())
      );
    }

    // Fallbacks if not detected
    const finalSchool = matchedSchool || context.schools[0];
    const finalDept = matchedDept || context.departments[0];
    const finalCourse = matchedCourse || null;

    const classification: NebulaClassification = {
      material_type: detectedType?.name || "Past Questions",
      material_type_id: detectedType?.id,
      level,
      school: finalSchool?.name || "School of Science",
      school_id: finalSchool?.id,
      department: finalDept?.name || "Computer Science",
      department_id: finalDept?.id,
      course: finalCourse?.code || (matchedCourse ? matchedCourse.code : ""),
      course_id: finalCourse?.id,
      session: defaultSession,
      semester: defaultSemester,
      semester_id: defaultSemesterId,
    };

    const proposedFilename = formatNormalizedFilename(classification, primaryFile.name);

    // If course is missing or ambiguous, isolate the group!
    if (!finalCourse) {
      isolated.push({
        group_id: `grp-${Date.now()}-${index}`,
        source_file_ids: groupFiles.map((f) => f.id),
        original_filenames: originalNames,
        file_size: totalSize,
        mime_type: primaryFile.type,
        classification,
        proposed_filename: proposedFilename,
        status: "isolated",
        confidence: 0.45,
        isolation_reason:
          groupFiles.length > 1
            ? "Multi-page continuation detected without a definitive course header code."
            : "Ambiguous course code. Nebula could not automatically match this document to an active course.",
        warnings: ["Missing verified course code", "Review required before publishing"],
        created_at: new Date().toISOString(),
      });
    } else {
      approved.push({
        group_id: `grp-${Date.now()}-${index}`,
        source_file_ids: groupFiles.map((f) => f.id),
        original_filenames: originalNames,
        file_size: totalSize,
        mime_type: primaryFile.type,
        classification,
        proposed_filename: proposedFilename,
        status: "approved",
        confidence: 0.96,
        warnings:
          groupFiles.length > 1
            ? [`Grouped ${groupFiles.length} pages as continuous document for ${finalCourse.code}`]
            : [],
        created_at: new Date().toISOString(),
      });
    }
  }

  return {
    request_id: requestId,
    approved,
    isolated,
    rejected,
  };
}

/**
 * Re-evaluates an isolated group with administrator-supplied metadata corrections.
 */
export async function reevaluateIsolatedGroup(
  group: NebulaDocumentGroup,
  corrections: Partial<NebulaClassification>,
  context: NebulaSortingContext
): Promise<NebulaDocumentGroup> {
  const updatedClassification: NebulaClassification = {
    ...group.classification,
    ...corrections,
  };

  // Re-resolve IDs if names provided
  if (corrections.course) {
    const matched = context.courses.find(
      (c) => c.code.toLowerCase() === corrections.course?.toLowerCase()
    );
    if (matched) {
      updatedClassification.course = matched.code;
      updatedClassification.course_id = matched.id;
      updatedClassification.level = matched.level;
    }
  }

  if (corrections.department) {
    const matchedDept = context.departments.find(
      (d) => d.name.toLowerCase() === corrections.department?.toLowerCase()
    );
    if (matchedDept) {
      updatedClassification.department = matchedDept.name;
      updatedClassification.department_id = matchedDept.id;
    }
  }

  const proposedFilename = formatNormalizedFilename(
    updatedClassification,
    group.original_filenames[0]
  );

  return {
    ...group,
    classification: updatedClassification,
    proposed_filename: proposedFilename,
    status: "approved",
    confidence: 0.98,
    isolation_reason: undefined,
    warnings: ["Re-analyzed and approved with administrator metadata."],
  };
}
