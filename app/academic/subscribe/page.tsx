import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { SubscribeForm } from "@/components/academic/subscribe-form";
import { academicSupport } from "@/data/academic";
import { getActiveSemester } from "@/lib/supabase/academic";

export default async function AcademicSubscribePage() {
  // Render per request (not at build time) and read the same source the Paystack initialize
  // route charges from, so the page always matches the bill
  await connection();
  const activeSemester = await getActiveSemester();

  const semesterLabel = activeSemester
    ? [activeSemester.academic_session_name, activeSemester.name].filter(Boolean).join(" • ")
    : "";
  const validUntil = activeSemester?.end_date
    ? new Date(activeSemester.end_date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900">
      <AcademicHeader activeSemester={activeSemester} />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-6">
        <div>
          <Link
            href="/academic"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Academic Hub
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Semester Subscription
            </span>
            <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">
              Unlock Full Academic Access
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
              Enter your email address below to initiate secure checkout via Paystack. Your access token
              will be immediately attached to this address.
            </p>
          </div>

          {activeSemester ? (
            <SubscribeForm
              price={Number(activeSemester.price) || 0}
              semesterLabel={semesterLabel}
              validUntil={validUntil}
            />
          ) : (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              Subscriptions are not open right now: no academic semester is currently active. Please check
              back soon or contact support below.
            </p>
          )}
        </div>

        {/* Support contacts */}
        <div className="text-center text-xs text-stone-500 space-y-1">
          <p>Experiencing checkout difficulty?</p>
          <div className="flex items-center justify-center gap-4">
            <a href={`mailto:${academicSupport.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {academicSupport.email}
            </a>
            <a href={`tel:${academicSupport.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {academicSupport.phone}
            </a>
          </div>
        </div>
      </main>

      <AcademicFooter />
    </div>
  );
}
