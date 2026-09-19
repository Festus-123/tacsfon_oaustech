import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";
import { paymentSubmissionSchema } from "@/lib/validation/schemas";
import { submitPaymentRegistration } from "@/lib/supabase/payments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    // 1. Rate limiting by IP/client
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "pay-client";
    const rateCheck = checkRateLimit(`pay-sub-${ip}-${paymentId}`, 8, 10 * 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please wait ${rateCheck.resetInSeconds} seconds before submitting again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const payload = {
      ...body,
      payment_request_id: paymentId,
    };

    const parseResult = paymentSubmissionSchema.safeParse(payload);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid registration submission" },
        { status: 400 }
      );
    }

    const result = await submitPaymentRegistration(paymentId, parseResult.data.names);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to process payment registration" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully! Your name has been added to the participant list.",
      registeredCount: result.registeredCount,
    });
  } catch (err) {
    console.error("Payment submit error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving your registration. Please try again." },
      { status: 500 }
    );
  }
}
