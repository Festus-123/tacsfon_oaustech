import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaymentDetail } from "@/components/admin/payments/payment-detail";
import { getAdminPaymentRequestById } from "@/lib/supabase/payments";
import { generateQrDataUrl } from "@/lib/qr/generate";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getAdminPaymentRequestById(id);

  if (!data.request) {
    return {
      title: "Payment Request Not Found | TACSFON Admin",
    };
  }

  return {
    title: `${data.request.programme_name} — Payment Details | TACSFON Admin`,
  };
}

export default async function AdminPaymentDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const data = await getAdminPaymentRequestById(id);

  if (!data.request) {
    notFound();
  }

  // Share link / QR code use the configured site URL, or the address this page was opened on
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const publicUrl = `${appUrl}/pay/${id}`;
  const qrDataUrl = await generateQrDataUrl(publicUrl);

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaymentDetail
          payment={data.request}
          qrDataUrl={qrDataUrl}
          participants={data.people}
        />
      </main>
    </div>
  );
}
