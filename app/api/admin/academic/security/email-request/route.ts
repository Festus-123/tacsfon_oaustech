import { NextResponse } from "next/server";
import { requestRecoveryEmailOtp } from "@/lib/security/academic-hub-key";

export async function POST() {
  try {
    const result = await requestRecoveryEmailOtp();

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      maskedEmail: result.maskedEmail,
      message: `A 6-digit recovery code has been dispatched to ${result.maskedEmail}.`,
    });
  } catch (err) {
    console.error("Email recovery request error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch recovery email." },
      { status: 500 }
    );
  }
}
