import { NextRequest, NextResponse } from "next/server";
import { getPublicPaymentRequest, getPublicRegisteredNames } from "@/lib/supabase/payments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const payment = await getPublicPaymentRequest(paymentId);

    if (!payment) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    const registeredPeople = await getPublicRegisteredNames(paymentId);

    // Sanitize public response: only expose public fields
    return NextResponse.json({
      payment: {
        id: payment.id,
        programme_name: payment.programme_name,
        programme_date: payment.programme_date,
        description: payment.description,
        amount_per_person: payment.amount_per_person,
        bank_name: payment.bank_name,
        account_name: payment.account_name,
        account_number: payment.account_number,
        payment_instructions: payment.payment_instructions,
        image_url: payment.image_url,
        status: payment.status,
        expires_at: payment.expires_at,
        created_at: payment.created_at,
      },
      registeredNames: registeredPeople.map((p) => p.name),
      totalRegistered: registeredPeople.length,
    });
  } catch (err) {
    console.error("Public pay GET error:", err);
    return NextResponse.json({ error: "Failed to load payment information" }, { status: 500 });
  }
}
