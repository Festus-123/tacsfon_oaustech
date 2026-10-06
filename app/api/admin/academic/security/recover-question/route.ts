import { NextResponse } from "next/server";
import { recoverViaQuestion } from "@/lib/security/academic-hub-key";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const answer = body.answer;

    if (!answer || typeof answer !== "string") {
      return NextResponse.json({ success: false, error: "Answer is required" }, { status: 400 });
    }

    const result = await recoverViaQuestion(answer);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      newKey: result.newKey,
      message: "Security key successfully reset. Store this new key securely; it will not be displayed again.",
    });
  } catch (err) {
    console.error("Recovery question error:", err);
    return NextResponse.json(
      { success: false, error: "An error occurred during recovery." },
      { status: 500 }
    );
  }
}
