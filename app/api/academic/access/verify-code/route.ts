import { NextRequest, NextResponse } from "next/server";
import { consumeAccessCode, findActiveEntitlement, grantAccessCookie } from "@/lib/academic/access";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json().catch(() => ({ code: "" }));
    if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
    }

    const result = await consumeAccessCode(code);
    if ("error" in result) {
      const message = {
        expired: "This code has expired or was requested in another browser. Request a new one.",
        wrong: "That code is not correct. Check the email and try again.",
        locked: "Too many wrong attempts. Request a new code.",
      }[result.error];
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const access = await findActiveEntitlement(result.email);
    if (!access) {
      return NextResponse.json({ error: "No active subscription was found for this email." }, { status: 404 });
    }

    await grantAccessCookie(access.email, access.expiresAt);
    return NextResponse.json({
      success: true,
      email: access.email,
      semester: [access.sessionName, access.semesterName].filter(Boolean).join(" • "),
      expiresAt: access.expiresAt,
    });
  } catch (err) {
    console.error("Access code verify error:", err);
    return NextResponse.json({ error: "Server error checking the code." }, { status: 500 });
  }
}
