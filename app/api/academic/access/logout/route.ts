import { NextResponse } from "next/server";
import { clearAccessCookie } from "@/lib/academic/access";

/** Forgets semester access on this browser (it can be restored with an email code). */
export async function POST() {
  await clearAccessCookie();
  return NextResponse.json({ success: true });
}
