"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, AlertTriangle, Loader2, GitMerge, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { School, Department, Course } from "@/data/academic";
import {
  CourseScope,
  CourseScopeRule,
  COURSE_SCOPE_LABELS,
  courseCodeKey,
  coursePrefix,
  levelFromCourseCode,
  normalizeCourseCode,
} from "@/lib/academic/course-scope";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StructureEntity = "schools" | "departments" | "courses" | "course_scope_rules";
type Tab = "courses" | "departments" | "schools" | "rules";

const SCOPES = Object.keys(COURSE_SCOPE_LABELS) as CourseScope[];

const SCOPE_BADGE: Record<CourseScope, string> = {
  general: "text-violet-800 bg-violet-50",
  school: "text-sky-800 bg-sky-50",
  department: "text-emerald-800 bg-emerald-50",
};

async function saveStructureRecord<T>(
  entity: StructureEntity,
  payload: object
): Promise<{ record: T; applied?: number } | null> {
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
    return { record: data.record as T, applied: data.applied };
  } catch {
    toast.error("Network error while saving record.");
    return null;
  }
}

type CourseRecord = Course & { departments?: { name?: string; school_id?: string } | null };

const toCourse = ({ departments, ...c }: CourseRecord): Course => ({
  ...c,
  scope: c.scope || "department",
  school_id: c.school_id || departments?.school_id || null,
  department_name: departments?.name,
});

interface StructureManagerProps {
  initialSchools: School[];
  initialDepartments: Department[];
  initialCourses: Course[];
  initialRules: CourseScopeRule[];
}

export function StructureManager({
  initialSchools,
  initialDepartments,
  initialCourses,
  initialRules,
}: StructureManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [rules, setRules] = useState<CourseScopeRule[]>(initialRules);
  const [isSaving, setIsSaving] = useState(false);

  const schoolName = (id?: string | null) => schools.find((s) => s.id === id)?.name || "";
  const departmentName = (id?: string | null) => departments.find((d) => d.id === id)?.name || "";

  // Course list filters (the catalog has hundreds of courses)
  const [courseSearch, setCourseSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | CourseScope>("all");

  const visibleCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    const key = courseCodeKey(courseSearch);
    return courses
      .filter((c) => scopeFilter === "all" || (c.scope || "department") === scopeFilter)
      .filter(
        (c) =>
          !query ||
          (key.length > 0 && courseCodeKey(c.code).includes(key)) ||
          c.title.toLowerCase().includes(query)
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, courseSearch, scopeFilter]);

  const ownerLabel = (c: Course) =>
    c.scope === "general"
      ? "All students"
      : c.scope === "school"
        ? schoolName(c.school_id)
        : c.department_name || departmentName(c.department_id);

  // ---------------- Course modal (add) ----------------
  const emptyCourseForm = { code: "", title: "", level: "", scope: "department" as CourseScope, school_id: "", department_id: "" };
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeCourseCode(courseForm.code);
    if (!code) {
      toast.error("Course code must look like CSC 308.");
      return;
    }

    setIsSaving(true);
    const saved = await saveStructureRecord<CourseRecord>("courses", {
      code,
      title: courseForm.title.trim(),
      level: Number(courseForm.level) || levelFromCourseCode(code) || 100,
      scope: courseForm.scope,
      school_id: courseForm.school_id || null,
      department_id: courseForm.department_id || null,
    });
    setIsSaving(false);
    if (!saved) return;

    const newCourse = toCourse(saved.record);
    setCourses((prev) => [newCourse, ...prev]);
    toast.success(`Course ${newCourse.code} added!`);
    setShowCourseModal(false);
    setCourseForm(emptyCourseForm);
  };

  // ---------------- Change course scope ----------------
  const [scopeTarget, setScopeTarget] = useState<Course | null>(null);
  const [scopeForm, setScopeForm] = useState({ scope: "department" as CourseScope, school_id: "", department_id: "" });

  const openScopeModal = (course: Course) => {
    setScopeTarget(course);
    setScopeForm({
      scope: course.scope || "department",
      school_id: course.school_id || "",
      department_id: course.department_id || "",
    });
  };

  const handleChangeScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeTarget) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/academic/structure/courses/${scopeTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scopeForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update course scope.");
        return;
      }
      const updated = toCourse(data.record);
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(`${updated.code} is now ${COURSE_SCOPE_LABELS[updated.scope || "department"].toLowerCase()}.`);
      setScopeTarget(null);
    } catch {
      toast.error("Network error while updating course.");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- Department modal ----------------
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({ school_id: "", name: "", code: "" });

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

    const newDepartment: Department = { ...saved.record, school_name: saved.record.schools?.name };
    setDepartments((prev) => [newDepartment, ...prev]);
    toast.success(`Department ${newDepartment.name} added!`);
    setShowDepartmentModal(false);
    setDepartmentForm({ school_id: "", name: "", code: "" });
  };

  // ---------------- School modal ----------------
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: "", code: "" });

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

    setSchools((prev) => [saved.record, ...prev]);
    toast.success(`Faculty ${saved.record.name} added!`);
    setShowSchoolModal(false);
    setSchoolForm({ name: "", code: "" });
  };

  // ---------------- Scope rule modal ----------------
  const emptyRuleForm = {
    match_type: "prefix" as "course" | "prefix",
    pattern: "",
    max_level: "",
    scope: "general" as CourseScope,
    school_id: "",
    department_id: "",
    listed_under_department_ids: [] as string[],
  };
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState(emptyRuleForm);

  // Mirrors the server: apply a new rule to the matching courses already loaded
  const applyRuleLocally = (rule: CourseScopeRule, allRules: CourseScopeRule[]) => {
    const exact = new Set(allRules.filter((r) => r.match_type === "course").map((r) => courseCodeKey(r.pattern)));
    setCourses((prev) =>
      prev.map((c) => {
        const matches =
          rule.match_type === "course"
            ? courseCodeKey(c.code) === courseCodeKey(rule.pattern)
            : coursePrefix(c.code) === rule.pattern &&
              (rule.max_level === null || c.level <= rule.max_level) &&
              !exact.has(courseCodeKey(c.code)) &&
              (rule.scope !== "department" || !!c.department_id);
        if (!matches) return c;
        if (rule.scope === "general") return { ...c, scope: "general", school_id: null, department_id: null };
        if (rule.scope === "school") return { ...c, scope: "school", school_id: rule.school_id, department_id: null };
        return {
          ...c,
          scope: "department",
          school_id: null,
          department_id: rule.department_id || c.department_id,
          department_name: rule.department_id ? departmentName(rule.department_id) : c.department_name,
        };
      })
    );
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const saved = await saveStructureRecord<CourseScopeRule>("course_scope_rules", {
      match_type: ruleForm.match_type,
      pattern: ruleForm.pattern,
      max_level: ruleForm.match_type === "prefix" && ruleForm.max_level ? Number(ruleForm.max_level) : null,
      scope: ruleForm.scope,
      school_id: ruleForm.school_id || null,
      department_id: ruleForm.department_id || null,
      listed_under_department_ids: ruleForm.listed_under_department_ids,
    });
    setIsSaving(false);
    if (!saved) return;

    const nextRules = [...rules, saved.record];
    setRules(nextRules);
    applyRuleLocally(saved.record, nextRules);
    toast.success(`Rule saved${saved.applied ? ` and applied to ${saved.applied} existing course(s)` : ""}.`);
    setShowRuleModal(false);
    setRuleForm(emptyRuleForm);
  };

  const describeRule = (rule: CourseScopeRule) =>
    rule.match_type === "course"
      ? rule.pattern
      : `${rule.pattern} courses${rule.max_level ? ` up to ${rule.max_level}L` : " (any level)"}`;

  // ---------------- Delete ----------------
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
        setCourses((prev) =>
          prev.filter((c) => c.school_id !== id && !removedDeptIds.includes(c.department_id || ""))
        );
        setRules((prev) => prev.filter((r) => r.school_id !== id));
      } else if (entity === "departments") {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        setCourses((prev) => prev.filter((c) => c.department_id !== id));
        setRules((prev) => prev.filter((r) => r.department_id !== id));
      } else if (entity === "courses") {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      } else {
        setRules((prev) => prev.filter((r) => r.id !== id));
      }

      toast.success(`${label} deleted.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Network error while deleting record.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------- Merge ----------------
  const [mergeSource, setMergeSource] = useState<{
    entity: "schools" | "departments";
    id: string;
    label: string;
  } | null>(null);
  const [mergeInto, setMergeInto] = useState("");

  const confirmMerge = async () => {
    if (!mergeSource || !mergeInto) return;
    const { entity, id, label } = mergeSource;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/academic/structure/${entity}/${id}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ into_id: mergeInto }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Merge failed.");
        return;
      }

      if (entity === "departments") {
        const target = departments.find((d) => d.id === mergeInto);
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        setCourses((prev) =>
          prev.map((c) =>
            c.department_id === id ? { ...c, department_id: mergeInto, department_name: target?.name } : c
          )
        );
      } else {
        const target = schools.find((s) => s.id === mergeInto);
        setSchools((prev) => prev.filter((s) => s.id !== id));
        setDepartments((prev) =>
          prev.map((d) => (d.school_id === id ? { ...d, school_id: mergeInto, school_name: target?.name } : d))
        );
        setCourses((prev) => prev.map((c) => (c.school_id === id ? { ...c, school_id: mergeInto } : c)));
      }

      toast.success(`${label} merged into ${data.into?.name}.`);
      setMergeSource(null);
      setMergeInto("");
    } catch {
      toast.error("Network error while merging.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabButton = (tab: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition shrink-0 whitespace-nowrap ${
        activeTab === tab
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-stone-500 hover:text-stone-800"
      }`}
    >
      {label}
    </button>
  );

  const addButton = (label: string, onClick: () => void) => (
    <Button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5 cursor-pointer"
    >
      <Plus className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );

  const rowAction = (label: string, icon: React.ReactNode, onClick: () => void, tone = "text-red-600 hover:bg-red-50") => (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${tone}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const fieldClass = "w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800";
  const labelClass = "font-semibold text-stone-700 uppercase";

  const ownerFields = (
    form: { scope: CourseScope; school_id: string; department_id: string },
    update: (patch: Partial<{ scope: CourseScope; school_id: string; department_id: string }>) => void,
    requireDepartment = true
  ) => (
    <>
      <div className="space-y-1">
        <label className={labelClass}>Scope</label>
        <select
          value={form.scope}
          onChange={(e) => update({ scope: e.target.value as CourseScope })}
          className={fieldClass}
        >
          {SCOPES.map((scope) => (
            <option key={scope} value={scope}>
              {COURSE_SCOPE_LABELS[scope]}
            </option>
          ))}
        </select>
      </div>

      {form.scope === "school" && (
        <div className="space-y-1">
          <label className={labelClass}>School</label>
          <select value={form.school_id} onChange={(e) => update({ school_id: e.target.value })} className={fieldClass}>
            <option value="">Select school</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {form.scope === "department" && requireDepartment && (
        <div className="space-y-1">
          <label className={labelClass}>Department</label>
          <select
            value={form.department_id}
            onChange={(e) => update({ department_id: e.target.value })}
            className={fieldClass}
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.school_name || schoolName(d.school_id)})
              </option>
            ))}
          </select>
        </div>
      )}
    </>
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
            Academic Structure & Courses
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Courses are keyed by course code. General courses are open to everyone; school-wide and
            department courses belong to their owner.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "courses" && addButton("Add Course", () => setShowCourseModal(true))}
          {activeTab === "departments" &&
            addButton("Add Department", () => {
              setDepartmentForm((prev) => ({ ...prev, school_id: prev.school_id || schools[0]?.id || "" }));
              setShowDepartmentModal(true);
            })}
          {activeTab === "schools" && addButton("Add Faculty", () => setShowSchoolModal(true))}
          {activeTab === "rules" && addButton("Add Rule", () => setShowRuleModal(true))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto">
        {tabButton("courses", `Courses (${courses.length})`)}
        {tabButton("departments", `Departments (${departments.length})`)}
        {tabButton("schools", `Schools / Faculties (${schools.length})`)}
        {tabButton("rules", `Scope Rules (${rules.length})`)}
      </div>

      {/* Tab 1: Courses */}
      {activeTab === "courses" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search by code (csc308) or title..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white text-stone-800"
              />
            </div>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as "all" | CourseScope)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white text-stone-800"
            >
              <option value="all">All scopes</option>
              {SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {COURSE_SCOPE_LABELS[scope]}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {visibleCourses.map((course) => {
                    const scope = course.scope || "department";
                    return (
                      <tr key={course.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">{course.code}</td>
                        <td className="py-3.5 px-4 font-medium text-stone-900">{course.title}</td>
                        <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">{course.level} Level</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${SCOPE_BADGE[scope]}`}>
                            {COURSE_SCOPE_LABELS[scope]}
                          </span>
                          <div className="text-[11px] text-stone-500 mt-1">{ownerLabel(course)}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {rowAction(
                            "Scope",
                            <Settings2 className="w-3.5 h-3.5" />,
                            () => openScopeModal(course),
                            "text-stone-700 hover:bg-stone-100"
                          )}
                          {rowAction("Delete", <Trash2 className="w-3.5 h-3.5" />, () =>
                            setDeleteTarget({ entity: "courses", id: course.id, label: course.code })
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {visibleCourses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 px-4 text-center text-stone-500">
                        {courses.length === 0
                          ? 'No courses yet. Click "Add Course" to create one.'
                          : "No courses match your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                  <th className="py-3 px-4">Courses</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{dept.name}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">{dept.code}</td>
                    <td className="py-3.5 px-4 text-stone-600">{dept.school_name || schoolName(dept.school_id)}</td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {courses.filter((c) => c.department_id === dept.id).length}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {rowAction(
                        "Merge",
                        <GitMerge className="w-3.5 h-3.5" />,
                        () => setMergeSource({ entity: "departments", id: dept.id, label: dept.name }),
                        "text-stone-700 hover:bg-stone-100"
                      )}
                      {rowAction("Delete", <Trash2 className="w-3.5 h-3.5" />, () =>
                        setDeleteTarget({ entity: "departments", id: dept.id, label: dept.name })
                      )}
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
                  <th className="py-3 px-4">Departments</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{school.name}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">{school.code}</td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {departments.filter((d) => d.school_id === school.id).length}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {rowAction(
                        "Merge",
                        <GitMerge className="w-3.5 h-3.5" />,
                        () => setMergeSource({ entity: "schools", id: school.id, label: school.name }),
                        "text-stone-700 hover:bg-stone-100"
                      )}
                      {rowAction("Delete", <Trash2 className="w-3.5 h-3.5" />, () =>
                        setDeleteTarget({ entity: "schools", id: school.id, label: school.name })
                      )}
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

      {/* Tab 4: Scope rules */}
      {activeTab === "rules" && (
        <div className="space-y-3">
          <p className="text-xs text-stone-600 bg-white border border-stone-200 rounded-xl p-3">
            Rules decide the scope of courses automatically, including new courses found during upload.
            An exact course rule (CSC 101) beats a prefix rule (GST); among prefix rules the lowest
            level limit wins. Adding a rule also updates existing matching courses; deleting one leaves
            courses as they are.
          </p>
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Applies To</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4">Owner / Also Listed Under</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{describeRule(rule)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${SCOPE_BADGE[rule.scope]}`}>
                          {COURSE_SCOPE_LABELS[rule.scope]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {rule.scope === "school" && schoolName(rule.school_id)}
                        {rule.scope === "department" && (departmentName(rule.department_id) || "Department from course prefix")}
                        {rule.scope === "general" &&
                          (rule.listed_under_department_ids.length > 0
                            ? `Listed under: ${rule.listed_under_department_ids.map(departmentName).filter(Boolean).join(", ")}`
                            : "All students")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {rowAction("Delete", <Trash2 className="w-3.5 h-3.5" />, () =>
                          setDeleteTarget({ entity: "course_scope_rules", id: rule.id, label: `Rule for ${describeRule(rule)}` })
                        )}
                      </td>
                    </tr>
                  ))}
                  {rules.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 px-4 text-center text-stone-500">
                        No rules yet. Run supabase/migration-course-scope.sql to add the default ones, or
                        click &quot;Add Rule&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">Add Academic Course</h2>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className={labelClass}>Course Code</label>
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
                <label className={labelClass}>Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Data Management I"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className={fieldClass}
                >
                  <option value="">From course code</option>
                  {[100, 200, 300, 400, 500].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl} Level
                    </option>
                  ))}
                </select>
              </div>

              {ownerFields(courseForm, (patch) => setCourseForm((prev) => ({ ...prev, ...patch })))}

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

      {/* Change Scope Modal */}
      {scopeTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Scope of <span className="font-mono">{scopeTarget.code}</span>
            </h2>
            <form onSubmit={handleChangeScope} className="space-y-4 text-xs">
              {ownerFields(scopeForm, (patch) => setScopeForm((prev) => ({ ...prev, ...patch })))}
              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScopeTarget(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? "Saving..." : "Save Scope"}
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
                <label className={labelClass}>School / Faculty</label>
                <select
                  value={departmentForm.school_id}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, school_id: e.target.value })}
                  className={fieldClass}
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Department Name</label>
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
                <label className={labelClass}>Department Code</label>
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
                <label className={labelClass}>Faculty Name</label>
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
                <label className={labelClass}>Code Slug</label>
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

      {/* Scope Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">Add Scope Rule</h2>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className={labelClass}>Applies To</label>
                <select
                  value={ruleForm.match_type}
                  onChange={(e) => setRuleForm({ ...ruleForm, match_type: e.target.value as "course" | "prefix" })}
                  className={fieldClass}
                >
                  <option value="prefix">All courses with a prefix (e.g. GST)</option>
                  <option value="course">One course (e.g. CSC 101)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>{ruleForm.match_type === "prefix" ? "Prefix" : "Course Code"}</label>
                <input
                  type="text"
                  required
                  placeholder={ruleForm.match_type === "prefix" ? "e.g. MTH" : "e.g. CSC 101"}
                  value={ruleForm.pattern}
                  onChange={(e) => setRuleForm({ ...ruleForm, pattern: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800 uppercase font-mono"
                />
              </div>

              {ruleForm.match_type === "prefix" && (
                <div className="space-y-1">
                  <label className={labelClass}>Up To Level</label>
                  <select
                    value={ruleForm.max_level}
                    onChange={(e) => setRuleForm({ ...ruleForm, max_level: e.target.value })}
                    className={fieldClass}
                  >
                    <option value="">Any level</option>
                    {[100, 200, 300, 400, 500].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Up to {lvl} Level
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {ownerFields(
                ruleForm,
                (patch) => setRuleForm((prev) => ({ ...prev, ...patch })),
                ruleForm.match_type === "course"
              )}

              {ruleForm.scope === "department" && ruleForm.match_type === "prefix" && (
                <p className="text-[11px] text-stone-500">
                  Each matching course stays with its own department (new courses go to the department
                  whose code matches the prefix).
                </p>
              )}

              {ruleForm.scope === "general" && (
                <div className="space-y-1">
                  <label className={labelClass}>Also List Under (optional)</label>
                  <p className="text-[11px] text-stone-500">
                    Departments that show these general courses among their own courses, e.g. MTH for
                    Industrial Mathematics. Same course, same files.
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-stone-200 p-2 space-y-1">
                    {departments.map((d) => (
                      <label key={d.id} className="flex items-center gap-2 text-stone-700">
                        <input
                          type="checkbox"
                          checked={ruleForm.listed_under_department_ids.includes(d.id)}
                          onChange={(e) =>
                            setRuleForm((prev) => ({
                              ...prev,
                              listed_under_department_ids: e.target.checked
                                ? [...prev.listed_under_department_ids, d.id]
                                : prev.listed_under_department_ids.filter((id) => id !== d.id),
                            }))
                          }
                        />
                        {d.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? "Saving..." : "Save Rule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      <Dialog open={!!mergeSource} onOpenChange={(open) => !open && !isSaving && setMergeSource(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Merge {mergeSource?.label}</DialogTitle>
            <DialogDescription className="text-xs text-stone-600">
              Everything that belongs to {mergeSource?.label} (courses, materials, rules
              {mergeSource?.entity === "schools" ? ", departments" : ""}) moves to the one you pick, then{" "}
              {mergeSource?.label} is deleted. Use this to fix duplicates or typos.
            </DialogDescription>
          </DialogHeader>
          <select
            value={mergeInto}
            onChange={(e) => setMergeInto(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs"
          >
            <option value="">Merge into...</option>
            {(mergeSource?.entity === "schools" ? schools : departments)
              .filter((item) => item.id !== mergeSource?.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMergeSource(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={confirmMerge} disabled={isSaving || !mergeInto}>
              {isSaving ? "Merging..." : "Merge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {deleteTarget?.entity === "course_scope_rules" &&
                "Courses already updated by this rule keep their current scope. "}
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
