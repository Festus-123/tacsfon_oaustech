import { NextRequest, NextResponse } from "next/server";
import { findActiveEntitlement, issueAccessCode } from "@/lib/academic/access";
import { sendBrevoEmail } from "@/lib/email/brevo";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";
import { createServiceClient, SERVICE_KEY_MISSING } from "@/lib/supabase/admin";

// Same reply whether or not the email has access, so the form cannot reveal who has paid
const GENERIC_REPLY =
  "If this email has an active Academic Hub subscription, a 6-digit code has been sent to it.";

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = await request.json().catch(() => ({ email: "" }));
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter the email you paid with." }, { status: 400 });
    }

    if (!createServiceClient()) {
      console.error(SERVICE_KEY_MISSING);
      return NextResponse.json({ error: "Access restore is not available right now." }, { status: 503 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = checkRateLimit(`access-code:${ip}:${email}`, 3, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${Math.ceil(limit.resetInSeconds / 60)} minute(s).` },
        { status: 429 }
      );
    }

    const access = await findActiveEntitlement(email);
    if (access) {
      const code = await issueAccessCode(email);
      if (code) {
        const sent = await sendBrevoEmail({
          to: [{ email }],
          subject: "Your Academic Hub access code",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1c1917;">
              <h2 style="margin-bottom: 4px;">Academic Hub access code</h2>
              <p>Use this code to restore your semester access on this device:</p>
              <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 16px 0;">${code}</p>
              <p style="color: #57534e; font-size: 13px;">It expires in 10 minutes and only works in the browser where you requested it.
              If you did not request it, you can ignore this email.</p>
            </div>`,
        });
        if (!sent.success) {
          console.error("Access code email failed:", sent.error);
          return NextResponse.json({ error: "Could not send the code email. Please try again." }, { status: 502 });
        }
      }
    }

    return NextResponse.json({ success: true, message: GENERIC_REPLY });
  } catch (err) {
    console.error("Access code request error:", err);
    return NextResponse.json({ error: "Server error sending the code." }, { status: 500 });
  }
}
