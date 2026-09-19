import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { StructureManager } from "@/components/admin/academic/structure-manager";
import { getSchools, getDepartments, getCourses } from "@/lib/supabase/academic";

export const metadata: Metadata = {
  title: "Manage Academic Structure | TACSFON Admin",
  description: "Configure schools, academic departments, and course offerings.",
};

export default async function AdminStructurePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [schools, departments, courses] = await Promise.all([
    getSchools(),
    getDepartments(),
    getCourses(),
  ]);

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StructureManager
          initialSchools={schools}
          initialDepartments={departments}
          initialCourses={courses}
        />
      </main>
    </div>
  );
}
