"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { donationConfig } from "@/data/donation";
import { Check, Copy, Heart, Sparkles } from "lucide-react";

interface DonationModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DonationModal({ trigger, open, onOpenChange }: DonationModalProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = React.useState(donationConfig.purposes[0]);
  const [donorName, setDonorName] = React.useState("");

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => {
        setCopiedField(null);
      }, 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const narrationPreview = donorName.trim()
    ? `${selectedPurpose} - ${donorName.trim()}`
    : `${selectedPurpose} - [Your Name]`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="gold" size="default" className="shadow-xs font-medium">
            <Heart className="h-4 w-4 mr-1 text-forest-900 fill-forest-900/30" />
            Support / Donate
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md bg-white border border-forest-800/15">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-full bg-forest-100 text-forest-800">
              <Heart className="h-4 w-4 fill-forest-700" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-gold-600">
              Partner With Us
            </span>
          </div>
          <DialogTitle className="text-2xl font-serif text-forest-950">
            Support the Fellowship
          </DialogTitle>
          <DialogDescription className="text-sm text-forest-900/70 pt-1">
            Your generous giving powers student discipleship, campus evangelism outreaches, welfare, and fellowship building projects across OAUSTECH.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Bank Account Details Card */}
          <div className="rounded-xl border border-forest-800/15 bg-forest-50/50 p-4 space-y-3">
            {/* Account Number */}
            <div className="flex items-center justify-between gap-2 border-b border-forest-800/10 pb-2.5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-800/70">
                  Account Number
                </p>
                <p className="text-xl font-mono font-bold tracking-wider text-forest-950">
                  {donationConfig.accountNumber}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs bg-white"
                onClick={() => copyToClipboard(donationConfig.accountNumber, "acc_num")}
              >
                {copiedField === "acc_num" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Bank Name */}
            <div className="flex items-center justify-between gap-2 border-b border-forest-800/10 pb-2.5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-800/70">
                  Bank Name
                </p>
                <p className="text-sm font-semibold text-forest-950">
                  {donationConfig.bankName}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => copyToClipboard(donationConfig.bankName, "bank_name")}
              >
                {copiedField === "bank_name" ? (
                  <span className="text-xs text-emerald-600 font-medium">Copied</span>
                ) : (
                  <Copy className="h-3.5 w-3.5 text-forest-700" />
                )}
              </Button>
            </div>

            {/* Account Name */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-800/70">
                  Account Name
                </p>
                <p className="text-xs font-semibold text-forest-950">
                  {donationConfig.accountName}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => copyToClipboard(donationConfig.accountName, "acc_name")}
              >
                {copiedField === "acc_name" ? (
                  <span className="text-xs text-emerald-600 font-medium">Copied</span>
                ) : (
                  <Copy className="h-3.5 w-3.5 text-forest-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Transfer Narration Helper */}
          <div className="rounded-lg border border-gold-300/40 bg-gold-50/50 p-3.5 text-xs text-forest-900 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-gold-700">
              <Sparkles className="h-3.5 w-3.5 text-gold-600" />
              Transfer Narration / Reference Helper
            </div>
            <p className="text-forest-800/80">
              To ensure your seed is designated correctly, select your intended purpose:
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {donationConfig.purposes.map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => setSelectedPurpose(purpose)}
                  className={`px-2.5 py-1.5 rounded text-left text-xs font-medium transition-all ${
                    selectedPurpose === purpose
                      ? "bg-forest-800 text-white shadow-2xs"
                      : "bg-white border border-forest-200 text-forest-900 hover:bg-forest-50"
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold uppercase text-forest-800/70 mb-1">
                Your Name (for transfer narration):
              </label>
              <input
                type="text"
                placeholder="e.g. Samuel Adewale"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full text-xs rounded border border-forest-300/60 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>

            <div className="mt-2 p-2 rounded bg-white border border-forest-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-forest-600 font-medium block">
                  Recommended Narration
                </span>
                <span className="font-mono text-xs text-forest-950 font-medium">
                  {narrationPreview}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[11px]"
                onClick={() => copyToClipboard(narrationPreview, "narration")}
              >
                {copiedField === "narration" ? (
                  <span className="text-emerald-600 font-semibold">Copied</span>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center pt-1 border-t border-forest-800/10">
          <p className="text-xs text-forest-800/70 italic font-serif">
            &quot;Every man according as he purposeth in his heart, so let him give...&quot; — 2 Cor 9:7
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
