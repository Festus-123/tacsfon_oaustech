"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { AcademicHeader } from "@/components/academic/academic-header";
import { AcademicFooter } from "@/components/academic/academic-footer";

function CallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const simulated = searchParams.get("simulated") === "true";
  const emailParam = searchParams.get("email");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!reference) {
        setErrorMessage("No payment reference was returned.");
        setLoading(false);
        return;
      }

      try {
        const url = `/api/academic/paystack/verify?reference=${encodeURIComponent(
          reference
        )}&simulated=${simulated}&email=${encodeURIComponent(emailParam || "")}`;
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok && data.verified) {
          setVerified(true);
          setUserEmail(data.email || emailParam);
        } else {
          setErrorMessage(data.error || "Payment verification could not be confirmed.");
        }
      } catch {
        setErrorMessage("Network error verifying transaction.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [reference, simulated, emailParam]);

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-8 text-center space-y-5">
      {loading ? (
        <div className="py-10 space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="font-serif font-bold text-stone-900 text-lg">Confirming Semester Access...</h2>
          <p className="text-xs text-stone-500">
            Verifying Paystack transaction reference {reference}
          </p>
        </div>
      ) : verified ? (
        <div className="space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Payment Verified &bull; Access Active
          </span>

          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Welcome to Academic Hub!
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Your semester access has been successfully granted for <strong>{userEmail}</strong>. You now
            have full reading access to all examination past questions, laboratory manuals, and lecture notes.
          </p>

          <div className="pt-3">
            <Link
              href="/academic/materials"
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse & Read Course Materials</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-serif font-bold text-stone-900">Verification Incomplete</h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {errorMessage || "We could not confirm this transaction with Paystack."}
          </p>

          <div className="pt-2">
            <Link
              href="/academic/subscribe"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium"
            >
              Retry Subscription
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcademicCallbackPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900">
      <AcademicHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-center text-sm text-stone-500">Loading payment details...</div>}>
          <CallbackContent />
        </Suspense>
      </main>

      <AcademicFooter />
    </div>
  );
}
