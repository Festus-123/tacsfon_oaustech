import {
  initialMaterialTypes,
  initialSchools,
  initialDepartments,
  initialCourses,
} from "@/data/academic";

// ============================================================
// FILENAME PARSER FOR NORMALIZED UPLOADS
// Format: material_type__level__school__department__course__session.ext
// Example: past_questions__500__science__computer_science__CSC_308__2024-2025.pdf
// ============================================================

export interface ParsedFilenameMetadata {
  raw: string;
  isValid: boolean;
  fileExtension: string;
  materialTypeSlug?: string;
  level?: number;
  schoolCode?: string;
  departmentCode?: string;
  courseCode?: string;
  sessionName?: string;
  suggestedTitle?: string;
  matchedSchoolId?: string;
  matchedDepartmentId?: string;
  matchedCourseId?: string;
  matchedMaterialTypeId?: string;
  error?: string;
}

export function parseNormalizedFilename(filename: string): ParsedFilenameMetadata {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) {
    return { raw: filename, isValid: false, fileExtension: "", error: "Missing file extension" };
  }

  const ext = filename.substring(lastDot + 1).toLowerCase();
  const nameWithoutExt = filename.substring(0, lastDot);
  const parts = nameWithoutExt.split("__");

  if (parts.length < 5) {
    return {
      raw: filename,
      isValid: false,
      fileExtension: ext,
      error: "Expected format: type__level__school__department__course__session.ext",
    };
  }

  const [rawType, rawLevel, rawSchool, rawDept, rawCourse, rawSession] = parts;
  const level = parseInt(rawLevel, 10);
  const courseCode = rawCourse.replace(/_/g, " ").toUpperCase();
  const sessionName = rawSession ? rawSession.replace(/-/g, "/") : "2024/2025";

  // Match entities
  const matchedType = initialMaterialTypes.find(
    (t) => t.slug === rawType.toLowerCase() || t.name.toLowerCase().includes(rawType.toLowerCase())
  );
  const matchedSchool = initialSchools.find(
    (s) => s.code.toLowerCase() === rawSchool.toLowerCase() || s.name.toLowerCase().includes(rawSchool.toLowerCase())
  );
  const matchedDept = initialDepartments.find(
    (d) => d.code.toLowerCase() === rawDept.toLowerCase() || d.name.toLowerCase().includes(rawDept.toLowerCase())
  );
  const matchedCourse = initialCourses.find(
    (c) => c.code.replace(/\s+/g, "").toUpperCase() === courseCode.replace(/\s+/g, "").toUpperCase()
  );

  const typeLabel = matchedType ? matchedType.name : rawType.replace(/_/g, " ");
  const suggestedTitle = `${courseCode} ${typeLabel} (${sessionName})`;

  return {
    raw: filename,
    isValid: true,
    fileExtension: ext,
    materialTypeSlug: matchedType?.slug || rawType,
    level: isNaN(level) ? 300 : level,
    schoolCode: rawSchool,
    departmentCode: rawDept,
    courseCode,
    sessionName,
    suggestedTitle,
    matchedMaterialTypeId: matchedType?.id,
    matchedSchoolId: matchedSchool?.id,
    matchedDepartmentId: matchedDept?.id,
    matchedCourseId: matchedCourse?.id,
  };
}
