import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaymentList } from "@/components/admin/payments/payment-list";
import { getAdminPaymentRequests } from "@/lib/supabase/payments";

export const metadata: Metadata = {
  title: "Programme Payments & Registrations | TACSFON Admin",
  description: "Manage 24-hour programme payment requests and registrations.",
};

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const requests = await getAdminPaymentRequests();

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaymentList initialRequests={requests} />
      </main>
    </div>
  );
}
