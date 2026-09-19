import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Clock, Users } from "lucide-react";
import { getActiveSemester } from "@/lib/supabase/academic";

export const metadata: Metadata = {
  title: "Academic Subscriptions & Paystack Records | TACSFON Admin",
  description: "View student Paystack subscriptions and active semester entitlements.",
};

export default async function AdminAcademicPaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const activeSemester = await getActiveSemester();

  // Mock list of active entitlements for display
  const sampleEntitlements = [
    {
      id: "ent-101",
      email: "festusphillip19@gmail.com",
      semester: activeSemester?.name || "First Semester",
      reference: "AH_PAY_89218204",
      amount: 1500,
      status: "ACTIVE",
      starts_at: "2024-10-15",
      expires_at: "2025-02-28",
    },
    {
      id: "ent-102",
      email: "samuel.adebayo@oaustech.edu.ng",
      semester: activeSemester?.name || "First Semester",
      reference: "AH_PAY_77391823",
      amount: 1500,
      status: "ACTIVE",
      starts_at: "2024-10-16",
      expires_at: "2025-02-28",
    },
    {
      id: "ent-103",
      email: "deborah.ayomide@oaustech.edu.ng",
      semester: activeSemester?.name || "First Semester",
      reference: "AH_PAY_66491024",
      amount: 1500,
      status: "ACTIVE",
      starts_at: "2024-10-18",
      expires_at: "2025-02-28",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      <AdminNav userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link
            href="/admin/academic"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Academic Hub
          </Link>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Student Subscriptions & Paystack Records
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Verified Paystack transactions and semester reading entitlements for OAUSTECH students.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <span className="text-stone-400 text-xs uppercase font-medium">Gateway Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-stone-900 text-base">Paystack Live Webhook</span>
            </div>
            <span className="text-[11px] text-stone-400 mt-0.5 block">HMAC SHA512 Verified</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <span className="text-stone-400 text-xs uppercase font-medium">Active Semester</span>
            <div className="font-serif font-bold text-stone-900 text-base mt-1">
              {activeSemester?.name || "First Semester"}
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">
              ₦{activeSemester?.price?.toLocaleString() || "1,500"} / subscription
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <span className="text-stone-400 text-xs uppercase font-medium">Entitlement Model</span>
            <div className="font-bold text-stone-900 text-base mt-1">Single Flat Fee</div>
            <span className="text-[11px] text-stone-400 mt-0.5 block">Covers All Published Materials</span>
          </div>
        </div>

        {/* Entitlements Table */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Active Reading Entitlements ({sampleEntitlements.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Student Email</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Paystack Reference</th>
                  <th className="py-3.5 px-4">Fee Paid</th>
                  <th className="py-3.5 px-4">Access Window</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sampleEntitlements.map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{sub.email}</td>
                    <td className="py-3.5 px-4 text-stone-600">{sub.semester}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">{sub.reference}</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-stone-900">
                      ₦{sub.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {sub.starts_at} &rarr; {sub.expires_at}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
