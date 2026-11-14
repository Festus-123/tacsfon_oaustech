"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

type TxStatus = "PENDING" | "PAID" | "FAILED";

interface StatusResponse {
  reference: string;
  status: TxStatus;
  amount: number;
  passengers: number;
  programme_name: string | null;
  payment_request_id: string;
  paid_at: string | null;
}

const POLL_MS = 5000;
const MAX_POLLS = 36; // ~3 minutes, then ask the student to check back

export function PaymentStatusView() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const polls = useRef(0);

  // Squad appends the reference to the redirect URL; fall back to the one saved before redirecting.
  const urlRef =
    searchParams.get("reference") || searchParams.get("transaction_ref") || searchParams.get("ref");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function check() {
      let reference = urlRef;
      if (!reference) {
        try {
          reference = sessionStorage.getItem("tacsfon_squad_ref");
        } catch {
          /* storage unavailable */
        }
      }
      if (!reference) {
        setError(
          "No payment reference was found. If you have paid, your registration will still be confirmed automatically."
        );
        return;
      }

      try {
        const res = await fetch(`/api/payments/squad/status?reference=${encodeURIComponent(reference)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Could not check the payment status.");
          return;
        }
        setError(null);
        setData(json);
        if (json.status === "PENDING") {
          polls.current += 1;
          if (polls.current >= MAX_POLLS) {
            setGaveUp(true);
            return;
          }
          timer = setTimeout(check, POLL_MS);
        } else {
          try {
            sessionStorage.removeItem("tacsfon_squad_ref");
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (!cancelled) timer = setTimeout(check, POLL_MS);
      }
    }

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [urlRef]);

  const backHref = data ? `/pay/${data.payment_request_id}` : "/";

  let icon = <Clock className="w-8 h-8 animate-pulse" />;
  let tone = "bg-amber-50 text-amber-800";
  let title = "Confirming your payment…";
  let message =
    "We are waiting for confirmation from our payment provider. This usually takes a few seconds. Please don't close this page.";

  if (error && !data) {
    icon = <AlertCircle className="w-8 h-8" />;
    title = "We couldn't check this payment";
    message = error;
  } else if (data?.status === "PAID") {
    icon = <CheckCircle2 className="w-8 h-8" />;
    tone = "bg-emerald-100 text-emerald-800";
    title = "Payment confirmed";
    message = "Your payment was verified and your registration is complete. Thank you!";
  } else if (data?.status === "FAILED") {
    icon = <XCircle className="w-8 h-8" />;
    tone = "bg-red-50 text-red-700";
    title = "Payment unsuccessful";
    message =
      "This payment was not completed, so no registration was made. You have not been registered; you can try again.";
  } else if (gaveUp) {
    title = "Still waiting for confirmation";
    message =
      "We haven't received confirmation yet. If you already transferred, your registration will be confirmed automatically once the payment arrives. You can refresh this page to check again.";
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-5 shadow-sm">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${tone}`}>{icon}</div>
      <h1 className="font-serif text-2xl font-bold text-stone-900">{title}</h1>
      <p className="text-stone-600 text-sm leading-relaxed">{message}</p>

      {data && (
        <dl className="text-left text-sm bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1.5">
          {data.programme_name && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Programme</dt>
              <dd className="font-medium text-stone-800 text-right">{data.programme_name}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Passengers</dt>
            <dd className="font-medium text-stone-800">{data.passengers}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Amount</dt>
            <dd className="font-medium text-stone-800">₦{data.amount.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Reference</dt>
            <dd className="font-mono text-xs text-stone-700 break-all text-right">{data.reference}</dd>
          </div>
        </dl>
      )}

      <div className="pt-1 flex flex-col sm:flex-row gap-2 justify-center">
        {(data?.status === "FAILED" || data?.status === "PAID") && data && (
          <Link
            href={backHref}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-medium transition"
          >
            {data.status === "FAILED" ? "Try again" : "View registration"}
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-sm font-medium transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
