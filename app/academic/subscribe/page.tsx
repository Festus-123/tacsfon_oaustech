"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, ShieldCheck, Mail, Phone, Lock, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";
import { academicSupport } from "@/data/academic";

export default function AcademicSubscribePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please provide a valid student or personal email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/academic/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.authorization_url) {
        toast.error(data.error || "Could not initialize checkout. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Redirecting to Paystack payment gateway...");
      window.location.href = data.authorization_url;
    } catch {
      toast.error("Network error. Please check your connection and retry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900">
      <AcademicHeader />

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

          {/* Package Summary Box */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between font-medium text-stone-800">
              <span>2024/2025 &bull; First Semester Access</span>
              <span className="font-serif font-bold text-base text-blue-700">₦1,500</span>
            </div>

            <div className="space-y-1.5 text-stone-500 pt-2 border-t border-stone-200/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Unlocks all verified past questions across all departments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Full access to practical manuals & lecture notes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Valid through examination conclusion (Feb 2025)</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Student Email Address *
              </label>
              <input
                type="email"
                placeholder="your.name@oaustech.edu.ng or personal email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
              <span className="text-[11px] text-stone-400 block">
                Your payment receipt and reading entitlement will be linked to this email.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Paystack...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to Paystack Payment (₦1,500)</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-bit encrypted transaction processed by Paystack</span>
          </div>
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
