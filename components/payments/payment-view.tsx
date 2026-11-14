"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Check,
  Clock,
  AlertCircle,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentRequest } from "@/data/payments";

interface PaymentViewProps {
  payment: PaymentRequest;
  initialRegisteredNames: string[];
}

export function PaymentView({ payment, initialRegisteredNames }: PaymentViewProps) {
  const [numPeople, setNumPeople] = useState<number>(1);
  const [names, setNames] = useState<string[]>([""]);
  const registeredNames = initialRegisteredNames;
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(payment.status !== "ACTIVE");

  // Countdown calculation
  useEffect(() => {
    function updateCountdown() {
      const now = Date.now();
      const expiry = new Date(payment.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0 || payment.status !== "ACTIVE") {
        setTimeLeft("00h 00m 00s");
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}h ${minutes
          .toString()
          .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [payment.expires_at, payment.status]);

  // Handle changing number of people
  const handleNumPeopleChange = (val: number) => {
    const count = Math.max(1, Math.min(20, val));
    setNumPeople(count);
    setNames((prev) => {
      const newNames = [...prev];
      while (newNames.length < count) {
        newNames.push("");
      }
      return newNames.slice(0, count);
    });
  };

  const handleNameChange = (index: number, value: string) => {
    setNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isExpired) {
      toast.error("This payment request is no longer active.");
      return;
    }

    // Validate names
    const trimmed = names.map((n) => n.trim()).filter((n) => n.length > 0);
    if (trimmed.length !== numPeople) {
      toast.error(`Please provide full names for all ${numPeople} passengers.`);
      return;
    }

    // Check duplicate names in this submission
    const lowercased = trimmed.map((n) => n.toLowerCase());
    if (new Set(lowercased).size !== trimmed.length) {
      toast.error("Please enter unique names. Duplicate names in the same submission are not allowed.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/payments/squad/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_request_id: payment.id,
            names: trimmed,
            email: email.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.checkoutUrl) {
          toast.error(data.error || "Could not start the payment. Please try again.");
          return;
        }

        try {
          sessionStorage.setItem("tacsfon_squad_ref", data.reference);
        } catch {
          /* storage unavailable */
        }
        // Squad's secure checkout. Registration is only recorded once the payment is verified.
        window.location.href = data.checkoutUrl;
      } catch {
        toast.error("Network error. Please check your connection and try again.");
      }
    });
  };

  const totalAmount = payment.amount_per_person * numPeople;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header & Status Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 shadow-sm overflow-hidden relative">
        {/* Decorative subtle accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-500" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200/60">
            <Building2 className="w-3.5 h-3.5" />
            TACSFON OAUSTECH
          </span>

          {/* Expiration Timer Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isExpired
                ? "bg-stone-100 text-stone-600 border-stone-300"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {isExpired ? "Request Closed / Expired" : `Valid for: ${timeLeft}`}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          {payment.programme_name}
        </h1>

        <div className="flex items-center gap-2 mt-2 text-stone-600 text-sm">
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{payment.programme_date}</span>
        </div>

        {payment.description && (
          <p className="mt-4 text-stone-600 leading-relaxed text-sm md:text-base border-t border-stone-100 pt-4">
            {payment.description}
          </p>
        )}

        {payment.image_url && (
          <div className="mt-5 rounded-xl overflow-hidden border border-stone-200 aspect-[16/9] relative bg-stone-100">
            <Image
              src={payment.image_url}
              alt={payment.programme_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}
      </div>

      {/* Closed / Expired Notice */}
      {isExpired && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-5 flex items-start gap-3.5 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">This payment request is no longer active</h3>
            <p className="text-xs md:text-sm text-amber-800/90 mt-1 leading-relaxed">
              The 24-hour registration window has elapsed or the organizer has closed submissions. New
              payments can no longer be accepted. Previously registered participants are displayed below.
            </p>
          </div>
        </div>
      )}

      {/* Secure payment info */}
      <div className="bg-emerald-950 text-emerald-50 rounded-2xl p-6 md:p-8 shadow-md border border-emerald-900/60 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-800/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif font-semibold text-lg text-white">Secure Bank Transfer Payment</h2>
          </div>
          <span className="text-xs bg-emerald-900/80 text-amber-300 font-medium px-2.5 py-1 rounded-md border border-amber-500/20 whitespace-nowrap">
            ₦{payment.amount_per_person.toLocaleString()} / person
          </span>
        </div>
        <p className="mt-4 text-xs md:text-sm text-emerald-200/90 leading-relaxed">
          Enter the passenger names below and tap <strong>Pay Now</strong>. You will get a one-time account
          number to transfer to, and your registration is confirmed automatically as soon as the payment
          arrives.
        </p>
        {payment.payment_instructions && (
          <p className="mt-4 text-xs text-emerald-200/90 leading-relaxed bg-emerald-900/30 p-3 rounded-lg border border-emerald-800/40">
            <strong>Note:</strong> {payment.payment_instructions}
          </p>
        )}
      </div>

      {/* Registration & Confirmation Form */}
      {!isExpired && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">Delegate Registration</h3>
                <p className="text-stone-500 text-xs md:text-sm mt-1">
                  You can register for yourself or for multiple participants in a single payment.
                </p>
              </div>

              {/* Number of Passengers Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Number of People
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleNumPeopleChange(n)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                        numPeople === n
                          ? "bg-emerald-900 text-white shadow-sm"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-xs text-stone-400">Other:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={numPeople}
                      onChange={(e) => handleNumPeopleChange(parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1.5 border border-stone-200 rounded-lg text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Name Inputs */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Participant Full Name{numPeople > 1 ? "s" : ""}
                </label>
                {names.map((name, idx) => (
                  <div key={idx} className="relative">
                    <input
                      type="text"
                      placeholder={`Participant ${idx + 1} Full Name (e.g. John Doe)`}
                      value={name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payer email (receipt + payment provider requirement) */}
              <div className="space-y-2">
                <label htmlFor="payer-email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Your Email
                </label>
                <input
                  id="payer-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition"
                />
              </div>

              {/* Calculated Total Amount Card */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-medium">Total Amount</span>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {numPeople} × ₦{payment.amount_per_person.toLocaleString()}
                  </div>
                </div>
                <div className="text-xl font-serif font-bold text-emerald-900">
                  ₦{totalAmount.toLocaleString()}
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                You will be taken to our secure payment partner (Squad). Your registration is only confirmed
                after the payment is verified — no manual confirmation is needed.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 text-white font-medium text-sm md:text-base flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redirecting to secure payment...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Pay Now · ₦{totalAmount.toLocaleString()}</span>
                  </>
                )}
              </button>
          </form>
        </div>
      )}

      {/* Public Registered Participants List */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-800" />
            <h3 className="font-serif font-bold text-stone-900 text-lg">Registered Participants</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            {registeredNames.length} Confirmed
          </span>
        </div>

        {registeredNames.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No confirmed registrations yet.
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
            {registeredNames.map((name, index) => (
              <li key={index} className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-medium text-stone-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-xs flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  {name}
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Confirmed
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
