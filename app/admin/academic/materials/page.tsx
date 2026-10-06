import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { MaterialsManager } from "@/components/admin/academic/materials-manager";
import {
  getMaterialTypes,
  getSchools,
  getDepartments,
  getCourses,
  getSemesters,
  getPublishedMaterials,
} from "@/lib/supabase/academic";

export const metadata: Metadata = {
  title: "Course Materials & Raw Ingestion | TACSFON Admin",
  description: "Raw document ingestion powered by Nebula AI, metadata review, and published Academic Hub materials.",
};

export default async function AdminMaterialsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [materials, materialTypes, schools, departments, courses, semesters] =
    await Promise.all([
      getPublishedMaterials(),
      getMaterialTypes(),
      getSchools(),
      getDepartments(),
      getCourses(),
      getSemesters(),
    ]);

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MaterialsManager
          initialMaterials={materials}
          materialTypes={materialTypes}
          schools={schools}
          departments={departments}
          courses={courses}
          semesters={semesters}
        />
      </main>
    </div>
  );
}
