import crypto from "crypto";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/admin";

/**
 * Student access to Academic Hub materials.
 *
 * A paid student is remembered by an HttpOnly, signed cookie (ah_access) set after a
 * verified Paystack payment, or after confirming a one-time email code on another device.
 * The cookie only says who the student is; access is re-checked against an ACTIVE,
 * unexpired row in academic_entitlements on every request, so revoking or expiring the
 * entitlement takes effect immediately.
 */

export const ACCESS_COOKIE = "ah_access";
export const CODE_COOKIE = "ah_access_code";
const CODE_TTL_MS = 10 * 60 * 1000;

interface AccessPayload {
  email: string;
  exp: number; // ms epoch
}

interface CodePayload {
  email: string;
  codeHash: string;
  exp: number;
  attempts?: number;
}

const MAX_CODE_ATTEMPTS = 5;

export interface StudentAccess {
  email: string;
  entitlementId: string;
  semesterId: string;
  semesterName?: string;
  sessionName?: string;
  startsAt: string;
  expiresAt: string;
}

function secret(): string | null {
  return process.env.ACADEMIC_ACCESS_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

function sign(payload: object): string | null {
  const key = secret();
  if (!key) return null;
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function unsign<T extends { exp: number }>(token?: string | null): T | null {
  const key = secret();
  if (!key || !token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = crypto.createHmac("sha256", key).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  expires,
});

/** The newest ACTIVE, unexpired entitlement for an email (a subscription opens the whole library). */
export async function findActiveEntitlement(email: string): Promise<StudentAccess | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("academic_entitlements")
    .select("id, user_email, semester_id, starts_at, expires_at, semesters(name, academic_sessions(name))")
    .eq("user_email", email.trim().toLowerCase())
    .eq("status", "ACTIVE")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  type Row = typeof data & {
    semesters?: { name?: string; academic_sessions?: { name?: string } | null } | null;
  };
  const row = data as Row;
  return {
    email: row.user_email,
    entitlementId: row.id,
    semesterId: row.semester_id,
    semesterName: row.semesters?.name,
    sessionName: row.semesters?.academic_sessions?.name,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
  };
}

/** Current visitor's access, or null. Safe to call from any server component or route. */
export async function getStudentAccess(): Promise<StudentAccess | null> {
  const cookieStore = await cookies();
  const payload = unsign<AccessPayload>(cookieStore.get(ACCESS_COOKIE)?.value);
  if (!payload) return null;
  return findActiveEntitlement(payload.email);
}

/** Remembers this browser as the given student until their access expires. */
export async function grantAccessCookie(email: string, expiresAt: string): Promise<boolean> {
  const exp = new Date(expiresAt).getTime();
  const token = sign({ email: email.trim().toLowerCase(), exp } satisfies AccessPayload);
  if (!token) return false;
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, token, cookieOptions(new Date(exp)));
  return true;
}

export async function clearAccessCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(CODE_COOKIE);
}

const hashCode = (email: string, code: string) =>
  crypto.createHash("sha256").update(`${email}:${code}`).digest("hex");

/**
 * Creates a 6-digit code for restoring access on another device. Only a hash is kept,
 * in a signed short-lived cookie on the requesting browser, so the code works only there.
 */
export async function issueAccessCode(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const exp = Date.now() + CODE_TTL_MS;
  const token = sign({ email: normalized, codeHash: hashCode(normalized, code), exp } satisfies CodePayload);
  if (!token) return null;
  const cookieStore = await cookies();
  cookieStore.set(CODE_COOKIE, token, cookieOptions(new Date(exp)));
  return code;
}

/**
 * Checks a code against the pending one on this browser; returns the email on success.
 * Wrong guesses are counted inside the signed cookie, and the code is discarded after
 * MAX_CODE_ATTEMPTS, so the limit holds across serverless instances.
 */
export async function consumeAccessCode(
  code: string
): Promise<{ email: string } | { error: "expired" | "wrong" | "locked" }> {
  const cookieStore = await cookies();
  const payload = unsign<CodePayload>(cookieStore.get(CODE_COOKIE)?.value);
  if (!payload) return { error: "expired" };

  const a = Buffer.from(hashCode(payload.email, code.trim()));
  const b = Buffer.from(payload.codeHash);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
    cookieStore.delete(CODE_COOKIE);
    return { email: payload.email };
  }

  const attempts = (payload.attempts || 0) + 1;
  if (attempts >= MAX_CODE_ATTEMPTS) {
    cookieStore.delete(CODE_COOKIE);
    return { error: "locked" };
  }
  const token = sign({ ...payload, attempts } satisfies CodePayload);
  if (token) cookieStore.set(CODE_COOKIE, token, cookieOptions(new Date(payload.exp)));
  return { error: "wrong" };
}
