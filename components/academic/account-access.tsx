"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, BookOpen, Sparkles, Mail, KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";

export interface AccountAccessInfo {
  email: string;
  semesterLabel: string;
  expiresAt: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export function AccountAccess({ access }: { access: AccountAccessInfo | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function post(url: string, body?: object) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { ok, data } = await post("/api/academic/access/request-code", { email });
      if (!ok) {
        toast.error(data.error || "Could not send the code.");
        return;
      }
      setCodeSent(true);
      toast.success(data.message);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { ok, data } = await post("/api/academic/access/verify-code", { code });
      if (!ok) {
        toast.error(data.error || "Could not confirm the code.");
        return;
      }
      toast.success("Access restored on this device.");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await post("/api/academic/access/logout");
      toast.info("Signed out of Academic Hub on this device.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (access) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-stone-900 text-base">{access.semesterLabel}</h3>
              <span className="text-xs text-stone-500 break-all">{access.email}</span>
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Entitlement</span>
            <span className="font-medium text-stone-800">Full access to all courses and materials</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Access Ends</span>
            <span className="font-medium text-stone-800 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              {formatDate(access.expiresAt)}
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
          <button
            type="button"
            onClick={signOut}
            disabled={loading}
            className="py-3 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out of this device</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-stone-600 leading-relaxed">
        Paid on another phone or browser, or cleared your browser data? Enter the email you paid with and
        we will send you a 6-digit code to restore your access here.
      </div>

      {!codeSent ? (
        <form onSubmit={requestCode} className="space-y-3">
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Email Used For Payment
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
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{loading ? "Sending..." : "Send Code"}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-3">
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
            6-Digit Code Sent To {email}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-lg tracking-[0.4em] font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{loading ? "Checking..." : "Restore Access"}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setCode("");
            }}
            className="text-xs text-blue-600 hover:underline cursor-pointer"
          >
            Use a different email or resend the code
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span>No subscription yet?</span>
        <Link
          href="/academic/subscribe"
          className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Get Semester Access
        </Link>
      </div>
    </div>
  );
}
