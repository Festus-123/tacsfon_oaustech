"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  Check,
  AlertCircle,
  Eye,
  Trash2,
  Lock,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  AcademicMaterial,
  MaterialType,
  School,
  Department,
  Course,
  Semester,
} from "@/data/academic";
import { parseNormalizedFilename, ParsedFilenameMetadata } from "@/lib/supabase/academic";
import { Button } from "@/components/ui/button";

interface MaterialsManagerProps {
  initialMaterials: AcademicMaterial[];
  materialTypes: MaterialType[];
  schools: School[];
  departments: Department[];
  courses: Course[];
  semesters: Semester[];
}

interface StagedUpload {
  id: string;
  file: File;
  parsed: ParsedFilenameMetadata;
  title: string;
  materialTypeId: string;
  schoolId: string;
  departmentId: string;
  courseId: string;
  level: number;
  semesterId: string;
  status: "pending_review" | "approved" | "rejected";
}

export function MaterialsManager({
  initialMaterials,
  materialTypes,
  schools,
  departments,
  courses,
  semesters,
}: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<AcademicMaterial[]>(initialMaterials);
  const [stagedUploads, setStagedUploads] = useState<StagedUpload[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [search, setSearch] = useState("");

  const defaultSemester = semesters[0]?.id || "sem-2024-first";

  // Handle file selection and parsing
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newStaged: StagedUpload[] = [];

    Array.from(files).forEach((file) => {
      const parsed = parseNormalizedFilename(file.name);

      const matchedType = materialTypes.find((t) => t.id === parsed.matchedMaterialTypeId) || materialTypes[0];
      const matchedSchool = schools.find((s) => s.id === parsed.matchedSchoolId) || schools[0];
      const matchedDept = departments.find((d) => d.id === parsed.matchedDepartmentId) || departments[0];
      const matchedCourse = courses.find((c) => c.id === parsed.matchedCourseId) || courses[0];

      newStaged.push({
        id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        parsed,
        title: parsed.suggestedTitle || file.name,
        materialTypeId: matchedType?.id || "",
        schoolId: matchedSchool?.id || "",
        departmentId: matchedDept?.id || "",
        courseId: matchedCourse?.id || "",
        level: parsed.level || 300,
        semesterId: defaultSemester,
        status: "pending_review",
      });
    });

    setStagedUploads((prev) => [...newStaged, ...prev]);
    setShowUploadModal(true);
    toast.info(`${files.length} file(s) parsed for metadata review.`);
  };

  // Publish / approve a staged upload
  const handleApproveStaged = (item: StagedUpload) => {
    // Check duplicates
    const duplicate = materials.find(
      (m) => m.original_filename.toLowerCase() === item.file.name.toLowerCase()
    );

    if (duplicate) {
      if (!confirm(`Warning: A material with filename "${item.file.name}" already exists. Publish anyway?`)) {
        return;
      }
    }

    const typeObj = materialTypes.find((t) => t.id === item.materialTypeId);
    const schoolObj = schools.find((s) => s.id === item.schoolId);
    const deptObj = departments.find((d) => d.id === item.departmentId);
    const courseObj = courses.find((c) => c.id === item.courseId);
    const semesterObj = semesters.find((s) => s.id === item.semesterId);

    const newMaterial: AcademicMaterial = {
      id: `mat-${Date.now()}`,
      title: item.title,
      material_type_id: item.materialTypeId,
      material_type_name: typeObj?.name,
      material_type_slug: typeObj?.slug,
      school_id: item.schoolId,
      school_name: schoolObj?.name,
      department_id: item.departmentId,
      department_name: deptObj?.name,
      course_id: item.courseId,
      course_code: courseObj?.code,
      course_title: courseObj?.title,
      level: item.level,
      academic_session_id: "session-2024-2025",
      academic_session_name: "2024/2025",
      semester_id: item.semesterId,
      semester_name: semesterObj?.name,
      original_filename: item.file.name,
      storage_path: `sem-2024-first/${item.file.name}`,
      file_type: item.parsed.fileExtension || "pdf",
      mime_type: item.file.type || "application/pdf",
      file_size: item.file.size,
      page_count: 15,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    setStagedUploads((prev) => prev.filter((s) => s.id !== item.id));
    toast.success(`Published: ${newMaterial.title}`);
  };

  const handleTogglePublish = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_published: !m.is_published } : m))
    );
    toast.success("Publication status updated");
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    toast.success("Material removed");
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.course_code?.toLowerCase().includes(search.toLowerCase()) ||
      m.original_filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/academic"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Academic Hub
          </Link>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Course Materials & Upload Review
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Process pre-normalized course documents, review parsed metadata, and publish to private storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-xs transition">
            <Upload className="w-4 h-4" />
            <span>Upload Normalized Files</span>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Normalized Filename Convention Tip */}
      <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 text-xs text-stone-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-stone-800 uppercase tracking-wider">
          <Info className="w-4 h-4 text-blue-600" />
          Standard Normalized Upload Format
        </div>
        <p className="text-stone-500 font-mono text-[11px] bg-white p-2 rounded-lg border border-stone-200 overflow-x-auto">
          material_type__level__school__department__course__session.ext
        </p>
        <p className="text-stone-500 text-[11px]">
          Example: <code>past_questions__500__science__computer_science__CSC_308__2024-2025.pdf</code>
        </p>
      </div>

      {/* Staged Uploads Pending Review Section */}
      {stagedUploads.length > 0 && (
        <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-serif font-bold text-amber-950 text-base">
                Pending Metadata Review ({stagedUploads.length})
              </h2>
            </div>
            <span className="text-xs text-amber-800">Review and approve before publishing</span>
          </div>

          <div className="space-y-3">
            {stagedUploads.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-amber-200 p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2 font-mono text-xs text-stone-700">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-stone-900 truncate max-w-md">
                      {item.file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApproveStaged(item)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setStagedUploads((prev) => prev.filter((s) => s.id !== item.id))}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-stone-500 font-semibold uppercase text-[10px]">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStagedUploads((prev) =>
                          prev.map((s) => (s.id === item.id ? { ...s, title: val } : s))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-500 font-semibold uppercase text-[10px]">Category</label>
                    <select
                      value={item.materialTypeId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStagedUploads((prev) =>
                          prev.map((s) => (s.id === item.id ? { ...s, materialTypeId: val } : s))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg bg-stone-50"
                    >
                      {materialTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-500 font-semibold uppercase text-[10px]">Course</label>
                    <select
                      value={item.courseId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStagedUploads((prev) =>
                          prev.map((s) => (s.id === item.id ? { ...s, courseId: val } : s))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg bg-stone-50"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} ({c.title})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-500 font-semibold uppercase text-[10px]">Level</label>
                    <select
                      value={item.level}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStagedUploads((prev) =>
                          prev.map((s) => (s.id === item.id ? { ...s, level: val } : s))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg bg-stone-50"
                    >
                      {[100, 200, 300, 400, 500].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl} Level
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Materials Catalog Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              Published Course Library ({materials.length})
            </h2>
            <span className="text-xs text-stone-500">
              Protected in private Supabase bucket <code>academic-materials</code>
            </span>
          </div>

          <input
            type="text"
            placeholder="Filter published materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50/60"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Course & Level</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMaterials.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900 text-xs sm:text-sm line-clamp-1">
                      {item.title}
                    </div>
                    <span className="font-mono text-[10px] text-stone-400">
                      {item.original_filename}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-700">{item.course_code}</span>
                    <span className="text-[11px] text-stone-500 block">{item.level} Level</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-[11px]">
                      {item.material_type_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item.id)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                        item.is_published
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-500 border border-stone-200"
                      }`}
                    >
                      {item.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/academic/materials/${item.id}`}
                        target="_blank"
                        className="p-1 rounded text-stone-500 hover:text-blue-600"
                        title="View Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1 rounded text-stone-400 hover:text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
