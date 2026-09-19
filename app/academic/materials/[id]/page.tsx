import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Lock,
  Sparkles,
  Download,
  ShieldCheck,
  Calendar,
  GraduationCap,
  Info,
  CheckCircle2,
} from "lucide-react";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { getMaterialById, getActiveSemester } from "@/lib/supabase/academic";
import { academicSupport } from "@/data/academic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const material = await getMaterialById(id);

  if (!material) {
    return { title: "Material Not Found | Academic Hub" };
  }

  return {
    title: `${material.course_code || ""} ${material.title} | Academic Hub OAUSTECH`,
    description: `Academic study document for ${material.course_title || material.title} at OAUSTECH.`,
  };
}

export default async function MaterialViewerPage({ params }: PageProps) {
  const { id } = await params;
  const [material, activeSemester] = await Promise.all([
    getMaterialById(id),
    getActiveSemester(),
  ]);

  if (!material) {
    notFound();
  }

  const price = activeSemester?.price ? `₦${activeSemester.price.toLocaleString()}` : "₦1,500";

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900">
      <AcademicHeader activeSemester={activeSemester} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/academic/materials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Course Catalog
          </Link>
        </div>

        {/* Header Metadata Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
              {material.course_code || "COURSE"}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-700">
              {material.level} Level
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-700">
              {material.material_type_name || "Material"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
            {material.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="truncate">{material.department_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{material.academic_session_name} &bull; {material.semester_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{material.page_count || 12} pages &bull; {(material.file_size / 1000000).toFixed(1)} MB</span>
            </div>
          </div>
        </div>

        {/* Reader & Preview Section */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
          {/* Reader Top Bar */}
          <div className="bg-stone-100/80 border-b border-stone-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-stone-800">Protected Academic Reader</span>
              <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
                ({academicSupport.watermarkText})
              </span>
            </div>

            {/* Downloads Disabled Notice as specified in Section 92 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="px-3 py-1 rounded-lg bg-stone-200/70 text-stone-400 text-xs flex items-center gap-1 cursor-not-allowed"
                title="Direct downloads are currently disabled in initial release to protect academic integrity."
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (Disabled)</span>
              </button>
            </div>
          </div>

          {/* Reader Viewport */}
          <div className="p-6 sm:p-10 relative bg-stone-50/50 min-h-[400px]">
            {/* Watermark Diagonal Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center select-none">
              <span className="text-4xl md:text-6xl font-mono font-bold rotate-[-25deg] text-center">
                TACSFON × FC STUDIO<br />
                {material.course_code}
              </span>
            </div>

            {/* Document Content Simulation / Excerpt */}
            <div className="max-w-2xl mx-auto bg-white rounded-xl border border-stone-200 p-8 sm:p-12 shadow-sm font-serif text-stone-800 space-y-6 relative">
              <div className="border-b border-stone-200 pb-4 text-center space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-stone-400 font-sans block">
                  Olusegun Agagu University of Science and Technology
                </span>
                <h2 className="text-xl font-bold text-stone-900">{material.title}</h2>
                <span className="text-xs text-stone-500 font-sans block">
                  {material.course_title} &bull; Level {material.level}
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm font-sans leading-relaxed text-stone-700">
                <p>
                  <strong>Course Learning Objectives & Outline:</strong> This document contains verified
                  instructional syllabi, previous semester examination questions, and guided solutions
                  prepared for students in the Department of {material.department_name || "Science"}.
                </p>

                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200/80 space-y-2 font-mono text-xs">
                  <div>1. Core Theoretical Foundations & Paradigms</div>
                  <div>2. Laboratory Benchmarks & Practical Demonstrations</div>
                  <div>3. Step-by-Step Problem Solving & Model Exam Answers</div>
                </div>

                <p className="text-stone-500 text-xs italic">
                  [... Full document continuous pages and answer keys protected behind active semester subscription ...]
                </p>
              </div>
            </div>

            {/* Subscription Unlock Overlay Card */}
            <div className="mt-8 max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-2xl border border-blue-200/80 p-6 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Unlock Full Access for the Entire Semester
              </h3>
              <p className="text-stone-600 text-xs max-w-md mx-auto leading-relaxed">
                One payment of <strong>{price}</strong> gives you instant, unrestricted reading access to this
                document and every other course material across all departments for the active semester.
              </p>
              <div className="pt-2">
                <Link
                  href={`/academic/subscribe?course=${material.course_code || ""}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Subscribe for {price}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AcademicFooter />
    </div>
  );
}
