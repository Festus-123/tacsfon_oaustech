import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";
import { confirmTransaction, getTransactionByReference } from "@/lib/supabase/payment-transactions";
import { getPublicPaymentRequest } from "@/lib/supabase/payments";

/**
 * Status lookup for the /payment/status page. The redirect alone never confirms anything:
 * a pending transaction is re-checked directly with Squad (same path as the webhook).
 * Only non-sensitive fields are returned.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")?.trim();
  if (!reference || reference.length > 100) {
    return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "status-client";
  const rate = checkRateLimit(`squad-status-${ip}`, 60, 5 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    let tx = await getTransactionByReference(reference);
    if (!tx) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (tx.status === "PENDING") {
      await confirmTransaction(reference);
      tx = (await getTransactionByReference(reference)) ?? tx;
    }

    const programme = await getPublicPaymentRequest(tx.payment_request_id);

    return NextResponse.json({
      reference: tx.reference,
      status: tx.status,
      amount: Number(tx.amount_kobo) / 100,
      passengers: tx.total_people,
      programme_name: programme?.programme_name ?? null,
      payment_request_id: tx.payment_request_id,
      paid_at: tx.paid_at,
    });
  } catch (err) {
    console.error("Squad status error:", err);
    return NextResponse.json({ error: "Could not check payment status" }, { status: 500 });
  }
}
