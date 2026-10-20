export interface RawUploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  bytes?: Uint8Array;
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
  evidence?: string[];
  created_at: string;
}

export interface NebulaSortResult {
  request_id: string;
  approved: NebulaDocumentGroup[];
  isolated: NebulaDocumentGroup[];
  rejected: NebulaDocumentGroup[];
  // Set by TACSFON: whether Nebula answered or the local fallback classifier ran, and why
  source?: "nebula" | "fallback";
  notice?: string;
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

// ============================================================
// NEBULA /sort-documents INTEGRATION
// Contract: Nebula project docs/DOCUMENT_SORTING_API.md
// ============================================================

const SORTING_SCHEMA = ["material_type", "level", "school", "department", "course", "session", "semester"];

// Nebula only has to read the material type and course from the document. Level, department
// and school are resolved by TACSFON from the course record (deterministic, not LLM-guessed);
// session and semester are often not printed, so they stay optional.
const REQUIRED_FIELDS = ["material_type", "course"];

const FIELD_DESCRIPTIONS: Record<string, string> = {
  material_type:
    "Past Questions = past examination or test question papers; Manuals / Lecture Notes = lecture notes, practical manuals, study guides; Workbooks = worksheets and exercises; Materials = other reading material, slides, textbooks.",
  level: "Course level (100-500). Usually the first digit of the course code: CSC 308 is 300 level.",
  school: "The university school/faculty, only if printed on the document.",
  department: "The department offering the course, only if printed on the document.",
  course: "The course code only, e.g. CSC 308 (three letters, a space, three digits).",
  session: "Academic session printed on the document, e.g. 2023/2024.",
  semester: "First Semester or Second Semester, if printed on the document.",
};

// Vercel functions on this route run for up to 300s (route maxDuration); leave headroom
const NEBULA_TIMEOUT_MS = 280_000;

interface NebulaSourceFile {
  file_id: string;
  original_filename: string;
  page_numbers?: number[];
}

interface NebulaGroup {
  group_id: string;
  status: "classified" | "isolated";
  source_files: NebulaSourceFile[];
  classification: Record<string, string | null>;
  confidence: "high" | "medium" | "low" | "insufficient";
  reason: string | null;
  isolation_reasons?: string[];
  evidence?: string[];
  warnings?: string[];
  possible_duplicate_of?: string | null;
}

interface NebulaResponse {
  request_id: string;
  groups: NebulaGroup[];
  isolated: NebulaGroup[];
  rejected: { file_id: string; original_filename: string; reason_code: string; reason: string }[];
  duplicates?: { file_id: string; original_filename: string; duplicate_of_file_id: string; reason: string }[];
}

const CONFIDENCE_SCORE: Record<NebulaGroup["confidence"], number> = {
  high: 0.95,
  medium: 0.75,
  low: 0.4,
  insufficient: 0.1,
};

const normalizeCode = (code: string) => code.replace(/\s+/g, "").toUpperCase();
const sameText = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

function buildSortingForm(
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  requestId: string,
  reprocess?: { corrections: Record<string, string>; previousGroup: NebulaDocumentGroup }
): FormData {
  const form = new FormData();
  form.append("task", "document_sorting");
  form.append("request_id", requestId);
  form.append("schema", JSON.stringify(SORTING_SCHEMA));
  form.append("required_fields", JSON.stringify(REQUIRED_FIELDS));
  form.append("field_descriptions", JSON.stringify(FIELD_DESCRIPTIONS));
  form.append(
    "allowed_values",
    JSON.stringify({
      material_type: unique(context.materialTypes.map((t) => t.name)),
      level: context.levels.map(String),
      school: unique(context.schools.map((s) => s.name)),
      department: unique(context.departments.map((d) => d.name)),
      course: unique(context.courses.map((c) => c.code)),
      // Unrestricted: the session/semester printed on a paper is rarely a registered access semester
      session: [],
      semester: [],
    })
  );

  if (reprocess) {
    form.append(
      "additional_context",
      JSON.stringify({ ...reprocess.corrections, source: "administrator" })
    );
    form.append("previous_result", JSON.stringify(reprocess.previousGroup));
  }

  // Files must be sent in page order: Nebula uses the order for continuation/boundary reasoning
  for (const file of files) {
    const blob = new Blob([file.bytes ? new Uint8Array(file.bytes) : new Uint8Array()], { type: file.type });
    form.append("files", blob, file.name);
  }
  return form;
}

async function postToNebula(
  form: FormData
): Promise<{ data: NebulaResponse; notice?: undefined } | { data?: undefined; notice: string }> {
  const nebulaUrl = process.env.NEBULA_API_URL;
  const nebulaApiKey = process.env.NEBULA_API_KEY;

  if (!nebulaUrl) return { notice: "NEBULA_API_URL is not configured on the server." };
  if (!nebulaApiKey) return { notice: "NEBULA_API_KEY is not configured on the server." };

  try {
    const response = await fetch(`${nebulaUrl.replace(/\/+$/, "")}/sort-documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${nebulaApiKey}` },
      body: form,
      signal: AbortSignal.timeout(NEBULA_TIMEOUT_MS),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const code = body?.error?.code ? ` (${body.error.code})` : "";
      const message = body?.error?.message ? `: ${body.error.message}` : "";
      console.warn(`Nebula returned HTTP ${response.status}${code}${message}`);
      return { notice: `Nebula returned HTTP ${response.status}${code}${message}` };
    }

    if (!body || !Array.isArray(body.groups) || !Array.isArray(body.isolated)) {
      return { notice: "Nebula returned a response in an unexpected format." };
    }

    return { data: body as NebulaResponse };
  } catch (err) {
    console.warn("Nebula connection timed out or unreachable:", err);
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      notice: timedOut
        ? `Nebula did not respond within ${NEBULA_TIMEOUT_MS / 1000} seconds. Try fewer files per upload.`
        : "Nebula could not be reached from the server.",
    };
  }
}

/**
 * Resolves Nebula's text values against the live Academic Hub structure.
 * Department, school and level come from the matched course when Nebula did not read them.
 * Returns the classification plus a reason when the group cannot be resolved safely.
 */
function resolveClassification(
  raw: Record<string, string | null>,
  context: NebulaSortingContext
): { classification: NebulaClassification; problem?: string; notes: string[] } {
  const notes: string[] = [];
  const materialType = context.materialTypes.find(
    (t) => sameText(t.name, raw.material_type) || sameText(t.slug, raw.material_type)
  );

  const readDepartment = context.departments.find(
    (d) => sameText(d.name, raw.department) || sameText(d.code, raw.department)
  );
  const readSchool = context.schools.find((s) => sameText(s.name, raw.school) || sameText(s.code, raw.school));

  const courseCode = raw.course ? normalizeCode(raw.course) : "";
  let candidates = courseCode ? context.courses.filter((c) => normalizeCode(c.code) === courseCode) : [];
  if (readDepartment) {
    const inDept = candidates.filter((c) => c.department_id === readDepartment.id);
    if (inDept.length > 0) candidates = inDept;
  } else if (readSchool && candidates.length > 1) {
    const deptIdsInSchool = context.departments.filter((d) => d.school_id === readSchool.id).map((d) => d.id);
    const inSchool = candidates.filter((c) => deptIdsInSchool.includes(c.department_id));
    if (inSchool.length > 0) candidates = inSchool;
  }

  // A shared course (e.g. GST 131) may exist under several departments; prefer the one whose
  // department code matches the course prefix (CSC 308 -> Computer Science / CSC)
  if (candidates.length > 1) {
    const prefix = courseCode.replace(/\d+$/, "");
    const byPrefix = candidates.filter((c) =>
      context.departments.some((d) => d.id === c.department_id && d.code.toUpperCase() === prefix)
    );
    if (byPrefix.length === 1) candidates = byPrefix;
  }

  const course = candidates.length === 1 ? candidates[0] : undefined;
  const department =
    readDepartment || context.departments.find((d) => d.id === course?.department_id);
  const school = readSchool || context.schools.find((s) => s.id === department?.school_id);
  const level = Number(raw.level) || course?.level || 0;

  if (course && !readDepartment && department) {
    notes.push(`department: '${department.name}' taken from the ${course.code} course record`);
  }

  const semester = context.semesters.find(
    (s) => sameText(s.name, raw.semester) && (!raw.session || sameText(s.academic_session_name, raw.session))
  );

  const classification: NebulaClassification = {
    material_type: materialType?.name || raw.material_type || "",
    material_type_id: materialType?.id,
    level,
    school: school?.name || raw.school || "",
    school_id: school?.id,
    department: department?.name || raw.department || "",
    department_id: department?.id,
    course: course?.code || raw.course || "",
    course_id: course?.id,
    session: raw.session || semester?.academic_session_name || "",
    semester: raw.semester || "",
    semester_id: semester?.id,
  };

  let problem: string | undefined;
  if (!materialType) {
    problem = "Material type could not be determined.";
  } else if (!courseCode) {
    problem = "Course code could not be determined from the document.";
  } else if (candidates.length === 0) {
    problem = `Course ${raw.course} is not registered under Academic Structure (or not under the department on the document).`;
  } else if (!course) {
    problem = `${raw.course} is offered by several departments and the document does not say which. Choose the department.`;
  }

  return { classification, problem, notes };
}

function mapNebulaResponse(
  data: NebulaResponse,
  files: RawUploadedFile[],
  context: NebulaSortingContext
): NebulaSortResult {
  const now = new Date().toISOString();

  // file_001, file_002 ... follow the order the files were sent in
  const fileFor = (sf: { file_id: string; original_filename: string }) => {
    const index = Number(sf.file_id.replace(/\D/g, "")) - 1;
    return files[index] || files.find((f) => f.name === sf.original_filename);
  };

  const toGroup = (g: NebulaGroup): NebulaDocumentGroup => {
    const groupFiles = g.source_files.map(fileFor).filter((f): f is RawUploadedFile => !!f);
    const { classification, problem, notes } = resolveClassification(g.classification || {}, context);
    const isolated = g.status !== "classified" || !!problem;
    const types = unique(groupFiles.map((f) => f.type));

    return {
      group_id: `${data.request_id}:${g.group_id}`,
      source_file_ids: groupFiles.map((f) => f.id),
      original_filenames: groupFiles.map((f) => f.name),
      file_size: groupFiles.reduce((acc, f) => acc + f.size, 0),
      mime_type: types.length === 1 ? types[0] : "application/pdf",
      classification,
      proposed_filename: formatNormalizedFilename(classification, groupFiles[0]?.name || "file.pdf"),
      status: isolated ? "isolated" : "approved",
      confidence: CONFIDENCE_SCORE[g.confidence] ?? 0.5,
      isolation_reason: isolated ? g.reason || problem || "Nebula could not classify this document." : undefined,
      warnings: [
        ...(g.warnings || []),
        ...(g.possible_duplicate_of ? [`Possibly the same document as ${g.possible_duplicate_of}`] : []),
        ...(g.status === "classified" && problem ? [problem] : []),
      ],
      evidence: [...(g.evidence || []), ...notes],
      created_at: now,
    };
  };

  const mapped = [...data.groups, ...data.isolated].map(toGroup);

  const rejected: NebulaDocumentGroup[] = [
    ...data.rejected.map((r) => ({ ...r, why: r.reason })),
    ...(data.duplicates || []).map((d) => ({ ...d, why: d.reason })),
  ].map((r) => {
    const file = fileFor(r);
    return {
      group_id: `${data.request_id}:${r.file_id}`,
      source_file_ids: file ? [file.id] : [],
      original_filenames: [r.original_filename],
      file_size: file?.size || 0,
      mime_type: file?.type || "application/octet-stream",
      classification: {
        material_type: "",
        level: 0,
        school: "",
        department: "",
        course: "",
        session: "",
        semester: "",
      },
      proposed_filename: r.original_filename,
      status: "rejected" as const,
      confidence: 0,
      isolation_reason: r.why,
      warnings: [],
      created_at: now,
    };
  });

  return {
    request_id: data.request_id,
    approved: mapped.filter((g) => g.status === "approved"),
    isolated: mapped.filter((g) => g.status === "isolated"),
    rejected,
    source: "nebula",
  };
}

/**
 * Sends a sorting request to Nebula AI backend or runs intelligent local classification fallback.
 */
export async function sendSortingRequestToNebula(
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  requestId: string = `req-${Date.now()}`
): Promise<NebulaSortResult> {
  const outcome = await postToNebula(buildSortingForm(files, context, requestId));
  if (outcome.data) {
    return mapNebulaResponse(outcome.data, files, context);
  }

  // Smart fallback document analyzer
  return {
    ...runSmartFallbackClassifier(files, context, requestId),
    source: "fallback",
    notice: `${outcome.notice} Results below come from the local filename-based fallback classifier, not Nebula.`,
  };
}

/**
 * Re-sends an isolated group's raw files to Nebula with administrator-supplied values
 * (Nebula contract §6). Returns null with a notice when Nebula cannot be used.
 */
export async function reprocessGroupWithNebula(
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  group: NebulaDocumentGroup,
  corrections: Partial<NebulaClassification>
): Promise<{ result: NebulaSortResult | null; notice?: string }> {
  // Only schema fields with values Nebula will accept (restricted fields must be allowed values)
  const allowed: Record<string, string[]> = {
    material_type: context.materialTypes.map((t) => t.name),
    level: context.levels.map(String),
    school: context.schools.map((s) => s.name),
    department: context.departments.map((d) => d.name),
    course: context.courses.map((c) => c.code),
  };
  const supplied: Record<string, string> = {};
  for (const field of SORTING_SCHEMA) {
    const value = corrections[field as keyof NebulaClassification];
    if (value === undefined || value === null || String(value).trim() === "") continue;
    const text = String(value).trim();
    const options = allowed[field];
    if (options) {
      const match = options.find((o) => sameText(o, text) || (field === "course" && normalizeCode(o) === normalizeCode(text)));
      if (match) supplied[field] = match;
    } else {
      supplied[field] = text;
    }
  }

  const requestId = `reprocess-${Date.now()}`;
  const outcome = await postToNebula(
    buildSortingForm(files, context, requestId, { corrections: supplied, previousGroup: group })
  );
  if (!outcome.data) return { result: null, notice: outcome.notice };
  return { result: mapNebulaResponse(outcome.data, files, context) };
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
  for (const [, groupFiles] of groupedBuckets.entries()) {
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
