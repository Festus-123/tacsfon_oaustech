import { NextRequest, NextResponse } from "next/server";
import { verifySquadWebhookSignature } from "@/lib/squad/client";
import { confirmTransaction } from "@/lib/supabase/payment-transactions";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-squad-encrypted-body") || request.headers.get("x-squad-signature");

    // 1. Validate the signature on the raw body.
    if (!verifySquadWebhookSignature(rawBody, signature)) {
      console.warn("Invalid Squad webhook signature rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const body = (payload.Body ?? payload.body ?? {}) as Record<string, unknown>;
    const reference = String(
      payload.TransactionRef ?? body.transaction_ref ?? payload.transaction_ref ?? ""
    ).trim();
    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    // 2-6. Never trust the webhook body for the outcome: confirmTransaction asks Squad directly,
    // checks reference + expected amount, and is idempotent for duplicate deliveries.
    const outcome = await confirmTransaction(reference);

    if (outcome.state === "NOT_FOUND") {
      // Not one of ours: acknowledge so Squad stops retrying.
      return NextResponse.json({ received: true, state: "unknown_reference" });
    }
    if (outcome.state === "PENDING") {
      // Ask Squad to retry later.
      return NextResponse.json({ received: false, state: "pending" }, { status: 202 });
    }

    return NextResponse.json({ received: true, state: outcome.state });
  } catch (err) {
    console.error("Squad webhook processing error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
