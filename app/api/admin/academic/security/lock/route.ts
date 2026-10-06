import { NextResponse } from "next/server";
import { clearAcademicHubSession } from "@/lib/security/academic-hub-key";

export async function POST() {
  try {
    await clearAcademicHubSession();
    return NextResponse.json({ success: true, message: "Security lock engaged" });
  } catch (err) {
    console.error("Security lock error:", err);
    return NextResponse.json({ success: false, error: "Failed to lock" }, { status: 500 });
  }
}
