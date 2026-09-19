"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  ExternalLink,
  Users,
  Clock,
  Ban,
  Trash2,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentRequest } from "@/data/payments";
import { Button } from "@/components/ui/button";

interface ParticipantRecord {
  name: string;
  programme: string;
  programme_date: string;
  amount_per_person: number;
  total_submission_amount: number;
  submission_time: string;
}

interface PaymentDetailProps {
  payment: PaymentRequest;
  qrDataUrl: string;
  participants: ParticipantRecord[];
}

export function PaymentDetail({ payment, qrDataUrl, participants }: PaymentDetailProps) {
  const router = useRouter();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [status, setStatus] = useState(payment.status);
  const [isProcessing, setIsProcessing] = useState(false);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/pay/${payment.id}`
      : `/pay/${payment.id}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    toast.success("Public payment link copied to clipboard!");
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-${payment.programme_name.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR Code downloaded successfully!");
  };

  const handleExportCsv = () => {
    if (participants.length === 0) {
      toast.info("No registered participants to export yet.");
      return;
    }

    const headers = ["Name", "Programme", "Programme Date", "Amount Per Person", "Total Submission Amount", "Submission Time"];
    const rows = participants.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.programme.replace(/"/g, '""')}"`,
      `"${p.programme_date}"`,
      p.amount_per_person,
      p.total_submission_amount,
      `"${new Date(p.submission_time).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Registrations-${payment.programme_name.replace(/[^a-zA-Z0-9]/g, "-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const handleClose = async () => {
    if (!confirm("Are you sure you want to close this payment request? No new registrations will be accepted.")) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      });

      if (!res.ok) {
        toast.error("Failed to close payment request");
        return;
      }

      toast.success("Payment request closed");
      setStatus("CLOSED");
    } catch {
      toast.error("Error closing request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "WARNING: Are you sure you want to permanently delete this payment request? All participant records will be deleted. This cannot be undone."
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete request");
        return;
      }

      toast.success("Payment request deleted");
      router.push("/admin/payments");
      router.refresh();
    } catch {
      toast.error("Error deleting request");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-950 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Payments Overview
        </Link>
      </div>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : status === "CLOSED"
                    ? "bg-stone-100 text-stone-600 border border-stone-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {status}
              </span>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {payment.programme_date}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
              {payment.programme_name}
            </h1>

            {payment.description && (
              <p className="text-stone-600 text-sm max-w-xl leading-relaxed">
                {payment.description}
              </p>
            )}
          </div>

          {/* Rate Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-right shrink-0">
            <span className="text-stone-400 text-xs uppercase block">Amount Per Person</span>
            <span className="text-xl font-serif font-bold text-forest-950">
              ₦{payment.amount_per_person.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Public Sharing & Actions Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
          {/* Public Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Public Payment Link (UUID)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="shrink-0 text-xs border-forest-200 text-forest-900"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="ml-1">{copiedUrl ? "Copied" : "Copy"}</span>
              </Button>
              <Link href={`/pay/${payment.id}`} target="_blank">
                <Button size="sm" variant="outline" className="shrink-0 text-xs border-forest-200 text-forest-900">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between md:justify-end gap-6 text-xs text-stone-500 pt-3 md:pt-0">
            <div>
              <span className="block text-stone-400">Created:</span>
              <span className="font-medium text-stone-700">{new Date(payment.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-stone-400">Expires:</span>
              <span className="font-medium text-stone-700">{new Date(payment.expires_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: QR Code & Bank Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QR Code Section */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              <QrCode className="w-4 h-4 text-forest-800" />
              Event Payment QR Code
            </div>

            {qrDataUrl ? (
              <div className="inline-block p-2 bg-stone-50 rounded-xl border border-stone-200 shadow-2xs">
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${payment.programme_name}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400">
                Generating QR...
              </div>
            )}
            <p className="text-[11px] text-stone-500 mt-2">
              Visitors can scan this QR code with their mobile phone camera to open the payment page.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadQr}
            className="w-full text-xs text-forest-900 border-forest-200 hover:bg-forest-50"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download QR (PNG)
          </Button>
        </div>

        {/* Bank Details & Controls Section */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-800" />
              Receiving Bank Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px] uppercase">Bank</span>
                <span className="font-semibold text-stone-800 text-sm mt-0.5 block">{payment.bank_name}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px] uppercase">Account Number</span>
                <span className="font-mono font-bold text-forest-950 text-sm mt-0.5 block">
                  {payment.account_number}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[10px] uppercase">Account Name</span>
                <span className="font-medium text-stone-800 text-xs mt-0.5 block">{payment.account_name}</span>
              </div>
            </div>

            {payment.payment_instructions && (
              <div className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-100 leading-relaxed">
                <strong className="text-stone-700">Instructions:</strong> {payment.payment_instructions}
              </div>
            )}
          </div>

          {/* Admin Management Controls */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            {status === "ACTIVE" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={handleClose}
                className="text-xs text-amber-800 border-amber-200 hover:bg-amber-50"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                Close Registrations
              </Button>
            ) : (
              <span className="text-xs text-stone-500 italic">Submissions closed</span>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={handleDelete}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Request
            </Button>
          </div>
        </div>
      </div>

      {/* Registered Participants Table & CSV Export */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-forest-800" />
              Registered Participants ({participants.length})
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              Verified names registered through this payment request.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleExportCsv}
            disabled={participants.length === 0}
            className="bg-forest-900 hover:bg-forest-800 text-white text-xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Names to CSV
          </Button>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No registered participants recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Rate Snapshot</th>
                  <th className="py-3 px-4">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {participants.map((person, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/60 transition">
                    <td className="py-3 px-4 font-mono text-stone-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-stone-900">{person.name}</td>
                    <td className="py-3 px-4 text-stone-600">₦{person.amount_per_person.toLocaleString()}</td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(person.submission_time).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
