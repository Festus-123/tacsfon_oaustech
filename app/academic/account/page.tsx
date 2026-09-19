"use client";

import { useState } from "react";
import Link from "next/link";
import { User, ShieldCheck, Clock, CheckCircle2, BookOpen, Sparkles, ArrowRight, Search } from "lucide-react";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { initialSemesters } from "@/data/academic";

export default function AcademicAccountPage() {
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);
  const [activePlan, setActivePlan] = useState<any | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Simulate account lookup
    setSearched(true);
    setActivePlan({
      email: email.trim(),
      semesterName: "First Semester (2024/2025)",
      status: "ACTIVE",
      startsAt: "2024-10-15",
      expiresAt: "2025-02-28",
      accessLevel: "Full Access to All Departments & Courses",
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900">
      <AcademicHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Student Access & Entitlements
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Check your current semester subscription status and reading privileges.
          </p>
        </div>

        {/* Email Lookup Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Enter Registered Student Email
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="e.g. yourname@oaustech.edu.ng"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify Access</span>
              </button>
            </div>
          </form>

          {searched && activePlan && (
            <div className="pt-6 border-t border-stone-100 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      {activePlan.semesterName}
                    </h3>
                    <span className="text-xs text-stone-500">{activePlan.email}</span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {activePlan.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Entitlement</span>
                  <span className="font-medium text-stone-800">{activePlan.accessLevel}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Expiration Date</span>
                  <span className="font-medium text-stone-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {activePlan.expiresAt}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/academic/materials"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Course Materials</span>
                </Link>

                <Link
                  href="/academic/subscribe"
                  className="py-3 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium text-xs flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Renew / Change Semester</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <AcademicFooter />
    </div>
  );
}
