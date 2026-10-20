import { NextResponse } from "next/server";
import { isAcademicHubUnlocked } from "@/lib/security/academic-hub-key";
import { createClient } from "@/lib/supabase/server";

// Render's free tier sleeps after 15 idle minutes; waking it takes up to about a minute
export const maxDuration = 90;

const WAKE_TIMEOUT_MS = 75_000;

/**
 * Pings Nebula's /health from the server (the browser cannot read Nebula's response
 * cross-origin, and the Nebula URL stays server-side). Used to wake Nebula while the
 * ingestion gate is open, so uploads do not hit a cold start.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAcademicHubUnlocked())) {
    return NextResponse.json({ ready: false, error: "Academic Hub security gate locked." }, { status: 401 });
  }

  const nebulaUrl = process.env.NEBULA_API_URL;
  if (!nebulaUrl) {
    return NextResponse.json({ ready: false, error: "NEBULA_API_URL is not configured on the server." });
  }

  const started = Date.now();
  try {
    const response = await fetch(`${nebulaUrl.replace(/\/+$/, "")}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(WAKE_TIMEOUT_MS),
    });
    const elapsedMs = Date.now() - started;

    if (!response.ok) {
      return NextResponse.json({ ready: false, elapsedMs, error: `Nebula returned HTTP ${response.status}.` });
    }
    return NextResponse.json({ ready: true, elapsedMs });
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return NextResponse.json({
      ready: false,
      elapsedMs: Date.now() - started,
      error: timedOut
        ? `Nebula did not wake within ${WAKE_TIMEOUT_MS / 1000} seconds.`
        : "Nebula could not be reached from the server.",
    });
  }
}
