import { NextRequest, NextResponse } from "next/server";
import { getActiveSemester } from "@/lib/supabase/academic";
import { initializePaystackTransaction } from "@/lib/paystack/client";

// Simulated checkout (no real payment) is a local-development convenience only
const SIMULATION_ALLOWED = process.env.NODE_ENV !== "production";

export async function POST(request: NextRequest) {
  // Paystack returns the student to the site they are actually on (never a localhost fallback)
  const appUrl = request.nextUrl.origin;

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address to associate with your semester access." },
        { status: 400 }
      );
    }

    // Authoritatively retrieve active semester and price from database
    const semester = await getActiveSemester();
    if (!semester) {
      return NextResponse.json(
        { error: "There is currently no active academic semester available for subscriptions." },
        { status: 400 }
      );
    }

    const authoritativePrice = Number(semester.price);
    if (!authoritativePrice || authoritativePrice <= 0) {
      return NextResponse.json(
        { error: "The active semester has no subscription price set. Please contact support." },
        { status: 400 }
      );
    }

    const reference = `AH_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const callbackUrl = `${appUrl}/academic/subscribe/callback`;

    const simulatedCheckout = () =>
      NextResponse.json({
        success: true,
        authorization_url: `${callbackUrl}?reference=${reference}&email=${encodeURIComponent(email)}&simulated=true`,
        reference,
        simulated: true,
      });

    let paystackRes;
    try {
      paystackRes = await initializePaystackTransaction({
        email,
        amount: authoritativePrice,
        reference,
        callback_url: callbackUrl,
        metadata: {
          semesterId: semester.id,
          semesterName: semester.name,
          sessionName: semester.academic_session_name,
          userEmail: email,
          product: "Academic Hub Semester Access",
        },
      });
    } catch (err) {
      console.error("Paystack initialize request failed:", err);
      if (SIMULATION_ALLOWED) return simulatedCheckout();
      return NextResponse.json(
        { error: "Payment could not be started right now. Please try again shortly." },
        { status: 502 }
      );
    }

    if (!paystackRes.status || !paystackRes.data?.authorization_url) {
      console.warn("Paystack initialize response:", paystackRes);
      if (SIMULATION_ALLOWED) return simulatedCheckout();
      return NextResponse.json(
        { error: `Paystack could not start the payment: ${paystackRes.message || "unknown error"}.` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackRes.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error("Paystack initialize error:", err);
    return NextResponse.json({ error: "Server error starting the payment." }, { status: 500 });
  }
}
