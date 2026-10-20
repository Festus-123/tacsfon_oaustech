"use client";

import { useState } from "react";
import { Sparkles, ShieldCheck, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SubscribeFormProps {
  // Display only: the amount charged is always taken from the active semester on the server
  price: number;
  semesterLabel: string;
  validUntil: string | null;
}

export function SubscribeForm({ price, semesterLabel, validUntil }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const priceLabel = `₦${price.toLocaleString()}`;

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
    <>
      {/* Package Summary Box */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between gap-3 font-medium text-stone-800">
          <span>{semesterLabel} Access</span>
          <span className="font-serif font-bold text-base text-blue-700 shrink-0">{priceLabel}</span>
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
          {validUntil && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Valid until {validUntil}</span>
            </div>
          )}
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
              <span>Proceed to Paystack Payment ({priceLabel})</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>256-bit encrypted transaction processed by Paystack</span>
      </div>
    </>
  );
}
