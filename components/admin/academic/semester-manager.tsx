"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Semester, AcademicSession } from "@/data/academic";
import { Button } from "@/components/ui/button";

const DEFAULT_START_DATE = "2026-10-12";
const DEFAULT_END_DATE = "2027-01-11";

interface SemesterManagerProps {
  initialSemesters: Semester[];
  sessions: AcademicSession[];
}

export function SemesterManager({ initialSemesters, sessions }: SemesterManagerProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    session_name: sessions[0]?.name || "",
    name: "First Semester",
    start_date: DEFAULT_START_DATE,
    end_date: DEFAULT_END_DATE,
    price: 1500,
    status: "ACTIVE" as Semester["status"],
    description: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}\/\d{4}$/.test(formData.session_name.trim())) {
      toast.error("Academic session must look like 2025/2026.");
      return;
    }
    if (new Date(formData.end_date).getTime() <= new Date(formData.start_date).getTime()) {
      toast.error("End date must be after start date.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/academic/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, session_name: formData.session_name.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to save semester.");
        return;
      }

      setSemesters((prev) => [data.semester as Semester, ...prev]);
      toast.success("Semester configured successfully!");
      setShowModal(false);
    } catch {
      toast.error("Network error while saving semester.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Semester["status"]) => {
    try {
      const res = await fetch(`/api/admin/academic/semesters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update semester status.");
        return;
      }

      setSemesters((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      toast.success(`Semester status set to ${newStatus}`);
    } catch {
      toast.error("Network error while updating semester.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/academic"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Academic Hub
          </Link>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">
            Semesters & Access Pricing
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Configure active academic periods, dates, and flat Paystack subscription rates.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm px-4 py-2 gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Semester</span>
        </Button>
      </div>

      {/* Semesters Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Session & Semester</th>
                <th className="py-3.5 px-4">Access Dates</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {semesters.map((sem) => {
                const isActive = sem.status === "ACTIVE";
                return (
                  <tr key={sem.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900 text-sm">{sem.name}</div>
                      <span className="text-[11px] text-stone-500">{sem.academic_session_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{sem.start_date} &rarr; {sem.end_date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-stone-900 text-sm">
                      ₦{sem.price.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={sem.status}
                        onChange={(e) => handleStatusChange(sem.id, e.target.value as Semester["status"])}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : sem.status === "DRAFT"
                            ? "bg-stone-100 text-stone-600 border-stone-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isActive ? (
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          Current Subscription Offer
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(sem.id, "ACTIVE")}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          Set as Active
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {semesters.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 px-4 text-center text-stone-500">
                    No semesters yet. Click &quot;Add New Semester&quot; to create one; uploads need a
                    registered semester before they can be published.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Semester Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-5">
            <h2 className="text-xl font-serif font-bold text-stone-900">Configure Academic Semester</h2>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Academic Session</label>
                <input
                  type="text"
                  list="academic-session-options"
                  placeholder="e.g. 2025/2026"
                  required
                  value={formData.session_name}
                  onChange={(e) => setFormData({ ...formData, session_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
                />
                <datalist id="academic-session-options">
                  {sessions.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
                <p className="text-[11px] text-stone-500">
                  Pick an existing session or type a new one; it is created automatically.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Semester Name</label>
                <input
                  type="text"
                  placeholder="First Semester"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 uppercase">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Subscription Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Semester["status"] })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
                >
                  <option value="ACTIVE">ACTIVE (Immediate checkout offer)</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? "Saving..." : "Save Semester"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
