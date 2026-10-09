"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Check,
  Eye,
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  Sparkles,
  Send,
  HelpCircle,
  Mail,
  Copy,
  CheckCircle2,
  XCircle,
  FileQuestion,
  RefreshCw,
  FolderSync,
} from "lucide-react";
import { toast } from "sonner";
import {
  AcademicMaterial,
  MaterialType,
  School,
  Department,
  Course,
  Semester,
} from "@/data/academic";
import { NebulaDocumentGroup, NebulaClassification, formatNormalizedFilename } from "@/lib/nebula/client";

interface MaterialsManagerProps {
  initialMaterials: AcademicMaterial[];
  materialTypes: MaterialType[];
  schools: School[];
  departments: Department[];
  courses: Course[];
  semesters: Semester[];
}

export function MaterialsManager({
  initialMaterials,
  materialTypes,
  schools,
  departments,
  courses,
  semesters,
}: MaterialsManagerProps) {
  // Security Gate State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [checkingSecurity, setCheckingSecurity] = useState<boolean>(true);
  const [securityKeyInput, setSecurityKeyInput] = useState<string>("");
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);

  // Recovery State
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [recoveryMode, setRecoveryMode] = useState<"question" | "email">("question");
  const [recoveryQuestion, setRecoveryQuestion] = useState<string>("What is your favorite color?");
  const [recoveryAnswer, setRecoveryAnswer] = useState<string>("");
  const [recoveryEmailOtp, setRecoveryEmailOtp] = useState<string>("");
  const [recoveryMaskedEmail, setRecoveryMaskedEmail] = useState<string>("");
  const [otpDispatched, setOtpDispatched] = useState<boolean>(false);
  const [recoveryLoading, setRecoveryLoading] = useState<boolean>(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);

  // Materials & Upload State
  const [materials, setMaterials] = useState<AcademicMaterial[]>(initialMaterials);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStage, setUploadStage] = useState<string>("");

  // Review Workflow State: Approved, Isolated, Rejected
  const [approvedGroups, setApprovedGroups] = useState<NebulaDocumentGroup[]>([]);
  const [isolatedGroups, setIsolatedGroups] = useState<NebulaDocumentGroup[]>([]);
  const [rejectedGroups, setRejectedGroups] = useState<NebulaDocumentGroup[]>([]);
  const [reviewTab, setReviewTab] = useState<"approved" | "isolated" | "rejected">("approved");

  // Editing / Missing Info Modal
  const [editingGroup, setEditingGroup] = useState<NebulaDocumentGroup | null>(null);
  const [editForm, setEditForm] = useState<Partial<NebulaClassification>>({});
  const [isResubmitting, setIsResubmitting] = useState<boolean>(false);

  // Published Filter
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Check Security Gate on Load
  useEffect(() => {
    async function checkSecurityStatus() {
      try {
        const res = await fetch("/api/admin/academic/security/status");
        const data = await res.json();
        setIsUnlocked(!!data.unlocked);
        if (data.question) {
          setRecoveryQuestion(data.question);
        }
      } catch {
        setIsUnlocked(false);
      } finally {
        setCheckingSecurity(false);
      }
    }

    checkSecurityStatus();
  }, []);

  // Handle Master Key Unlock
  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!securityKeyInput.trim()) {
      toast.error("Please enter the Academic Hub security key.");
      return;
    }

    setUnlockLoading(true);
    try {
      const res = await fetch("/api/admin/academic/security/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: securityKeyInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Invalid security key. Access denied.");
        return;
      }

      setIsUnlocked(true);
      setSecurityKeyInput("");
      toast.success("Academic Hub document ingestion unlocked.");
    } catch {
      toast.error("Network error validating security key.");
    } finally {
      setUnlockLoading(false);
    }
  }

  // Handle Lock
  async function handleLock() {
    try {
      await fetch("/api/admin/academic/security/lock", { method: "POST" });
      setIsUnlocked(false);
      toast.info("Academic Hub document ingestion locked.");
    } catch {
      setIsUnlocked(false);
    }
  }

  // Handle Recovery Question
  async function handleQuestionRecovery(e: React.FormEvent) {
    e.preventDefault();
    if (!recoveryAnswer.trim()) {
      toast.error("Please provide the answer.");
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await fetch("/api/admin/academic/security/recover-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: recoveryAnswer.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Incorrect recovery answer.");
        return;
      }

      setNewlyGeneratedKey(data.newKey);
      toast.success("Security key reset successfully.");
    } catch {
      toast.error("Failed to process recovery.");
    } finally {
      setRecoveryLoading(false);
    }
  }

  // Handle Dispatch Email OTP
  async function handleRequestEmailOtp() {
    setRecoveryLoading(true);
    try {
      const res = await fetch("/api/admin/academic/security/email-request", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to dispatch recovery email.");
        return;
      }

      setRecoveryMaskedEmail(data.maskedEmail || "configured admin email");
      setOtpDispatched(true);
      toast.success(data.message || "Recovery code sent.");
    } catch {
      toast.error("Network error sending recovery code.");
    } finally {
      setRecoveryLoading(false);
    }
  }

  // Handle Verify Email OTP
  async function handleVerifyEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!recoveryEmailOtp.trim()) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await fetch("/api/admin/academic/security/email-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: recoveryEmailOtp.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Invalid or expired code.");
        return;
      }

      setNewlyGeneratedKey(data.newKey);
      toast.success("Security key reset successfully.");
    } catch {
      toast.error("Failed to verify recovery code.");
    } finally {
      setRecoveryLoading(false);
    }
  }

  // File Selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const totalBytes = fileList.reduce((acc, f) => acc + f.size, 0);

    if (totalBytes > 100 * 1024 * 1024) {
      toast.error("Total selected files exceed the 100 MB limit per batch.");
      return;
    }

    setSelectedFiles(fileList);
    toast.info(`${fileList.length} raw files selected (${(totalBytes / (1024 * 1024)).toFixed(1)} MB).`);
  }

  // Submit to Nebula AI
  async function handleUploadToNebula() {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one document file.");
      return;
    }

    setIsUploading(true);
    setUploadStage("Uploading raw documents...");

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Simulation of pipeline progression stages
      setTimeout(() => setUploadStage("Sending payload to Nebula AI..."), 800);
      setTimeout(() => setUploadStage("Nebula analyzing document structure & page continuity..."), 1800);
      setTimeout(() => setUploadStage("Grouping related pages into unified documents..."), 2800);
      setTimeout(() => setUploadStage("Extracting academic courses, levels, and departments..."), 3800);
      setTimeout(() => setUploadStage("Preparing review table..."), 4800);

      const res = await fetch("/api/admin/academic/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to process documents with Nebula.");
        return;
      }

      const result = data.result;
      setApprovedGroups((prev) => [...(result.approved || []), ...prev]);
      setIsolatedGroups((prev) => [...(result.isolated || []), ...prev]);
      setRejectedGroups((prev) => [...(result.rejected || []), ...prev]);

      setSelectedFiles([]);
      toast.success(`Nebula analyzed ${selectedFiles.length} file(s)! Review ready.`);

      if (result.isolated?.length > 0) {
        setReviewTab("isolated");
      } else {
        setReviewTab("approved");
      }
    } catch {
      toast.error("Network error during document ingestion.");
    } finally {
      setIsUploading(false);
      setUploadStage("");
    }
  }

  // Open Edit / Missing Info Dialog
  function openEditModal(group: NebulaDocumentGroup) {
    setEditingGroup(group);
    setEditForm({
      material_type: group.classification.material_type,
      level: group.classification.level,
      school: group.classification.school,
      department: group.classification.department,
      course: group.classification.course,
      session: group.classification.session,
      semester: group.classification.semester,
    });
  }

  // Re-submit Isolated to Nebula with manual updates
  async function handleResubmitToNebula() {
    if (!editingGroup) return;

    setIsResubmitting(true);
    try {
      const res = await fetch("/api/admin/academic/upload/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: editingGroup,
          corrections: editForm,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to re-evaluate with Nebula.");
        return;
      }

      const updated = data.group;
      // Remove from isolated, add to approved
      setIsolatedGroups((prev) => prev.filter((g) => g.group_id !== editingGroup.group_id));
      setApprovedGroups((prev) => [updated, ...prev]);

      setEditingGroup(null);
      setReviewTab("approved");
      toast.success("Document re-evaluated and moved to Approved!");
    } catch {
      toast.error("Network error resubmitting to Nebula.");
    } finally {
      setIsResubmitting(false);
    }
  }

  // Manual Approve without calling Nebula
  function handleManualApprove() {
    if (!editingGroup) return;

    const updatedClassification: NebulaClassification = {
      ...editingGroup.classification,
      ...editForm,
      level: Number(editForm.level) || 100,
    };

    const newFilename = formatNormalizedFilename(
      updatedClassification,
      editingGroup.original_filenames[0]
    );

    const approvedGroup: NebulaDocumentGroup = {
      ...editingGroup,
      classification: updatedClassification,
      proposed_filename: newFilename,
      status: "approved",
      confidence: 1.0,
      isolation_reason: undefined,
      warnings: ["Approved manually by administrator."],
    };

    setIsolatedGroups((prev) => prev.filter((g) => g.group_id !== editingGroup.group_id));
    setApprovedGroups((prev) => [approvedGroup, ...prev]);
    setEditingGroup(null);
    setReviewTab("approved");
    toast.success("Document updated and moved to Approved.");
  }

  // Reject a group
  function handleRejectGroup(group: NebulaDocumentGroup, reason: string = "Admin rejected") {
    const rejected: NebulaDocumentGroup = {
      ...group,
      status: "rejected",
      isolation_reason: reason,
    };

    setApprovedGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
    setIsolatedGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
    setRejectedGroups((prev) => [rejected, ...prev]);
    toast.info("Moved to Rejected list.");
  }

  // Restore rejected to isolated
  function handleRestoreGroup(group: NebulaDocumentGroup) {
    const isolated: NebulaDocumentGroup = {
      ...group,
      status: "isolated",
    };
    setRejectedGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
    setIsolatedGroups((prev) => [isolated, ...prev]);
    setReviewTab("isolated");
    toast.info("Restored to Isolated review.");
  }

  // Final Publish to Academic Hub
  async function handlePublishGroup(group: NebulaDocumentGroup) {
    try {
      const res = await fetch("/api/admin/academic/upload/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to publish material.");
        return;
      }

      setMaterials((prev) => [data.material, ...prev]);
      setApprovedGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
      toast.success(`Published: ${data.material.title}`);
    } catch {
      toast.error("Failed to publish material to Academic Hub.");
    }
  }

  // Publish all approved in batch
  async function handlePublishAllApproved() {
    if (approvedGroups.length === 0) return;

    let count = 0;
    for (const group of approvedGroups) {
      try {
        const res = await fetch("/api/admin/academic/upload/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group }),
        });
        const data = await res.json();
        if (data.success) {
          setMaterials((prev) => [data.material, ...prev]);
          count++;
        }
      } catch {
        // Continue loop
      }
    }

    setApprovedGroups([]);
    toast.success(`Batch complete: Published ${count} materials to Academic Hub!`);
  }

  // Filter published materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.course_code?.toLowerCase().includes(search.toLowerCase()) ||
      m.department_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.material_type_slug === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <Link
            href="/admin/academic"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Academic Hub Overview
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            Academic Materials Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Raw document ingestion powered by Nebula AI, review pipeline, and published catalog.
          </p>
        </div>

        {isUnlocked && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Unlock className="h-3.5 w-3.5 text-emerald-600" />
              Security Gate Unlocked
            </span>
            <button
              onClick={handleLock}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:text-red-700 hover:bg-red-50 border border-stone-200 transition-colors"
            >
              Lock Gate
            </button>
          </div>
        )}
      </div>

      {/* SECURITY GATE PROMPT IF LOCKED */}
      {!isUnlocked && !checkingSecurity && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-6 sm:p-10 text-center max-w-2xl mx-auto space-y-5">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shadow-xs">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Academic Hub Ingestion Security Gate
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-md mx-auto leading-relaxed">
              Access to upload and ingest academic documents requires the Master Security Key. TACSFON administers this system in partnership with Academic Hub.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="max-w-md mx-auto space-y-3 pt-2">
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder="Enter Master Security Key"
                value={securityKeyInput}
                onChange={(e) => setSecurityKeyInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-xs text-stone-500 hover:text-stone-800"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={unlockLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {unlockLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying Master Key...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Unlock Document Ingestion
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setShowRecoveryModal(true);
                setNewlyGeneratedKey(null);
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Forgot security key? Recover or reset
            </button>
          </div>
        </div>
      )}

      {/* RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                Security Key Recovery
              </h3>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {newlyGeneratedKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    New Security Key Generated
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    This key has now replaced the previous active key. It is displayed <strong>ONLY ONCE</strong>. Please store it safely in your password vault.
                  </p>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-emerald-300 font-mono text-sm select-all">
                    <span>{newlyGeneratedKey}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(newlyGeneratedKey);
                        toast.success("Copied new key to clipboard!");
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-100"
                      title="Copy Key"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setNewlyGeneratedKey(null);
                    setSecurityKeyInput(newlyGeneratedKey);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply & Return to Ingestion Gate
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Method Switcher */}
                <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setRecoveryMode("question")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors ${
                      recoveryMode === "question"
                        ? "bg-white text-stone-900 shadow-2xs"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    Method 1: Secret Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryMode("email")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors ${
                      recoveryMode === "email"
                        ? "bg-white text-stone-900 shadow-2xs"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    Method 2: Email OTP
                  </button>
                </div>

                {recoveryMode === "question" ? (
                  <form onSubmit={handleQuestionRecovery} className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                        Security Question
                      </span>
                      <p className="text-sm font-medium text-stone-800 mt-0.5">
                        {recoveryQuestion}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Your Secret Answer
                      </label>
                      <input
                        type="text"
                        placeholder="Enter answer"
                        value={recoveryAnswer}
                        onChange={(e) => setRecoveryAnswer(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {recoveryLoading ? "Verifying..." : "Verify & Rotate Key"}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {!otpDispatched ? (
                      <div className="text-center py-4 space-y-3">
                        <Mail className="h-8 w-8 text-blue-600 mx-auto" />
                        <div>
                          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                            A one-time 6-digit recovery code will be dispatched to the designated server recovery email address via Brevo.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRequestEmailOtp}
                          disabled={recoveryLoading}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {recoveryLoading ? "Sending Code..." : "Dispatch Recovery Code"}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                          Code sent to <strong>{recoveryMaskedEmail}</strong>. Valid for 10 minutes.
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-700 mb-1">
                            Enter 6-Digit Verification Code
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 123456"
                            value={recoveryEmailOtp}
                            onChange={(e) => setRecoveryEmailOtp(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-center tracking-widest font-mono text-base font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={recoveryLoading}
                          className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
                        >
                          {recoveryLoading ? "Verifying..." : "Verify Code & Generate Key"}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNLOCKED DOCUMENT INGESTION WORKFLOW */}
      {isUnlocked && (
        <>
          {/* RAW DOCUMENT UPLOAD INTERFACE (NEBULA AI) */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Raw Document Ingestion (Nebula AI)
                  </h2>
                  <p className="text-xs text-stone-500">
                    Upload unsorted documents in bulk. Nebula AI groups continuations and determines metadata.
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold">
                Max 100 MB / Sorting Request • PDF, JPG, PNG, WebP, DOCX
              </span>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-stone-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-stone-50/50 hover:bg-blue-50/30 transition-colors">
              <input
                type="file"
                multiple
                id="raw-upload-input"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="raw-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="p-3.5 rounded-full bg-white shadow-2xs text-blue-600 border border-stone-200">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    Click to select raw documents or drag and drop
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Multi-page exams, continuations, and batches will be organized by Nebula
                  </p>
                </div>
              </label>
            </div>

            {/* Selected Files Count & Submit */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                <div className="text-xs text-blue-900">
                  <strong>{selectedFiles.length} file(s) ready</strong> (Total:{" "}
                  {(
                    selectedFiles.reduce((acc, f) => acc + f.size, 0) /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB / 100 MB max)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    disabled={isUploading}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadToNebula}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analyzing with Nebula...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Analyze & Sort with Nebula AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Progress Stage Progression Indicator */}
            {isUploading && (
              <div className="p-4 rounded-xl bg-stone-900 text-white space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300">Processing Stage:</span>
                  <span className="text-blue-400 font-mono">{uploadStage}</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-full w-2/3 animate-pulse" />
                </div>
              </div>
            )}
          </section>

          {/* ADMIN REVIEW SYSTEM: APPROVED, ISOLATED, REJECTED */}
          {(approvedGroups.length > 0 || isolatedGroups.length > 0 || rejectedGroups.length > 0) && (
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Nebula AI Document Review
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Inspect classifications, correct missing information, or approve files for the Academic Hub.
                  </p>
                </div>

                {reviewTab === "approved" && approvedGroups.length > 0 && (
                  <button
                    onClick={handlePublishAllApproved}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    Publish All Approved ({approvedGroups.length})
                  </button>
                )}
              </div>

              {/* Review Tabs */}
              <div className="flex border-b border-stone-200 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewTab("approved")}
                  className={`pb-3 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                    reviewTab === "approved"
                      ? "border-emerald-600 text-emerald-950"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Approved
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                    {approvedGroups.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewTab("isolated")}
                  className={`pb-3 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                    reviewTab === "isolated"
                      ? "border-amber-500 text-amber-950"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Isolated (Needs Review)
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                    {isolatedGroups.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewTab("rejected")}
                  className={`pb-3 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                    reviewTab === "rejected"
                      ? "border-red-500 text-red-950"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <XCircle className="h-4 w-4 text-red-500" />
                  Rejected
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px]">
                    {rejectedGroups.length}
                  </span>
                </button>
              </div>

              {/* TAB CONTENT: APPROVED */}
              {reviewTab === "approved" && (
                <div className="space-y-4">
                  {approvedGroups.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs">
                      No approved items waiting. Upload files or inspect Isolated tab.
                    </div>
                  ) : (
                    approvedGroups.map((group) => (
                      <div
                        key={group.group_id}
                        className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              {group.classification.material_type}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold font-mono">
                              {group.classification.course || "Course N/A"}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              {group.classification.level}Lvl • {group.classification.department}
                            </span>
                            {group.source_file_ids.length > 1 && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-semibold">
                                {group.source_file_ids.length} Pages Grouped
                              </span>
                            )}
                          </div>

                          <div className="font-mono text-xs text-stone-800 font-semibold break-all">
                            {group.proposed_filename}
                          </div>

                          <div className="text-[11px] text-stone-500">
                            Source: {group.original_filenames.join(", ")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(group)}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectGroup(group, "Rejected by admin")}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePublishGroup(group)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-2xs"
                          >
                            Publish
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB CONTENT: ISOLATED */}
              {reviewTab === "isolated" && (
                <div className="space-y-4">
                  {isolatedGroups.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs">
                      No isolated documents require attention.
                    </div>
                  ) : (
                    isolatedGroups.map((group) => (
                      <div
                        key={group.group_id}
                        className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">
                              ISOLATED
                            </span>
                            <span className="text-xs text-amber-800 font-medium">
                              {group.isolation_reason || "Ambiguous classification context"}
                            </span>
                          </div>

                          <div className="text-xs font-mono text-stone-700 font-semibold break-all">
                            Files: {group.original_filenames.join(", ")}
                          </div>

                          <p className="text-[11px] text-stone-600">
                            Provide the course code or department to complete validation and publish.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(group)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-2xs"
                          >
                            Provide Missing Info
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectGroup(group, "Rejected by admin from isolated")}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB CONTENT: REJECTED */}
              {reviewTab === "rejected" && (
                <div className="space-y-4">
                  {rejectedGroups.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs">
                      No rejected documents.
                    </div>
                  ) : (
                    rejectedGroups.map((group) => (
                      <div
                        key={group.group_id}
                        className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-stone-800">
                            {group.original_filenames.join(", ")}
                          </span>
                          <p className="text-red-700 text-[11px] mt-0.5">
                            Reason: {group.isolation_reason || "Rejected"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRestoreGroup(group)}
                          className="px-3 py-1 rounded-md border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium self-end sm:self-center"
                        >
                          Restore to Review
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          )}

          {/* EDIT / MISSING INFORMATION MODAL */}
          {editingGroup && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-blue-600" />
                    Review & Correct Metadata
                  </h3>
                  <button
                    onClick={() => setEditingGroup(null)}
                    className="text-stone-400 hover:text-stone-700 text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>

                <div className="text-xs text-stone-500 font-mono">
                  Source: {editingGroup.original_filenames.join(", ")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Material Type
                    </label>
                    <select
                      value={editForm.material_type || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, material_type: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      {materialTypes.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Level</label>
                    <select
                      value={editForm.level || 100}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, level: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value={100}>100 Level</option>
                      <option value={200}>200 Level</option>
                      <option value={300}>300 Level</option>
                      <option value={400}>400 Level</option>
                      <option value={500}>500 Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">School</label>
                    <select
                      value={editForm.school || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, school: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      {schools.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Department
                    </label>
                    <select
                      value={editForm.department || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, department: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      list="course-suggestions"
                      placeholder="e.g. CSC 308 or MTH 101"
                      value={editForm.course || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, course: e.target.value.toUpperCase() }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-mono uppercase"
                    />
                    <datalist id="course-suggestions">
                      {courses.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.title}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Academic Session
                    </label>
                    <select
                      value={editForm.session || "2024/2025"}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, session: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Semester
                    </label>
                    <select
                      value={editForm.semester || semesters[0]?.name || "First Semester"}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, semester: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                    >
                      {semesters.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleResubmitToNebula}
                    disabled={isResubmitting}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FolderSync className="h-4 w-4" />
                    Send to Nebula Again
                  </button>

                  <button
                    type="button"
                    onClick={handleManualApprove}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    Confirm & Approve
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PUBLISHED MATERIALS SECTION */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Published Materials Library
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Currently accessible to students with an active semester subscription.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
            {materials.length} Materials Live
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search by course code, title, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium"
          >
            <option value="all">All Material Types</option>
            {materialTypes.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Title / Material</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No published materials match your criteria.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{mat.title}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {mat.original_filename}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                        {mat.material_type_name || "Material"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                      {mat.course_code || "N/A"}
                    </td>
                    <td className="py-3 px-4">{mat.level}L</td>
                    <td className="py-3 px-4 text-stone-600">{mat.department_name}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/academic/materials/${mat.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
