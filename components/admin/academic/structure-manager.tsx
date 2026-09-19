"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Building, GraduationCap, BookOpen, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { School, Department, Course } from "@/data/academic";
import { Button } from "@/components/ui/button";

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
  const [search, setSearch] = useState("");

  // New Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    department_id: departments[0]?.id || "",
    code: "",
    title: "",
    level: 300,
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.title.trim()) {
      toast.error("Please provide both course code and title.");
      return;
    }

    const deptObj = departments.find((d) => d.id === courseForm.department_id);
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      department_id: courseForm.department_id,
      department_name: deptObj?.name || "Department",
      code: courseForm.code.toUpperCase().trim(),
      title: courseForm.title.trim(),
      level: Number(courseForm.level),
      is_active: true,
      created_at: new Date().toISOString(),
    };

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
              onClick={() => setShowCourseModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
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
                  </tr>
                ))}
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
                  </tr>
                ))}
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
                  </tr>
                ))}
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add Course
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
