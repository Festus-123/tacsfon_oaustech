"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Users,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Ban,
  Trash2,
  Calendar,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentRequest } from "@/data/payments";
import { Button } from "@/components/ui/button";

interface PaymentListProps {
  initialRequests: PaymentRequest[];
}

export function PaymentList({ initialRequests }: PaymentListProps) {
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const filtered = requests.filter(
    (r) =>
      r.programme_name.toLowerCase().includes(search.toLowerCase()) ||
      r.programme_date.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyUrl = (id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Public payment link copied!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClose = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to close registrations for "${name}"? New submissions will be blocked.`)) {
      return;
    }

    setLoadingActionId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      });

      if (!res.ok) {
        toast.error("Failed to close payment request");
        return;
      }

      toast.success("Payment request closed");
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CLOSED", closed_at: new Date().toISOString() } : r))
      );
    } catch {
      toast.error("Error closing payment request");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `WARNING: Are you sure you want to permanently delete "${name}"? All associated registrations will also be removed. This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoadingActionId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete payment request");
        return;
      }

      toast.success("Payment request deleted");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Error deleting payment request");
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-forest-950">
            Programme Payments & Registrations
          </h1>
          <p className="text-forest-700/80 text-sm mt-1">
            Create 24-hour manual bank transfer payment requests, generate QR codes, and export registered names.
          </p>
        </div>

        <Link href="/admin/payments/new">
          <Button className="bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs sm:text-sm px-4 py-2 gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create Payment Request</span>
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by programme name or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-forest-800 transition"
        />
      </div>

      {/* Requests Grid / Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif font-semibold text-lg text-stone-900">No Payment Requests Found</h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto mt-1 mb-5">
            {search
              ? "No requests match your search criteria."
              : "No programme payment requests have been created yet."}
          </p>
          <Link href="/admin/payments/new">
            <Button className="bg-forest-900 hover:bg-forest-800 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create First Request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((req) => {
            const isClosed = req.status === "CLOSED";
            const isExpired = req.status === "EXPIRED";
            const isActive = req.status === "ACTIVE";

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  {/* Status & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isClosed
                          ? "bg-stone-100 text-stone-600 border border-stone-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {req.status}
                    </span>

                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {req.programme_date}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-lg line-clamp-1">
                    {req.programme_name}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Rate</span>
                      <span className="font-semibold text-stone-900">
                        ₦{req.amount_per_person.toLocaleString()} / person
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-stone-400 block text-[10px] uppercase">Registered</span>
                      <span className="font-semibold text-emerald-900 flex items-center gap-1 justify-end">
                        <Users className="w-3 h-3" />
                        {req.total_people_count || 0}
                      </span>
                    </div>
                  </div>

                  {req.description && (
                    <p className="mt-3 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/payments/${req.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs h-8 text-forest-900 border-forest-200">
                        <QrCode className="w-3.5 h-3.5 mr-1" />
                        View / QR / Export
                      </Button>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopyUrl(req.id)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
                      title="Copy Public URL"
                    >
                      {copiedId === req.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <Link
                      href={`/pay/${req.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
                      title="Open Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {isActive ? (
                      <button
                        type="button"
                        disabled={loadingActionId === req.id}
                        onClick={() => handleClose(req.id, req.programme_name)}
                        className="text-[11px] text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        Close Registrations
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">Closed to new submissions</span>
                    )}

                    <button
                      type="button"
                      disabled={loadingActionId === req.id}
                      onClick={() => handleDelete(req.id, req.programme_name)}
                      className="text-[11px] text-red-600 hover:text-red-800 font-medium flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
