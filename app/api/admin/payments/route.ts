import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentRequestSchema } from "@/lib/validation/schemas";
import { getAdminPaymentRequests, createPaymentRequest } from "@/lib/supabase/payments";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const requests = await getAdminPaymentRequests();
    return NextResponse.json({ requests });
  } catch (err) {
    console.error("Admin payments GET error:", err);
    return NextResponse.json({ error: "Failed to fetch payment requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = paymentRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid payment request data" },
        { status: 400 }
      );
    }

    const newPayment = await createPaymentRequest(parseResult.data);
    if (!newPayment) {
      return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 });
    }

    return NextResponse.json({ success: true, payment: newPayment }, { status: 201 });
  } catch (err) {
    console.error("Admin payments POST error:", err);
    return NextResponse.json({ error: "Server error creating payment request" }, { status: 500 });
  }
}
