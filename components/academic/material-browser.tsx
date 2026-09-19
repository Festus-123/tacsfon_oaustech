"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  Layers,
  Archive,
  Search,
  Filter,
  Eye,
  Lock,
  ChevronRight,
  GraduationCap,
  Calendar,
  Building,
} from "lucide-react";
import {
  AcademicMaterial,
  MaterialType,
  School,
  Department,
  Course,
} from "@/data/academic";

interface MaterialBrowserProps {
  initialMaterials: AcademicMaterial[];
  materialTypes: MaterialType[];
  schools: School[];
  departments: Department[];
  courses: Course[];
  initialTypeSlug?: string;
  hasActiveAccess?: boolean;
}

export function MaterialBrowser({
  initialMaterials,
  materialTypes,
  schools,
  departments,
  courses,
  initialTypeSlug,
  hasActiveAccess = false,
}: MaterialBrowserProps) {
  const [selectedType, setSelectedType] = useState<string>(initialTypeSlug || "all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered departments based on selected school
  const filteredDepartments = useMemo(() => {
    if (selectedSchool === "all") return departments;
    return departments.filter((d) => d.school_id === selectedSchool);
  }, [departments, selectedSchool]);

  // Filtered courses based on department & level
  const filteredCourses = useMemo(() => {
    let list = courses;
    if (selectedDepartment !== "all") {
      list = list.filter((c) => c.department_id === selectedDepartment);
    }
    if (selectedLevel !== "all") {
      list = list.filter((c) => c.level === Number(selectedLevel));
    }
    return list;
  }, [courses, selectedDepartment, selectedLevel]);

  // Main filtered materials list
  const filteredMaterials = useMemo(() => {
    return initialMaterials.filter((mat) => {
      if (selectedType !== "all" && mat.material_type_slug !== selectedType) return false;
      if (selectedLevel !== "all" && mat.level !== Number(selectedLevel)) return false;
      if (selectedSchool !== "all" && mat.school_id !== selectedSchool) return false;
      if (selectedDepartment !== "all" && mat.department_id !== selectedDepartment) return false;
      if (selectedCourse !== "all" && mat.course_id !== selectedCourse) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = mat.title.toLowerCase().includes(query);
        const matchCode = mat.course_code?.toLowerCase().includes(query);
        const matchCourseTitle = mat.course_title?.toLowerCase().includes(query);
        if (!matchTitle && !matchCode && !matchCourseTitle) return false;
      }

      return true;
    });
  }, [
    initialMaterials,
    selectedType,
    selectedLevel,
    selectedSchool,
    selectedDepartment,
    selectedCourse,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedType("all");
    setSelectedLevel("all");
    setSelectedSchool("all");
    setSelectedDepartment("all");
    setSelectedCourse("all");
    setSearchQuery("");
  };

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

      {/* Progressive Hierarchy Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Progressive Academic Filters
          </div>

          {(selectedLevel !== "all" ||
            selectedSchool !== "all" ||
            selectedDepartment !== "all" ||
            selectedCourse !== "all" ||
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
          {/* Level Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full text-xs py-2 px-3 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">All Levels (100 - 500)</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
          </div>

          {/* School Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">School</label>
            <select
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setSelectedDepartment("all");
                setSelectedCourse("all");
              }}
              className="w-full text-xs py-2 px-3 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate"
            >
              <option value="all">All Schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedCourse("all");
              }}
              className="w-full text-xs py-2 px-3 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate"
            >
              <option value="all">All Departments</option>
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full text-xs py-2 px-3 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate"
            >
              <option value="all">All Courses</option>
              {filteredCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-semibold text-stone-500 uppercase">Keyword</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Course code or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Materials List / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-900">{filteredMaterials.length}</strong> items
          </span>
          <span className="text-[11px]">
            Protected Reader &bull; Watermarked for Registered Students
          </span>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg">
              {selectedCourse !== "all"
                ? "No materials have been published for this course yet."
                : "No materials available yet."}
            </h3>
            <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
              We are continually digitizing and verifying additional course notes and examination papers.
              Try selecting another department or level, or reset your search filters.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                      {item.course_code || "GENERAL"}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">
                      {item.level} Level
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-blue-700 transition line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="space-y-1 text-xs text-stone-500 border-t border-stone-100 pt-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{item.department_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{item.academic_session_name} &bull; {item.semester_name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px] text-stone-400 flex items-center gap-2">
                    <span className="uppercase font-mono">{item.file_type}</span>
                    {item.page_count && <span>&bull; {item.page_count} pages</span>}
                  </div>

                  <Link
                    href={`/academic/materials/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white text-xs font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Read Preview</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
