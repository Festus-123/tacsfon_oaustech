import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Lock,
  Sparkles,
  ShieldCheck,
  Calendar,
  GraduationCap,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { getMaterialById, getActiveSemester } from "@/lib/supabase/academic";
import { getStudentAccess } from "@/lib/academic/access";
import { getMaterialFiles } from "@/lib/academic/material-files";
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
  const [material, activeSemester, access] = await Promise.all([
    getMaterialById(id),
    getActiveSemester(),
    getStudentAccess(),
  ]);

  if (!material) {
    notFound();
  }

  // Files are only signed for visitors with an active subscription
  const files = access ? await getMaterialFiles(material.storage_path) : [];
  const price = activeSemester?.price ? `₦${Number(activeSemester.price).toLocaleString()}` : null;
  const sessionLabel = [material.academic_session_name, material.semester_name].filter(Boolean).join(" • ");

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
              <span>{sessionLabel || "Session not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                {material.file_type?.toUpperCase()}
                {material.file_size ? ` • ${(material.file_size / 1_000_000).toFixed(1)} MB` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Reader */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="bg-stone-100/80 border-b border-stone-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-stone-800">Protected Academic Reader</span>
              <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
                ({academicSupport.watermarkText})
              </span>
            </div>
            {access && <span className="text-[11px] text-stone-500 break-all">Licensed to {access.email}</span>}
          </div>

          {access ? (
            <div className="p-3 sm:p-6 bg-stone-50/50 space-y-4">
              {files.length === 0 ? (
                <p className="py-16 text-center text-xs text-stone-500">
                  This document could not be loaded right now. Please refresh, or contact support if it keeps
                  happening.
                </p>
              ) : (
                files.map((file, index) => (
                  <div key={file.name} className="relative rounded-xl border border-stone-200 bg-white overflow-hidden">
                    {files.length > 1 && (
                      <div className="px-3 py-1.5 text-[11px] text-stone-500 border-b border-stone-100">
                        Page {index + 1} of {files.length}
                      </div>
                    )}

                    {file.kind === "image" && (
                      // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
                      <img
                        src={file.url}
                        alt={`${material.course_code} page ${index + 1}`}
                        className="w-full h-auto select-none"
                        draggable={false}
                      />
                    )}
                    {file.kind === "pdf" && (
                      <iframe
                        src={`${file.url}#toolbar=0&navpanes=0`}
                        title={`${material.course_code} document`}
                        className="w-full h-[80vh]"
                      />
                    )}
                    {file.kind === "other" && (
                      <div className="py-12 text-center space-y-3">
                        <p className="text-xs text-stone-600">This document type cannot be shown inside the page.</p>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open document
                        </a>
                      </div>
                    )}

                    {/* Watermark with the subscriber's email discourages sharing screenshots */}
                    <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
                      <span className="rotate-[-25deg] text-center font-mono font-bold text-2xl sm:text-4xl text-stone-900/[0.07] leading-tight">
                        TACSFON × FC STUDIO
                        <br />
                        {access.email}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-6 sm:p-10 bg-stone-50/50">
              <div className="max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-2xl border border-blue-200/80 p-6 text-center space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">
                  Unlock Full Access for the Entire Semester
                </h3>
                <p className="text-stone-600 text-xs max-w-md mx-auto leading-relaxed">
                  {price ? (
                    <>
                      One payment of <strong>{price}</strong> gives you
                    </>
                  ) : (
                    "A semester subscription gives you"
                  )}{" "}
                  reading access to this document and every other course material for the active semester.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Link
                    href={`/academic/subscribe?course=${material.course_code || ""}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{price ? `Subscribe for ${price}` : "Subscribe"}</span>
                  </Link>
                  <Link
                    href="/academic/account"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Already paid? Restore access</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AcademicFooter />
    </div>
  );
}
