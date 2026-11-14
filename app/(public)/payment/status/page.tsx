import { Suspense } from "react";
import { Metadata } from "next";
import { PaymentStatusView } from "@/components/payments/payment-status-view";

export const metadata: Metadata = {
  title: "Payment Status | TACSFON OAUSTECH",
  robots: { index: false, follow: false },
};

export default function PaymentStatusPage() {
  return (
    <div className="min-h-[70vh] bg-stone-50/60 py-12 px-4 flex items-center justify-center">
      <Suspense fallback={null}>
        <PaymentStatusView />
      </Suspense>
    </div>
  );
}
