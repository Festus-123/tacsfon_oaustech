import Link from "next/link";
import { Check, Sparkles, Calendar, ShieldCheck, Mail, Phone } from "lucide-react";
import { Semester, academicSupport } from "@/data/academic";

interface PricingCardProps {
  activeSemester: Semester | null;
}

export function AcademicPricingCard({ activeSemester }: PricingCardProps) {
  const price = activeSemester?.price ? `₦${activeSemester.price.toLocaleString()}` : "₦1,500";
  const sessionName = activeSemester?.academic_session_name || "2024/2025";
  const semesterName = activeSemester?.name || "First Semester";
  const startDate = activeSemester?.start_date || "2024-10-15";
  const endDate = activeSemester?.end_date || "2025-02-28";

  const benefits = [
    "Full access to all verified Past Examination Questions",
    "Complete Departmental Laboratory & Course Manuals",
    "Structured lecture outlines and revision workbooks",
    "Seamless mobile-first reading on phone or laptop",
    "Single payment covers every registered course for the entire semester",
    "Valid through the official semester examination conclusion",
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
            Transparent Semester Access
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            One flat fee for your entire semester.
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            No recurring hidden subscriptions or course micro-charges. Your one-time access token unlocks
            all published materials for this semester until the configured examination end date.
          </p>
        </div>

        {/* Card */}
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-lg p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              {sessionName} &bull; {semesterName}
            </span>
            <span className="text-xs text-stone-400 font-medium">Single Payment</span>
          </div>

          <div className="space-y-1 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-stone-900">{price}</span>
              <span className="text-stone-500 text-xs sm:text-sm">/ full semester</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Access Window: {startDate} &rarr; {endDate}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-stone-100 text-xs sm:text-sm text-stone-700">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 space-y-3">
            <Link
              href="/academic/subscribe"
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Subscribe via Paystack</span>
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure card, bank transfer, and USSD payments via Paystack</span>
            </div>
          </div>
        </div>

        {/* Support contacts under card */}
        <div className="mt-8 text-center text-xs text-stone-500 flex flex-wrap items-center justify-center gap-4">
          <span>Need help with payment or course materials?</span>
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
    </section>
  );
}
