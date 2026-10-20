import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack/client";
import { getActiveSemester, getSemesters, activateSemesterEntitlement } from "@/lib/supabase/academic";

// Simulated checkout (no real payment) is a local-development convenience only
const SIMULATION_ALLOWED = process.env.NODE_ENV !== "production";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const simulated = searchParams.get("simulated") === "true";
    const emailParam = searchParams.get("email");

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    const activeSemester = await getActiveSemester();

    if (simulated) {
      if (!SIMULATION_ALLOWED || !activeSemester) {
        return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
      }
      const email = emailParam || "student@oaustech.edu.ng";
      await activateSemesterEntitlement(email, activeSemester.id, reference);
      return NextResponse.json({
        success: true,
        verified: true,
        email,
        semester: activeSemester.name,
      });
    }

    // Call live Paystack verify; access is only granted for a confirmed successful payment
    let verifyRes;
    try {
      verifyRes = await verifyPaystackTransaction(reference);
    } catch (err) {
      console.error("Paystack verify request failed:", err);
      return NextResponse.json(
        {
          error:
            "We could not confirm your payment with Paystack right now. If you were charged, refresh this page in a minute or contact support with your reference.",
        },
        { status: 502 }
      );
    }

    if (!verifyRes.status || verifyRes.data?.status !== "success") {
      return NextResponse.json(
        { error: "Paystack transaction was not successful or is still pending." },
        { status: 400 }
      );
    }

    const metadata = verifyRes.data.metadata as Record<string, unknown> | undefined;
    const semesters = await getSemesters();
    // The semester the student paid for (recorded at checkout), not whatever is active now
    const paidSemester =
      semesters.find((s) => s.id === metadata?.semesterId) || activeSemester || undefined;

    if (!paidSemester) {
      return NextResponse.json({ error: "The semester for this payment could not be found." }, { status: 400 });
    }

    const amountPaid = verifyRes.data.amount / 100;
    if (amountPaid < Number(paidSemester.price)) {
      console.warn(`Paystack amount ${amountPaid} below semester price ${paidSemester.price} for ${reference}`);
      return NextResponse.json(
        { error: "The amount paid does not match the semester price. Please contact support." },
        { status: 400 }
      );
    }

    const customerEmail =
      verifyRes.data.customer?.email ||
      (typeof metadata?.userEmail === "string" ? metadata.userEmail : undefined) ||
      emailParam;

    if (!customerEmail) {
      return NextResponse.json({ error: "No email is attached to this payment." }, { status: 400 });
    }

    await activateSemesterEntitlement(customerEmail, paidSemester.id, reference);

    return NextResponse.json({
      success: true,
      verified: true,
      email: customerEmail,
      amount: amountPaid,
      semester: paidSemester.name,
    });
  } catch (err) {
    console.error("Paystack verification error:", err);
    return NextResponse.json({ error: "Server error verifying transaction" }, { status: 500 });
  }
}
