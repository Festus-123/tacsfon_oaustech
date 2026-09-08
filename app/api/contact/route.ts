import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";
import { sendContactEmails } from "@/lib/email/brevo";

export async function POST(request: NextRequest) {
  try {
    // 1. Client Identifier for Rate Limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    
    // Strict Rate Limiting: 5 submissions per 10 minutes
    const rateCheck = checkRateLimit(`contact:${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many submissions from this connection. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 2. Body Payload Inspection
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed request payload" },
        { status: 400 }
      );
    }

    // 3. Server-side Zod Validation
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues[0]?.message || "Invalid form submission";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, phone, subject, message } = validationResult.data;

    // 4. Send Brevo Emails (Notification to Admin + Confirmation to Visitor)
    const emailResults = await sendContactEmails({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully.",
        delivery: {
          adminNotified: emailResults.adminSuccess,
          confirmationSent: emailResults.visitorSuccess,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Unhandled contact API route error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred while delivering your message. Please try again." },
      { status: 500 }
    );
  }
}
