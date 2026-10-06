import { NextResponse } from "next/server";
import { verifyEmailRecoveryOtp } from "@/lib/security/academic-hub-key";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = body.code;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Verification code is required" }, { status: 400 });
    }

    const result = await verifyEmailRecoveryOtp(code);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      newKey: result.newKey,
      message: "Security key successfully reset. Store this new key securely; it will not be displayed again.",
    });
  } catch (err) {
    console.error("Email verify error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to verify recovery code." },
      { status: 500 }
    );
  }
}
