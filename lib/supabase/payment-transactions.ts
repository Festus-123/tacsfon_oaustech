import crypto from "crypto";
import { createServiceClient, SERVICE_KEY_MISSING } from "./admin";
import { verifySquadTransaction } from "@/lib/squad/client";

export type TransactionStatus = "PENDING" | "PAID" | "FAILED";

export interface PaymentTransaction {
  id: string;
  payment_request_id: string;
  reference: string;
  payer_email: string;
  names: string[];
  total_people: number;
  amount_per_person_snapshot: number;
  amount_kobo: number;
  status: TransactionStatus;
  verification_status: "UNVERIFIED" | "VERIFIED" | "MISMATCH" | "REJECTED";
  squad_status: string | null;
  checkout_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export function generateTransactionReference(): string {
  return `TACSFON-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

export async function createPendingTransaction(input: {
  paymentRequestId: string;
  reference: string;
  payerEmail: string;
  names: string[];
  amountPerPerson: number;
  amountKobo: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: SERVICE_KEY_MISSING };

  const { error } = await supabase.from("payment_transactions").insert({
    payment_request_id: input.paymentRequestId,
    reference: input.reference,
    payer_email: input.payerEmail,
    names: input.names,
    total_people: input.names.length,
    amount_per_person_snapshot: input.amountPerPerson,
    amount_kobo: input.amountKobo,
  });
  if (error) {
    console.error("Could not create payment transaction:", error);
    return { success: false, error: "Could not start the payment. Please try again." };
  }
  return { success: true };
}

export async function saveCheckoutUrl(reference: string, checkoutUrl: string): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  await supabase
    .from("payment_transactions")
    .update({ checkout_url: checkoutUrl, updated_at: new Date().toISOString() })
    .eq("reference", reference);
}

export async function markTransactionFailed(
  reference: string,
  squadStatus: string,
  verification: PaymentTransaction["verification_status"] = "VERIFIED"
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  // Never downgrade a transaction that is already PAID.
  await supabase
    .from("payment_transactions")
    .update({
      status: "FAILED",
      squad_status: squadStatus,
      verification_status: verification,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", reference)
    .neq("status", "PAID");
}

export async function getTransactionByReference(reference: string): Promise<PaymentTransaction | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();
  return (data as PaymentTransaction | null) ?? null;
}

export type ConfirmOutcome =
  | { state: "PAID"; duplicate: boolean }
  | { state: "PENDING" }
  | { state: "FAILED"; reason: string }
  | { state: "NOT_FOUND" };

/**
 * The single place a payment becomes PAID. Used by both the webhook and the status page.
 * Asks Squad directly, then checks the reference and the amount we expect before confirming.
 */
export async function confirmTransaction(reference: string): Promise<ConfirmOutcome> {
  const tx = await getTransactionByReference(reference);
  if (!tx) return { state: "NOT_FOUND" };
  if (tx.status === "PAID") return { state: "PAID", duplicate: true };

  const verification = await verifySquadTransaction(reference);
  if (!verification.found) return { state: "PENDING" };

  if (verification.status === "success") {
    if (verification.amountKobo !== Number(tx.amount_kobo)) {
      console.error(
        `Squad amount mismatch for ${reference}: expected ${tx.amount_kobo}, got ${verification.amountKobo}`
      );
      await markTransactionFailed(reference, verification.status, "MISMATCH");
      return { state: "FAILED", reason: "amount_mismatch" };
    }
    if (verification.reference && verification.reference !== reference) {
      await markTransactionFailed(reference, verification.status, "MISMATCH");
      return { state: "FAILED", reason: "reference_mismatch" };
    }

    const supabase = createServiceClient();
    if (!supabase) return { state: "PENDING" };
    const { data, error } = await supabase.rpc("confirm_payment_transaction", {
      p_reference: reference,
      p_paid_at: verification.paidAt ?? new Date().toISOString(),
    });
    if (error) {
      console.error(`Could not confirm payment ${reference}:`, error);
      return { state: "PENDING" };
    }
    await supabase
      .from("payment_transactions")
      .update({ squad_status: verification.status })
      .eq("reference", reference);
    return { state: "PAID", duplicate: data === "ALREADY_PAID" };
  }

  if (["failed", "expired", "abandoned", "reversed", "cancelled", "canceled"].includes(verification.status)) {
    await markTransactionFailed(reference, verification.status);
    return { state: "FAILED", reason: verification.status };
  }

  return { state: "PENDING" };
}
