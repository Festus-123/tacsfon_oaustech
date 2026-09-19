import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaymentForm } from "@/components/admin/payments/payment-form";

export const metadata: Metadata = {
  title: "Create Programme Payment Request | TACSFON Admin",
  description: "Create a new programme payment request with automatic 24-hour expiration.",
};

export default async function NewPaymentRequestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaymentForm />
      </main>
    </div>
  );
}
