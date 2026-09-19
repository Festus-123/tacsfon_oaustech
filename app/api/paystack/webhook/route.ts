import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack/client";
import { activateSemesterEntitlement, getActiveSemester } from "@/lib/supabase/academic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify HMAC signature
    const isValid = verifyPaystackWebhookSignature(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === "production") {
      console.warn("Invalid Paystack webhook signature rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "charge.success") {
      const data = payload.data;
      const reference = data.reference;
      const metadata = data.metadata || {};
      const userEmail = data.customer?.email || metadata.userEmail;
      const semesterId = metadata.semesterId || (await getActiveSemester())?.id;

      if (userEmail && semesterId && reference) {
        await activateSemesterEntitlement(userEmail, semesterId, reference);
        console.log(`Entitlement activated via Paystack webhook for ${userEmail}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paystack webhook processing error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
