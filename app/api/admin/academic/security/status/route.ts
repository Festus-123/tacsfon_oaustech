import { NextResponse } from "next/server";
import { isAcademicHubUnlocked, getRecoveryQuestion } from "@/lib/security/academic-hub-key";

export async function GET() {
  try {
    const unlocked = await isAcademicHubUnlocked();
    const question = getRecoveryQuestion();

    return NextResponse.json({
      unlocked,
      question,
    });
  } catch (err) {
    console.error("Security status error:", err);
    return NextResponse.json(
      { unlocked: false, question: "What is your favorite color?" },
      { status: 500 }
    );
  }
}
