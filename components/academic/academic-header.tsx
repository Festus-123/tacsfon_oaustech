"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ArrowLeft, Sparkles, User, Menu, X } from "lucide-react";
import { Semester } from "@/data/academic";

interface AcademicHeaderProps {
  activeSemester?: Semester | null;
  userEmail?: string | null;
}

export function AcademicHeader({ activeSemester }: AcademicHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/academic", label: "Overview", active: pathname === "/academic" },
    { href: "/academic/materials", label: "Browse Materials", active: pathname.startsWith("/academic/materials") },
    { href: "/academic#demos", label: "Sample Demos", active: false },
    { href: "/academic#pricing", label: "Semester Access", active: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80">
      {/* Top Contextual Bar */}
      <div className="bg-stone-100/80 border-b border-stone-200/50 py-1 px-4 text-center text-[11px] text-stone-500 flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-stone-900 transition font-medium shrink-0"
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="sm:hidden">Fellowship Home</span>
          <span className="hidden sm:inline">TACSFON Fellowship Home</span>
        </Link>
        <span className="hidden sm:inline font-sans">
          Academic Hub &bull; In partnership with TACSFON OAUSTECH
        </span>
        {activeSemester ? (
          <span className="text-blue-700 font-semibold truncate min-w-0">
            {activeSemester.academic_session_name || "2024/2025"} — {activeSemester.name}
          </span>
        ) : (
          <span>Academic Portal</span>
        )}
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/academic" className="flex items-center gap-2.5 min-w-0" onClick={() => setMenuOpen(false)}>
          <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg text-stone-900 leading-none">
                Academic Hub
              </span>
              <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                OAUSTECH
              </span>
            </div>
            <span className="text-[11px] text-stone-500 hidden sm:block leading-tight mt-0.5">
              Curated Course Resources
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-stone-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg transition ${
                link.active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-stone-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/academic/account"
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition border border-stone-200/70"
            title="My Account / Subscriptions"
          >
            <User className="w-4 h-4" />
          </Link>

          <Link
            href="/academic/subscribe"
            className="hidden sm:flex px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get Semester Access</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition border border-stone-200/70 cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-stone-200/80 bg-[#FDFBF7] px-4 py-3 space-y-1 text-sm font-medium text-stone-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg transition ${
                link.active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-stone-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/academic/account"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition"
          >
            <User className="w-4 h-4" />
            My Account
          </Link>
          <Link
            href="/academic/subscribe"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition"
          >
            <Sparkles className="w-4 h-4" />
            Get Semester Access
          </Link>
        </nav>
      )}
    </header>
  );
}
