import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { SemesterManager } from "@/components/admin/academic/semester-manager";
import { getSemesters } from "@/lib/supabase/academic";
import { initialAcademicSessions } from "@/data/academic";

export const metadata: Metadata = {
  title: "Manage Academic Semesters | TACSFON Admin",
  description: "Configure academic semesters, pricing, and access periods.",
};

export default async function AdminSemestersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const semesters = await getSemesters();

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SemesterManager
          initialSemesters={semesters}
          sessions={initialAcademicSessions}
        />
      </main>
    </div>
  );
}
