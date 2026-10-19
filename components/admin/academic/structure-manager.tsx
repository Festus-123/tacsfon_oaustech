"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { School, Department, Course } from "@/data/academic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StructureEntity = "schools" | "departments" | "courses";

async function saveStructureRecord<T>(entity: StructureEntity, payload: object): Promise<T | null> {
  try {
    const res = await fetch(`/api/admin/academic/structure/${entity}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error || "Failed to save record.");
      return null;
    }
    return data.record as T;
  } catch {
    toast.error("Network error while saving record.");
    return null;
  }
}

interface StructureManagerProps {
  initialSchools: School[];
  initialDepartments: Department[];
  initialCourses: Course[];
}

export function StructureManager({
  initialSchools,
  initialDepartments,
  initialCourses,
}: StructureManagerProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "departments" | "schools">("courses");
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // New Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    department_id: departments[0]?.id || "",
    code: "",
    title: "",
    level: 300,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.department_id) {
      toast.error("Please add a department first.");
      return;
    }
    if (!courseForm.code.trim() || !courseForm.title.trim()) {
      toast.error("Please provide both course code and title.");
      return;
    }

    setIsSaving(true);
    type CourseRecord = Course & { departments?: { name?: string } };
    const saved = await saveStructureRecord<CourseRecord>("courses", {
      department_id: courseForm.department_id,
      code: courseForm.code.trim(),
      title: courseForm.title.trim(),
      level: Number(courseForm.level),
    });
    setIsSaving(false);
    if (!saved) return;

    const newCourse: Course = { ...saved, department_name: saved.departments?.name };
    setCourses((prev) => [newCourse, ...prev]);
    toast.success(`Course ${newCourse.code} added!`);
    setShowCourseModal(false);
    setCourseForm({
      department_id: departments[0]?.id || "",
      code: "",
      title: "",
      level: 300,
    });
  };

  // New Department Modal State
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    school_id: schools[0]?.id || "",
    name: "",
    code: "",
  });

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentForm.school_id) {
      toast.error("Please add a school / faculty first.");
      return;
    }
    if (!departmentForm.name.trim() || !departmentForm.code.trim()) {
      toast.error("Please provide both department name and code.");
      return;
    }

    setIsSaving(true);
    type DepartmentRecord = Department & { schools?: { name?: string } };
    const saved = await saveStructureRecord<DepartmentRecord>("departments", {
      school_id: departmentForm.school_id,
      name: departmentForm.name.trim(),
      code: departmentForm.code.trim(),
    });
    setIsSaving(false);
    if (!saved) return;

    const newDepartment: Department = { ...saved, school_name: saved.schools?.name };
    setDepartments((prev) => [newDepartment, ...prev]);
    toast.success(`Department ${newDepartment.name} added!`);
    setShowDepartmentModal(false);
    setDepartmentForm({
      school_id: schools[0]?.id || "",
      name: "",
      code: "",
    });
  };

  // New School / Faculty Modal State
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolForm, setSchoolForm] = useState({
    name: "",
    code: "",
  });

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name.trim() || !schoolForm.code.trim()) {
      toast.error("Please provide both faculty name and code.");
      return;
    }

    setIsSaving(true);
    const saved = await saveStructureRecord<School>("schools", {
      name: schoolForm.name.trim(),
      code: schoolForm.code.trim(),
    });
    setIsSaving(false);
    if (!saved) return;

    setSchools((prev) => [saved, ...prev]);
    toast.success(`Faculty ${saved.name} added!`);
    setShowSchoolModal(false);
    setSchoolForm({ name: "", code: "" });
  };

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    entity: StructureEntity;
    id: string;
    label: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { entity, id, label } = deleteTarget;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/academic/structure/${entity}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete record.");
        return;
      }

      // Mirror the database ON DELETE CASCADE locally
      if (entity === "schools") {
        const removedDeptIds = departments.filter((d) => d.school_id === id).map((d) => d.id);
        setSchools((prev) => prev.filter((s) => s.id !== id));
        setDepartments((prev) => prev.filter((d) => d.school_id !== id));
        setCourses((prev) => prev.filter((c) => !removedDeptIds.includes(c.department_id)));
      } else if (entity === "departments") {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        setCourses((prev) => prev.filter((c) => c.department_id !== id));
      } else {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      }

      toast.success(`${label} deleted.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Network error while deleting record.");
    } finally {
      setIsDeleting(false);
    }
  };

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
            Academic Structure & Courses
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Configure dynamic faculties, departments, and course offerings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "courses" && (
            <Button
              onClick={() => {
                setCourseForm((prev) => ({ ...prev, department_id: prev.department_id || departments[0]?.id || "" }));
                setShowCourseModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </Button>
          )}
          {activeTab === "departments" && (
            <Button
              onClick={() => {
                setDepartmentForm((prev) => ({ ...prev, school_id: prev.school_id || schools[0]?.id || "" }));
                setShowDepartmentModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </Button>
          )}
          {activeTab === "schools" && (
            <Button
              onClick={() => setShowSchoolModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === "courses"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Courses ({courses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === "departments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Departments ({departments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("schools")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === "schools"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Schools / Faculties ({schools.length})
        </button>
      </div>

      {/* Tab 1: Courses */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{course.code}</td>
                    <td className="py-3.5 px-4 font-medium text-stone-900">{course.title}</td>
                    <td className="py-3.5 px-4 text-stone-600">{course.level} Level</td>
                    <td className="py-3.5 px-4 text-stone-500">{course.department_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ entity: "courses", id: course.id, label: course.code })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        aria-label={`Delete ${course.code}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 px-4 text-center text-stone-500">
                      No courses yet. Click &quot;Add Course&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Departments */}
      {activeTab === "departments" && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Code Identifier</th>
                  <th className="py-3 px-4">Faculty / School</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{dept.name}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">{dept.code}</td>
                    <td className="py-3.5 px-4 text-stone-600">{dept.school_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ entity: "departments", id: dept.id, label: dept.name })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        aria-label={`Delete ${dept.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 px-4 text-center text-stone-500">
                      No departments yet. Click &quot;Add Department&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Schools */}
      {activeTab === "schools" && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">School / Faculty Name</th>
                  <th className="py-3 px-4">Code Slug</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{school.name}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">{school.code}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ entity: "schools", id: school.id, label: school.name })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        aria-label={`Delete ${school.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {schools.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 px-4 text-center text-stone-500">
                      No faculties yet. Click &quot;Add Faculty&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">Add Academic Course</h2>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Department</label>
                <select
                  value={courseForm.department_id}
                  onChange={(e) => setCourseForm({ ...courseForm, department_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.school_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CSC 308"
                  required
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800 uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Principles"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
                >
                  <option value={100}>100 Level</option>
                  <option value={200}>200 Level</option>
                  <option value={300}>300 Level</option>
                  <option value={400}>400 Level</option>
                  <option value={500}>500 Level</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? "Saving..." : "Add Course"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">Add Department</h2>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">School / Faculty</label>
                <select
                  value={departmentForm.school_id}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, school_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  required
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g. CSC"
                  required
                  value={departmentForm.code}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800 uppercase font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepartmentModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? "Saving..." : "Add Department"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School / Faculty Modal */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">Add School / Faculty</h2>

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Faculty Name</label>
                <input
                  type="text"
                  placeholder="e.g. School of Computing"
                  required
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Code Slug</label>
                <input
                  type="text"
                  placeholder="e.g. soc"
                  required
                  value={schoolForm.code}
                  onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800 font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? "Saving..." : "Add Faculty"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-lg">Delete {deleteTarget?.label}?</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-stone-600">
              {deleteTarget?.entity === "schools" &&
                "This permanently deletes the faculty and every department and course under it. "}
              {deleteTarget?.entity === "departments" &&
                "This permanently deletes the department and every course under it. "}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
