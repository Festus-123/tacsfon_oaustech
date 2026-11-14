import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";
import { paymentSubmissionSchema } from "@/lib/validation/schemas";
import { getPublicPaymentRequest, computeAuthoritativeStatus } from "@/lib/supabase/payments";
import {
  createPendingTransaction,
  generateTransactionReference,
  markTransactionFailed,
  saveCheckoutUrl,
} from "@/lib/supabase/payment-transactions";
import { initiateSquadTransaction } from "@/lib/squad/client";

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "pay-client";
    const rateCheck = checkRateLimit(`squad-init-${ip}`, 10, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please wait ${rateCheck.resetInSeconds} seconds and try again.` },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = paymentSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payment details" },
        { status: 400 }
      );
    }
    const { payment_request_id, names, email } = parsed.data;

    // 1. Registration details. Price comes from the admin-configured record, never from the client.
    const paymentRequest = await getPublicPaymentRequest(payment_request_id);
    if (!paymentRequest) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }
    const status = computeAuthoritativeStatus(paymentRequest);
    if (status !== "ACTIVE") {
      return NextResponse.json(
        { error: `This payment request is ${status.toLowerCase()} and no longer accepts payments.` },
        { status: 400 }
      );
    }

    // 2-3. Amount = price per passenger x passengers, converted to kobo.
    const amountPerPerson = Number(paymentRequest.amount_per_person) || 0;
    const amountKobo = Math.round(amountPerPerson * 100) * names.length;
    if (amountKobo <= 0) {
      return NextResponse.json({ error: "This request has no payable amount." }, { status: 400 });
    }

    // 4. Unique reference, stored as PENDING before the student leaves for Squad.
    const reference = generateTransactionReference();
    const created = await createPendingTransaction({
      paymentRequestId: payment_request_id,
      reference,
      payerEmail: email,
      names,
      amountPerPerson,
      amountKobo,
    });
    if (!created.success) {
      return NextResponse.json({ error: created.error || "Could not start the payment." }, { status: 500 });
    }

    // 5-7. Ask Squad for a bank-transfer checkout.
    const origin = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/+$/, "");
    const squad = await initiateSquadTransaction({
      amountKobo,
      email,
      reference,
      callbackUrl: `${origin}/payment/status`,
      customerName: names[0],
      metadata: {
        payment_request_id,
        programme: paymentRequest.programme_name,
        passengers: names.length,
      },
    });

    if (!squad.ok) {
      console.error(`Squad initiate failed for ${reference}:`, squad.error);
      await markTransactionFailed(reference, "initiate_failed", "UNVERIFIED");
      return NextResponse.json(
        { error: "We could not start the payment with our provider. Please try again shortly." },
        { status: 502 }
      );
    }

    await saveCheckoutUrl(reference, squad.checkoutUrl);

    // 8. The browser redirects the student to Squad.
    return NextResponse.json({ reference, checkoutUrl: squad.checkoutUrl });
  } catch (err) {
    console.error("Squad initiate error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while starting your payment. Please try again." },
      { status: 500 }
    );
  }
}
