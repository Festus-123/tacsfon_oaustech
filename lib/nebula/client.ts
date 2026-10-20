import type { CourseScope, CourseScopeRule } from "@/lib/academic/course-scope";
import {
  COURSE_SCOPE_LABELS,
  normalizeCourseCode,
  courseCodeKey,
  levelFromCourseCode,
  normalizeSession,
  normalizeExamSemester,
  suggestScopeForNewCourse,
} from "@/lib/academic/course-scope";

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
  courses: {
    id: string;
    code: string;
    title: string;
    level: number;
    scope: CourseScope;
    department_id: string | null;
    school_id: string | null;
  }[];
  rules: CourseScopeRule[];
  levels: number[];
}

export interface NebulaClassification {
  material_type: string;
  material_type_id?: string;
  level: number;
  scope?: CourseScope;
  school: string;
  school_id?: string;
  department: string;
  department_id?: string;
  course: string;
  course_id?: string;
  course_title?: string;
  // Printed on the paper, e.g. "2023/2024" and "First Semester"
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
 * {material_type}-{level}lvl-{owner}-{course}-{session}-{semester}.{ext}
 * where owner is "general", the school, or school-department depending on course scope.
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
  const owner =
    classification.scope === "general"
      ? "general"
      : classification.scope === "school"
        ? sanitize(classification.school)
        : `${sanitize(classification.school)}-${sanitize(classification.department)}`;
  const courseSlug = (classification.course || "course").replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
  const sessionSlug = sanitize(classification.session);
  const semesterSlug = sanitize(classification.semester);

  return `${typeSlug}-${lvl}-${owner}-${courseSlug}-${sessionSlug}-${semesterSlug}.${ext}`;
}

/** What publishing this classification would create, for the admin confirmation. */
export function describePendingCreations(c: NebulaClassification): string[] {
  const items: string[] = [];
  if (c.scope !== "general" && c.school && !c.school_id) {
    items.push(`School "${c.school}"`);
  }
  if (c.scope === "department" && c.department && !c.department_id) {
    items.push(`Department "${c.department}"${c.school ? ` under ${c.school}` : ""}`);
  }
  if (c.course && !c.course_id) {
    const ownerName = c.scope === "general" ? "" : c.scope === "school" ? c.school : c.department;
    const owner = ownerName ? ` in ${ownerName}` : "";
    items.push(`Course ${c.course} (${COURSE_SCOPE_LABELS[c.scope || "department"]}${owner})`);
  }
  return items;
}

// ============================================================
// CLASSIFICATION RESOLUTION
// Turns text values (from Nebula or the admin) into Academic Hub records.
// Course code is the key; level, scope, school and department come from the
// course record or, for a new course, from the scope rules.
// ============================================================

const sameText = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const cleanName = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

export type RawClassification = Partial<Record<keyof NebulaClassification, string | number | null | undefined>>;

export function resolveClassification(
  raw: RawClassification,
  context: NebulaSortingContext
): { classification: NebulaClassification; problem?: string; notes: string[] } {
  const notes: string[] = [];
  const text = (key: keyof NebulaClassification) => cleanName(raw[key]);

  const materialType = context.materialTypes.find(
    (t) => sameText(t.name, text("material_type")) || sameText(t.slug, text("material_type"))
  );
  const code = normalizeCourseCode(text("course"));
  const session = normalizeSession(text("session")) || "";
  const semester = normalizeExamSemester(text("semester")) || "";

  const findSchool = (name: string) =>
    name ? context.schools.find((s) => sameText(s.name, name) || sameText(s.code, name)) : undefined;
  const findDepartment = (name: string, schoolId?: string) =>
    name
      ? context.departments.find(
          (d) => (sameText(d.name, name) || sameText(d.code, name)) && (!schoolId || d.school_id === schoolId)
        )
      : undefined;

  const course = code ? context.courses.find((c) => courseCodeKey(c.code) === courseCodeKey(code)) : undefined;

  let scope: CourseScope = "department";
  let school: NebulaSortingContext["schools"][number] | undefined;
  let department: NebulaSortingContext["departments"][number] | undefined;
  let schoolName = "";
  let departmentName = "";

  if (course) {
    scope = course.scope;
    department = context.departments.find((d) => d.id === course.department_id);
    school = context.schools.find((s) => s.id === (course.school_id || department?.school_id));
    schoolName = school?.name || "";
    departmentName = department?.name || "";
    notes.push(`${course.code} is a registered ${COURSE_SCOPE_LABELS[scope].toLowerCase()} course`);
  } else if (code) {
    const requested = text("scope") as CourseScope;
    const suggestion = suggestScopeForNewCourse(code, context.rules, context.departments);
    scope = ["general", "school", "department"].includes(requested) ? requested : suggestion.scope;

    if (scope === "school") {
      school = findSchool(text("school")) || context.schools.find((s) => s.id === suggestion.school_id);
      schoolName = school?.name || text("school");
    } else if (scope === "department") {
      const readSchool = findSchool(text("school"));
      department =
        findDepartment(text("department"), readSchool?.id) ||
        findDepartment(text("department")) ||
        (!text("department") ? context.departments.find((d) => d.id === suggestion.department_id) : undefined);
      departmentName = department?.name || text("department");
      school = context.schools.find((s) => s.id === department?.school_id) || readSchool;
      schoolName = school?.name || text("school");
    }
    notes.push(
      `${code} is not registered yet; ${COURSE_SCOPE_LABELS[scope].toLowerCase()} scope ${
        suggestion.rule ? `from the ${suggestion.rule.pattern} rule` : requested ? "chosen by the administrator" : "by default"
      }`
    );
  }

  const level = Number(raw.level) || course?.level || levelFromCourseCode(code) || 0;

  const classification: NebulaClassification = {
    material_type: materialType?.name || text("material_type"),
    material_type_id: materialType?.id,
    level,
    scope,
    school: scope === "general" ? "" : schoolName,
    school_id: scope === "general" ? undefined : school?.id,
    department: scope === "department" ? departmentName : "",
    department_id: scope === "department" ? department?.id : undefined,
    course: code || text("course"),
    course_id: course?.id,
    course_title: course?.title || text("course_title") || undefined,
    session,
    semester,
  };

  let problem: string | undefined;
  if (!materialType) {
    problem = "Material type could not be determined.";
  } else if (!code) {
    problem = text("course")
      ? `"${text("course")}" is not a valid course code (expected something like CSC 308).`
      : "Course code could not be determined from the document.";
  } else if (scope === "school" && !schoolName) {
    problem = `New course ${code}: choose the school it belongs to, or mark it General.`;
  } else if (scope === "department" && !departmentName) {
    problem = `New course ${code}: choose its department, or mark it General.`;
  } else if (scope !== "general" && !school && !schoolName) {
    problem = `New department "${departmentName}": choose the school it belongs to.`;
  } else if (materialType.slug === "past_questions" && (!session || !semester)) {
    problem = "The session or semester was not found for this past question. Enter them from the paper.";
  }

  return { classification, problem, notes };
}

// ============================================================
// NEBULA /sort-documents INTEGRATION
// Contract: Nebula project docs/DOCUMENT_SORTING_API.md
// ============================================================

const SORTING_SCHEMA = ["material_type", "level", "school", "department", "course", "session", "semester"];

// Nebula only has to read the material type and course code. Everything else is either
// derived by TACSFON from the course record/scope rules, or optional on the paper.
// Past questions also need the session and semester printed on the paper.
function requiredFieldsFor(materialType: NebulaSortingContext["materialTypes"][number] | undefined): string[] {
  return materialType?.slug === "past_questions"
    ? ["material_type", "course", "session", "semester"]
    : ["material_type", "course"];
}

// What each material type means, keyed by slug so the wording follows the database names
const MATERIAL_TYPE_MEANINGS: Record<string, string> = {
  past_questions: "any examination, test or quiz question paper",
  manuals: "lecture notes, practical/lab manuals or study guides",
  workbooks: "worksheets, exercises or problem sets",
  materials: "other reading material, slides or textbooks",
};

function fieldDescriptions(context: NebulaSortingContext): Record<string, string> {
  const meanings = context.materialTypes
    .map((t) => `'${t.name}' = ${MATERIAL_TYPE_MEANINGS[t.slug] || t.name}`)
    .join("; ");
  const pastQuestions = context.materialTypes.find((t) => t.slug === "past_questions")?.name || "Past Questions";
  return {
    material_type: `Decide from what the document IS, not from a printed label: ${meanings}. A question paper is '${pastQuestions}' even though those words are not printed on it.`.slice(
      0,
      500
    ),
    level: "Course level (100-500). Usually the first digit of the course code: CSC 308 is 300 level.",
    school: "The university school/faculty, only if printed on the document.",
    department: "The department offering the course, only if printed on the document.",
    course: "The course code only, three letters and three digits, e.g. CSC 308 or GST 111.",
    session:
      "Academic session printed on the document, usually in the exam heading, e.g. 2023/2024 (also written 2023/24 or 2023-2024).",
    semester:
      "First Semester or Second Semester, usually in the exam heading (Harmattan = First Semester, Rain = Second Semester).",
  };
}

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

function buildSortingForm(
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  requestId: string,
  options: {
    // Values the administrator supplied (e.g. the material type chosen for the upload).
    // Nebula uses them as given instead of reading them from the documents.
    adminValues?: Record<string, string>;
    extraAllowed?: { school: string[]; department: string[] };
    previousGroup?: NebulaDocumentGroup;
  } = {}
): FormData {
  const { adminValues = {}, extraAllowed, previousGroup } = options;
  const chosenType = context.materialTypes.find((t) => t.name === adminValues.material_type);

  const form = new FormData();
  form.append("task", "document_sorting");
  form.append("request_id", requestId);
  form.append("schema", JSON.stringify(SORTING_SCHEMA));
  form.append("required_fields", JSON.stringify(requiredFieldsFor(chosenType)));
  form.append("field_descriptions", JSON.stringify(fieldDescriptions(context)));
  form.append(
    "allowed_values",
    JSON.stringify({
      material_type: unique(context.materialTypes.map((t) => t.name)),
      level: context.levels.map(String),
      // New schools/departments typed by the admin must be allowed for Nebula to accept them
      school: unique([...context.schools.map((s) => s.name), ...(extraAllowed?.school || [])]),
      department: unique([...context.departments.map((d) => d.name), ...(extraAllowed?.department || [])]),
      // Unrestricted: new courses are allowed and created on approval
      course: [],
      session: [],
      semester: [],
    })
  );

  if (Object.keys(adminValues).length > 0) {
    form.append("additional_context", JSON.stringify({ ...adminValues, source: "administrator" }));
  }
  if (previousGroup) {
    form.append("previous_result", JSON.stringify(previousGroup));
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

const EMPTY_CLASSIFICATION: NebulaClassification = {
  material_type: "",
  level: 0,
  school: "",
  department: "",
  course: "",
  session: "",
  semester: "",
};

function mapNebulaResponse(
  data: NebulaResponse,
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  adminOverrides: RawClassification = {}
): NebulaSortResult {
  const now = new Date().toISOString();

  // file_001, file_002 ... follow the order the files were sent in
  const fileFor = (sf: { file_id: string; original_filename: string }) => {
    const index = Number(sf.file_id.replace(/\D/g, "")) - 1;
    return files[index] || files.find((f) => f.name === sf.original_filename);
  };

  const toGroup = (g: NebulaGroup): NebulaDocumentGroup => {
    const groupFiles = g.source_files.map(fileFor).filter((f): f is RawUploadedFile => !!f);
    const { classification, problem, notes } = resolveClassification(
      { ...(g.classification || {}), ...adminOverrides },
      context
    );
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
      isolation_reason: isolated
        ? (g.status !== "classified" ? g.reason : problem) || problem || "Nebula could not classify this document."
        : undefined,
      warnings: [
        ...(g.warnings || []),
        ...(g.possible_duplicate_of ? [`Possibly the same document as ${g.possible_duplicate_of}`] : []),
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
      classification: EMPTY_CLASSIFICATION,
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
  requestId: string = `req-${Date.now()}`,
  options: { materialType?: string } = {}
): Promise<NebulaSortResult> {
  // A material type chosen for the whole upload is sent as an administrator value;
  // without one ("Auto-detect"), Nebula decides it from each document
  const chosenType = context.materialTypes.find((t) => sameText(t.name, options.materialType));
  const adminValues: Record<string, string> = chosenType ? { material_type: chosenType.name } : {};

  const outcome = await postToNebula(buildSortingForm(files, context, requestId, { adminValues }));
  if (outcome.data) {
    return mapNebulaResponse(outcome.data, files, context);
  }

  return {
    ...runSmartFallbackClassifier(files, context, requestId, chosenType?.name),
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
  const supplied: Record<string, string> = {};
  const extraAllowed = { school: [] as string[], department: [] as string[] };

  const value = (key: keyof NebulaClassification) => cleanName(String(corrections[key] ?? ""));

  const materialType = context.materialTypes.find((t) => sameText(t.name, value("material_type")));
  if (materialType) supplied.material_type = materialType.name;

  const code = normalizeCourseCode(value("course"));
  if (code) supplied.course = code;

  const level = Number(corrections.level);
  if (context.levels.includes(level)) supplied.level = String(level);

  for (const field of ["school", "department"] as const) {
    const name = value(field);
    if (!name) continue;
    const existing =
      field === "school"
        ? context.schools.find((s) => sameText(s.name, name))?.name
        : context.departments.find((d) => sameText(d.name, name))?.name;
    supplied[field] = existing || name;
    if (!existing) extraAllowed[field].push(name);
  }

  const session = normalizeSession(value("session"));
  if (session) supplied.session = session;
  const semester = normalizeExamSemester(value("semester"));
  if (semester) supplied.semester = semester;

  const requestId = `reprocess-${Date.now()}`;
  const outcome = await postToNebula(
    buildSortingForm(files, context, requestId, { adminValues: supplied, extraAllowed, previousGroup: group })
  );
  if (!outcome.data) return { result: null, notice: outcome.notice };

  // Scope and title are TACSFON-only fields, so they are applied on top of Nebula's answer
  const overrides: RawClassification = {};
  if (corrections.scope) overrides.scope = corrections.scope;
  if (corrections.course_title) overrides.course_title = corrections.course_title;
  return { result: mapNebulaResponse(outcome.data, files, context, overrides) };
}

/**
 * Local filename-based classifier, used only when Nebula is unavailable.
 * Files whose names carry the same course code are grouped together.
 */
function runSmartFallbackClassifier(
  files: RawUploadedFile[],
  context: NebulaSortingContext,
  requestId: string,
  chosenMaterialType?: string
): NebulaSortResult {
  const now = new Date().toISOString();
  const buckets = new Map<string, RawUploadedFile[]>();

  for (const file of files) {
    const match = file.name.match(/([A-Za-z]{3})[\s_-]?(\d{3})/);
    const key = match ? courseCodeKey(`${match[1]}${match[2]}`) : file.id;
    buckets.set(key, [...(buckets.get(key) || []), file]);
  }

  const groups: NebulaDocumentGroup[] = [];
  let index = 0;
  for (const groupFiles of buckets.values()) {
    index++;
    const names = groupFiles.map((f) => f.name).join(" ");
    const lower = names.toLowerCase();
    const codeMatch = names.match(/([A-Za-z]{3})[\s_-]?(\d{3})/);

    const materialType =
      context.materialTypes.find((t) => t.name === chosenMaterialType) ||
      context.materialTypes.find((t) => lower.includes(t.slug) || lower.includes(t.name.toLowerCase())) ||
      (/(past|pq|exam|test)/.test(lower)
        ? context.materialTypes.find((t) => t.slug === "past_questions")
        : /(manual|lecture|note)/.test(lower)
          ? context.materialTypes.find((t) => t.slug === "manuals")
          : /workbook/.test(lower)
            ? context.materialTypes.find((t) => t.slug === "workbooks")
            : undefined);

    const { classification, problem, notes } = resolveClassification(
      {
        material_type: materialType?.name,
        course: codeMatch ? `${codeMatch[1]} ${codeMatch[2]}` : "",
        session: names,
        semester: lower.replace(/[_-]/g, " "),
      },
      context
    );

    groups.push({
      group_id: `${requestId}:fallback_${index}`,
      source_file_ids: groupFiles.map((f) => f.id),
      original_filenames: groupFiles.map((f) => f.name),
      file_size: groupFiles.reduce((acc, f) => acc + f.size, 0),
      mime_type: groupFiles[0].type,
      classification,
      proposed_filename: formatNormalizedFilename(classification, groupFiles[0].name),
      status: problem ? "isolated" : "approved",
      confidence: problem ? 0.3 : 0.6,
      isolation_reason: problem,
      warnings: ["Classified from the filename only (Nebula unavailable). Check before publishing."],
      evidence: notes,
      created_at: now,
    });
  }

  return {
    request_id: requestId,
    approved: groups.filter((g) => g.status === "approved"),
    isolated: groups.filter((g) => g.status === "isolated"),
    rejected: [],
  };
}

/**
 * Applies administrator-supplied metadata locally (when Nebula cannot re-read the document).
 */
export async function reevaluateIsolatedGroup(
  group: NebulaDocumentGroup,
  corrections: Partial<NebulaClassification>,
  context: NebulaSortingContext
): Promise<NebulaDocumentGroup> {
  const { classification, problem, notes } = resolveClassification(
    { ...group.classification, ...corrections },
    context
  );

  return {
    ...group,
    classification,
    proposed_filename: formatNormalizedFilename(classification, group.original_filenames[0] || "file.pdf"),
    status: problem ? "isolated" : "approved",
    confidence: problem ? group.confidence : 0.98,
    isolation_reason: problem,
    warnings: ["Updated with administrator metadata."],
    evidence: [...(group.evidence || []), ...notes],
  };
}
