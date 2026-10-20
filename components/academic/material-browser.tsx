"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Archive, Search, Filter, Eye, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import {
  AcademicMaterial,
  MaterialType,
  School,
  Department,
  Course,
} from "@/data/academic";
import { CourseScopeRule, courseCodeKey, findScopeRule } from "@/lib/academic/course-scope";

interface MaterialBrowserProps {
  initialMaterials: AcademicMaterial[];
  materialTypes: MaterialType[];
  schools: School[];
  departments: Department[];
  courses: Course[];
  rules?: CourseScopeRule[];
  initialTypeSlug?: string;
  hasActiveAccess?: boolean;
}

interface CourseEntry {
  id: string;
  code: string;
  title: string;
  level: number;
  scope: NonNullable<Course["scope"]>;
  school_id: string | null;
  department_id: string | null;
  materials: AcademicMaterial[];
}

export function MaterialBrowser({
  initialMaterials,
  materialTypes,
  schools,
  departments,
  courses,
  rules = [],
  initialTypeSlug,
  hasActiveAccess = false,
}: MaterialBrowserProps) {
  const [selectedType, setSelectedType] = useState<string>(initialTypeSlug || "all");
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openCourse, setOpenCourse] = useState<string | null>(null);

  // Sessions that actually have materials, newest first
  const sessions = useMemo(
    () =>
      Array.from(
        new Set(initialMaterials.map((m) => m.academic_session_name).filter((s): s is string => !!s))
      ).sort((a, b) => b.localeCompare(a)),
    [initialMaterials]
  );

  // Materials matching type / session / semester / level, grouped by course
  const courseEntries = useMemo(() => {
    const byCourse = new Map<string, CourseEntry>();
    for (const mat of initialMaterials) {
      if (selectedType !== "all" && mat.material_type_slug !== selectedType) continue;
      if (selectedSession !== "all" && mat.academic_session_name !== selectedSession) continue;
      if (selectedSemester !== "all" && mat.semester_name !== selectedSemester) continue;
      if (selectedLevel !== "all" && mat.level !== Number(selectedLevel)) continue;

      const course = courses.find((c) => c.id === mat.course_id);
      const entry = byCourse.get(mat.course_id) || {
        id: mat.course_id,
        code: course?.code || mat.course_code || "COURSE",
        title: course?.title || mat.course_title || mat.title,
        level: course?.level || mat.level,
        scope: course?.scope || (mat.department_id ? "department" : mat.school_id ? "school" : "general"),
        school_id: course?.school_id ?? mat.school_id,
        department_id: course?.department_id ?? mat.department_id,
        materials: [],
      };
      entry.materials.push(mat);
      byCourse.set(mat.course_id, entry);
    }
    return Array.from(byCourse.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [initialMaterials, courses, selectedType, selectedSession, selectedSemester, selectedLevel]);

  const query = searchQuery.trim().toLowerCase();
  const department = departments.find((d) => d.id === selectedDepartment);

  const sections = useMemo(() => {
    // Search matches "csc356", "CSC 356" and titles, across every course
    const queryKey = courseCodeKey(query);
    const matchesSearch = (entry: CourseEntry) =>
      !query ||
      (queryKey.length > 0 && courseCodeKey(entry.code).includes(queryKey)) ||
      entry.title.toLowerCase().includes(query);

    // General courses a department lists among its own (e.g. MTH for Industrial Mathematics)
    const isListedUnder = (entry: CourseEntry, departmentId: string) =>
      !!findScopeRule(entry.code, entry.level, rules)?.listed_under_department_ids.includes(departmentId);

    const visible = courseEntries.filter(matchesSearch);
    if (!department || query) {
      return [{ title: query ? "Matching courses" : "All courses", entries: visible }];
    }

    const schoolName = schools.find((s) => s.id === department.school_id)?.name || "School";
    return [
      {
        title: `${department.name} courses`,
        entries: visible.filter(
          (e) =>
            (e.scope === "department" && e.department_id === department.id) ||
            (e.scope === "general" && isListedUnder(e, department.id))
        ),
      },
      {
        title: `${schoolName} courses`,
        entries: visible.filter((e) => e.scope === "school" && e.school_id === department.school_id),
      },
      {
        title: "General courses",
        entries: visible.filter((e) => e.scope === "general" && !isListedUnder(e, department.id)),
      },
    ];
  }, [courseEntries, department, schools, query, rules]);

  const totalCourses = sections.reduce((acc, s) => acc + s.entries.length, 0);

  const resetFilters = () => {
    setSelectedType("all");
    setSelectedSession("all");
    setSelectedSemester("all");
    setSelectedLevel("all");
    setSelectedDepartment("all");
    setSearchQuery("");
    setOpenCourse(null);
  };

  const selectClass =
    "w-full text-xs py-2 px-3 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate";

  return (
    <div className="space-y-8">
      {/* Category Tabs Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            selectedType === "all"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          All Material Types
        </button>

        {materialTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedType === type.slug
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Session / Semester Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Find Your Course
          </div>

          {(selectedSession !== "all" ||
            selectedSemester !== "all" ||
            selectedLevel !== "all" ||
            selectedDepartment !== "all" ||
            searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Session</label>
            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className={selectClass}>
              <option value="all">All Sessions</option>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Semester</label>
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className={selectClass}>
              <option value="all">Both Semesters</option>
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Level</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className={selectClass}>
              <option value="all">All Levels</option>
              {[100, 200, 300, 400, 500].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl} Level
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Your Department (optional)</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={selectClass}
            >
              <option value="all">Any department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="e.g. CSC 356 or MTH 101"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses with materials */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>
            <strong className="text-stone-900">{totalCourses}</strong> course(s) with materials
          </span>
          <span className="text-[11px]">Protected Reader &bull; Watermarked for Registered Students</span>
        </div>

        {totalCourses === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg">
              {query ? `No materials found for "${searchQuery}" yet.` : "No materials available yet."}
            </h3>
            <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
              We are continually digitizing and verifying additional course notes and examination papers.
              Try another session or semester, or reset your filters.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          sections
            .filter((section) => section.entries.length > 0)
            .map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-serif font-bold text-stone-900 text-lg">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.entries.map((entry) => {
                    const isOpen = openCourse === entry.id;
                    return (
                      <div
                        key={entry.id}
                        className={`bg-white rounded-2xl border p-5 shadow-2xs transition ${
                          isOpen ? "border-blue-300 md:col-span-2 lg:col-span-3" : "border-stone-200/90 hover:border-blue-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenCourse(isOpen ? null : entry.id)}
                          className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                                {entry.code}
                              </span>
                              <span className="text-[11px] font-semibold text-stone-500">{entry.level} Level</span>
                              {entry.scope === "general" && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700">
                                  General
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif font-bold text-stone-900 text-base line-clamp-2">{entry.title}</h3>
                            <p className="text-[11px] text-stone-500">{entry.materials.length} item(s)</p>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {entry.materials.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-xl border border-stone-200 p-4 flex flex-col justify-between gap-3 group"
                              >
                                <div className="space-y-1.5">
                                  <span className="text-[11px] font-semibold text-blue-700">
                                    {item.material_type_name}
                                  </span>
                                  <h4 className="font-semibold text-stone-900 text-sm line-clamp-2">{item.title}</h4>
                                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                    <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    <span>
                                      {[item.academic_session_name, item.semester_name].filter(Boolean).join(" • ") ||
                                        "Session not specified"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-stone-400 uppercase font-mono">
                                    {item.file_type}
                                    {item.page_count ? ` • ${item.page_count} pages` : ""}
                                  </span>
                                  <Link
                                    href={`/academic/materials/${item.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white text-xs font-semibold transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{hasActiveAccess ? "Open Reader" : "Read Preview"}</span>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
        )}
      </div>
    </div>
  );
}
