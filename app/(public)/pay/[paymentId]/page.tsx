import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getPublicPaymentRequest, getPublicRegisteredNames } from "@/lib/supabase/payments";
import { PaymentView } from "@/components/payments/payment-view";

interface PageProps {
  params: Promise<{ paymentId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { paymentId } = await params;
  const payment = await getPublicPaymentRequest(paymentId);

  if (!payment) {
    return {
      title: "Payment Request Not Found | TACSFON OAUSTECH",
      description: "The requested fellowship payment request could not be found or has expired.",
    };
  }

  return {
    title: `${payment.programme_name} — Registration & Payment | TACSFON OAUSTECH`,
    description: `Official registration for ${payment.programme_name} organized by TACSFON (OAUSTECH).`,
  };
}

export default async function PublicPaymentPage({ params }: PageProps) {
  const { paymentId } = await params;
  const payment = await getPublicPaymentRequest(paymentId);

  if (!payment) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Payment Request Unavailable
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            This programme registration link is invalid or has expired. If you believe this is an error,
            please reach out to the fellowship executive team.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const registeredPeople = await getPublicRegisteredNames(paymentId);
  const initialNames = registeredPeople.map((p) => p.name);

  return (
    <div className="min-h-screen bg-stone-50/60 py-10 md:py-16 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900/80 hover:text-emerald-950 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Fellowship Home
        </Link>
      </div>

      <PaymentView payment={payment} initialRegisteredNames={initialNames} />
    </div>
  );
}
