import { NextResponse } from "next/server";
import { validateSecurityKey, createAcademicHubSession } from "@/lib/security/academic-hub-key";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const key = body.key;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ success: false, error: "Security key is required" }, { status: 400 });
    }

    const isValid = await validateSecurityKey(key);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid security key. Please verify and try again." },
        { status: 401 }
      );
    }

    await createAcademicHubSession();

    return NextResponse.json({ success: true, message: "Security key validated successfully" });
  } catch (err) {
    console.error("Security unlock error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to validate security key" },
      { status: 500 }
    );
  }
}
