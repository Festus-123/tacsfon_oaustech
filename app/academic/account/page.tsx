import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { AccountAccess } from "@/components/academic/account-access";
import { getStudentAccess } from "@/lib/academic/access";
import { getActiveSemester } from "@/lib/supabase/academic";

export default async function AcademicAccountPage() {
  const [access, activeSemester] = await Promise.all([getStudentAccess(), getActiveSemester()]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900">
      <AcademicHeader activeSemester={activeSemester} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Student Access & Entitlements
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Check your semester subscription on this device, or restore it with an email code.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <AccountAccess
            access={
              access
                ? {
                    email: access.email,
                    semesterLabel:
                      [access.sessionName, access.semesterName].filter(Boolean).join(" • ") || "Semester Access",
                    expiresAt: access.expiresAt,
                  }
                : null
            }
          />
        </div>
      </main>

      <AcademicFooter />
    </div>
  );
}
