interface SendEmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

export async function sendBrevoEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "st.festus4cruise@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "TACSFON (OAUSTECH)";
  const brevoUrl = process.env.BREVO_URL || "https://api.brevo.com/v3/smtp/email";

  if (!apiKey) {
    console.warn("BREVO_API_KEY is not configured in environment variables.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch(brevoUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: options.to,
        subject: options.subject,
        htmlContent: options.htmlContent,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error response:", response.status, errorText);
      return { success: false, error: "Brevo API error: " + response.status };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to dispatch email via Brevo:", err);
    return { success: false, error: "Network error sending email" };
  }
}

export async function sendContactEmails(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ adminSuccess: boolean; visitorSuccess: boolean }> {
  const adminEmail = process.env.CONTACT_RECEIVER_EMAIL || "festusphillip19@gmail.com";
  const adminName = "TACSFON Leadership";

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.6; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1b3b2b; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">TACSFON (OAUSTECH)</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">New Website Contact Inquiry</p>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px; padding: 14px; background-color: #f9fafb; border-left: 4px solid #1b3b2b; border-radius: 4px;">
          <p style="margin: 0 0 6px 0;"><strong>Sender Name:</strong> ${escapeHtml(data.name)}</p>
          <p style="margin: 0 0 6px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}" style="color: #1b3b2b;">${escapeHtml(data.email)}</a></p>
          ${data.phone ? `<p style="margin: 0 0 6px 0;"><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
          <p style="margin: 0;"><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        </div>
        <div style="margin-top: 16px;">
          <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #374151;">Message:</h3>
          <div style="white-space: pre-wrap; background-color: #ffffff; padding: 14px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; color: #374151;">${escapeHtml(data.message)}</div>
        </div>
      </div>
      <div style="background-color: #f3f4f6; padding: 14px; text-align: center; font-size: 12px; color: #6b7280;">
        The Apostolic Church Student Fellowship of Nigeria — OAUSTECH Chapter
      </div>
    </div>
  `;

  const visitorHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.6; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1b3b2b; padding: 28px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">TACSFON (OAUSTECH)</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #e5e7eb;">"The Davidic Generation"</p>
      </div>
      <div style="padding: 28px;">
        <h2 style="font-size: 18px; color: #1b3b2b; margin-top: 0;">Peace and Grace be multiplied to you, ${escapeHtml(data.name)}!</h2>
        <p>Thank you for reaching out to us at <strong>The Apostolic Church Student Fellowship of Nigeria (OAUSTECH Chapter)</strong>. We have received your message regarding <em>"${escapeHtml(data.subject)}"</em>.</p>
        <p>Our fellowship leaders review every inquiry carefully, and someone will respond to you shortly.</p>
        <div style="background-color: #f0f7f2; border-left: 4px solid #b88e3f; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #1b3b2b;">Fellowship Weekly Gatherings:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
            <li><strong>Sunday Worship:</strong> Sundays @ 8:00 AM (Sunday School) & 9:00 AM (Service)</li>
            <li><strong>Bible Study:</strong> Tuesdays @ 5:30 PM Prompt</li>
            <li><strong>Prayer Meeting:</strong> Fridays @ 5:30 PM Prompt</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #4b5563;"><strong>Venue:</strong> Igodan Methodist Primary School Classroom, Igodan, Okitipupa</p>
        </div>
        <p>You are always warmly welcome to fellowship with us in faith, prayer, and brotherly love.</p>
        <p style="margin-top: 24px; margin-bottom: 4px;">In Christ's Warmth,</p>
        <p style="margin: 0; font-weight: 600; color: #1b3b2b;">TACSFON (OAUSTECH) Fellowship Team</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        1 Timothy 4:12 — "Let no man despise thy youth..."
      </div>
    </div>
  `;

  const [adminResult, visitorResult] = await Promise.all([
    sendBrevoEmail({
      to: [{ email: adminEmail, name: adminName }],
      subject: `[Contact Form] ${data.subject} - from ${data.name}`,
      htmlContent: adminHtml,
      replyTo: { email: data.email, name: data.name },
    }),
    sendBrevoEmail({
      to: [{ email: data.email, name: data.name }],
      subject: "Thank You for Reaching Out to TACSFON (OAUSTECH)",
      htmlContent: visitorHtml,
    }),
  ]);

  return {
    adminSuccess: adminResult.success,
    visitorSuccess: visitorResult.success,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
