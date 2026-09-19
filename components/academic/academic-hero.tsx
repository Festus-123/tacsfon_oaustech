import Link from "next/link";
import { Sparkles, BookOpen, CheckCircle2, ArrowRight, ShieldCheck, Calendar, Layers } from "lucide-react";
import { Semester } from "@/data/academic";

interface AcademicHeroProps {
  activeSemester: Semester | null;
}

export function AcademicHero({ activeSemester }: AcademicHeroProps) {
  const price = activeSemester?.price ? `₦${activeSemester.price.toLocaleString()}` : "₦1,500";
  const semesterLabel = activeSemester
    ? `${activeSemester.academic_session_name || "2024/2025"} — ${activeSemester.name}`
    : "2024/2025 — First Semester";

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-[#FDFBF7] via-[#F8F6F0] to-[#FDFBF7]">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Active Access Period Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-medium shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Access: {semesterLabel}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            Get organized access to academic resources for your semester.
          </h1>

          <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-sans">
            Stop digging through scattered group chats and corrupted drives. Access verified OAUSTECH
            past examination questions, practical manuals, and lecture notes curated for your level and
            department.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/academic/subscribe"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Unlock Full Semester for {price}</span>
            </Link>

            <Link
              href="/academic/materials"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-medium text-sm border border-stone-200 shadow-2xs transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>Browse Catalog</span>
            </Link>
          </div>

          {/* Value Props Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-600 max-w-xl mx-auto text-left">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-stone-200/60">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verified Past Questions</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-stone-200/60">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Official Lab Manuals</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-stone-200/60">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Single Fee per Semester</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
