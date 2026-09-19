"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, ArrowLeft, AlertCircle, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { paymentRequestSchema, PaymentRequestFormData } from "@/lib/validation/schemas";
import { donationConfig } from "@/data/donation";
import { Button } from "@/components/ui/button";

export function PaymentForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentRequestFormData>({
    resolver: zodResolver(paymentRequestSchema),
    defaultValues: {
      programme_name: "",
      programme_date: new Date().toISOString().split("T")[0],
      description: "",
      amount_per_person: 1000,
      bank_name: donationConfig.bankName,
      account_name: donationConfig.accountName,
      account_number: donationConfig.accountNumber,
      payment_instructions:
        "Please include your full name in the bank transfer remark/narration. Click 'Payment Completed' on the public page after transferring.",
      image_url: "",
    },
  });

  const onSubmit = async (data: PaymentRequestFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to create payment request");
        setSubmitting(false);
        return;
      }

      toast.success("Payment request created successfully!");
      router.push(`/admin/payments/${result.payment.id}`);
      router.refresh();
    } catch {
      toast.error("Network error. Could not create payment request.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-950 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Payments Overview
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Create Programme Payment Request</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Configure a manual bank transfer registration link with automatic 24-hour expiration.
          </p>
        </div>

        {/* Immutability Notice */}
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Immutable Record Notice:</strong> For financial safety and participant transparency, an
            existing payment request cannot be modified after generation. If details need correction later, close
            this request and generate a new one.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Programme Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Programme / Event Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Davidic Generation Believers Conference 2026"
              {...register("programme_name")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
            {errors.programme_name && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.programme_name.message}
              </p>
            )}
          </div>

          {/* Date and Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Programme Date *
              </label>
              <input
                type="date"
                {...register("programme_date")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.programme_date && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.programme_date.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Amount Per Person (₦) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="1000"
                {...register("amount_per_person")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.amount_per_person && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.amount_per_person.message}
                </p>
              )}
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="pt-2 border-t border-stone-100 space-y-4">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-800" />
              Receiving Bank Account Details
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Bank Name *</label>
              <input
                type="text"
                {...register("bank_name")}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.bank_name && (
                <p className="text-xs text-red-600 mt-1">{errors.bank_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Account Number *</label>
                <input
                  type="text"
                  {...register("account_number")}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
                {errors.account_number && (
                  <p className="text-xs text-red-600 mt-1">{errors.account_number.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Account Name *</label>
                <input
                  type="text"
                  {...register("account_name")}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
                {errors.account_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.account_name.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Payment Instructions */}
          <div className="pt-2 border-t border-stone-100 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Description / Overview</label>
              <textarea
                rows={2}
                placeholder="Brief information about this programme and what delegate fees cover..."
                {...register("description")}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Custom Payment Instructions</label>
              <textarea
                rows={2}
                placeholder="Specific guidance for payers regarding narration or verification..."
                {...register("payment_instructions")}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Optional Event Image / Flyer URL</label>
              <input
                type="text"
                placeholder="/assets/sunday-service.jpg or https://..."
                {...register("image_url")}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          {/* 24-Hour Expiry Reminder */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-forest-700 shrink-0" />
            <span>The system will automatically set expiration to exactly 24 hours from creation.</span>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest-900 hover:bg-forest-800 text-white font-medium py-3 rounded-xl cursor-pointer"
          >
            {submitting ? "Generating Payment Request..." : "Create & Generate QR Code"}
          </Button>
        </form>
      </div>
    </div>
  );
}
