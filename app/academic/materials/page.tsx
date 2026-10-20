import { Metadata } from "next";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { MaterialBrowser } from "@/components/academic/material-browser";
import {
  getActiveSemester,
  getMaterialTypes,
  getSchools,
  getDepartments,
  getCourses,
  getPublishedMaterials,
  getCourseScopeRules,
} from "@/lib/supabase/academic";
import { getStudentAccess } from "@/lib/academic/access";

export const metadata: Metadata = {
  title: "Browse Academic Materials — Past Questions & Manuals | Academic Hub",
  description:
    "Filter and explore verified past questions, practical manuals, and lecture notes organized by course code, session and semester.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AcademicMaterialsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const typeParam = typeof resolvedParams.type === "string" ? resolvedParams.type : undefined;

  const [activeSemester, materialTypes, schools, departments, courses, materials, rules, access] =
    await Promise.all([
      getActiveSemester(),
      getMaterialTypes(),
      getSchools(),
      getDepartments(),
      getCourses(),
      getPublishedMaterials(),
      getCourseScopeRules(),
      getStudentAccess(),
    ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900">
      <AcademicHeader activeSemester={activeSemester} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Course Catalog & Materials
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Browse through digitized OAUSTECH examination archives, practical manuals, and revision workbooks.
          </p>
        </div>

        <MaterialBrowser
          initialMaterials={materials}
          materialTypes={materialTypes}
          schools={schools}
          departments={departments}
          courses={courses}
          rules={rules}
          hasActiveAccess={!!access}
          initialTypeSlug={typeParam}
        />
      </main>

      <AcademicFooter />
    </div>
  );
}
