"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ArrowLeft, Sparkles, User, ShieldCheck } from "lucide-react";
import { Semester } from "@/data/academic";

interface AcademicHeaderProps {
  activeSemester?: Semester | null;
  userEmail?: string | null;
}

export function AcademicHeader({ activeSemester, userEmail }: AcademicHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80">
      {/* Top Contextual Bar */}
      <div className="bg-stone-100/80 border-b border-stone-200/50 py-1 px-4 text-center text-[11px] text-stone-500 flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-stone-900 transition font-medium"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>TACSFON Fellowship Home</span>
        </Link>
        <span className="hidden sm:inline font-sans">
          Academic Hub &bull; In partnership with TACSFON OAUSTECH
        </span>
        {activeSemester ? (
          <span className="text-blue-700 font-semibold">
            {activeSemester.academic_session_name || "2024/2025"} — {activeSemester.name}
          </span>
        ) : (
          <span>Academic Portal</span>
        )}
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/academic" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg text-stone-900 leading-none">
                Academic Hub
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                OAUSTECH
              </span>
            </div>
            <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
              Curated Course Resources
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-stone-700">
          <Link
            href="/academic"
            className={`px-3 py-1.5 rounded-lg transition ${
              pathname === "/academic"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "hover:bg-stone-100"
            }`}
          >
            Overview
          </Link>
          <Link
            href="/academic/materials"
            className={`px-3 py-1.5 rounded-lg transition ${
              pathname.startsWith("/academic/materials")
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "hover:bg-stone-100"
            }`}
          >
            Browse Materials
          </Link>
          <Link
            href="/academic#demos"
            className="px-3 py-1.5 rounded-lg hover:bg-stone-100 transition"
          >
            Sample Demos
          </Link>
          <Link
            href="/academic#pricing"
            className="px-3 py-1.5 rounded-lg hover:bg-stone-100 transition"
          >
            Semester Access
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/academic/account"
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition border border-stone-200/70"
            title="My Account / Subscriptions"
          >
            <User className="w-4 h-4" />
          </Link>

          <Link
            href="/academic/subscribe"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get Semester Access</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
