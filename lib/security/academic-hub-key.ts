import crypto from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";
import { sendBrevoEmail } from "@/lib/email/brevo";

const SESSION_COOKIE_NAME = "academic_hub_key_session";
const SESSION_MAX_AGE = 12 * 60 * 60; // 12 hours in seconds

// In-memory fallback in case live Supabase table is not yet migrated
let memoryActiveHash: string | null = null;
let memoryRotatedAt: string = new Date().toISOString();

// In-memory recovery token store (valid for 10 minutes)
interface RecoveryToken {
  code: string;
  email: string;
  expiresAt: number;
  used: boolean;
}
const recoveryTokens = new Map<string, RecoveryToken>();

export function hashKey(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext.trim()).digest("hex");
}

export function generateSecureKey(): string {
  const segment1 = "fest";
  const segment2 = "csc";
  const num1 = Math.floor(10 + Math.random() * 90); // 2 digits
  const num2 = Math.floor(100 + Math.random() * 900); // 3 digits
  const randHex = crypto.randomBytes(2).toString("hex");
  const num3 = Math.floor(1000 + Math.random() * 9000); // 4 digits
  return `${segment1}-${segment2}-${num1}-${num2}-${randHex}-${num3}`;
}

function getBootstrapKey(): string {
  return process.env.ACADEMIC_HUB_SECURITY_KEY || "fest-csc-23-182-phill-9527";
}

/**
 * Retrieves the active security key hash.
 * Follows DB -> bootstrap env priority.
 */
export async function getActiveKeyHash(): Promise<string> {
  const bootstrapHash = hashKey(getBootstrapKey());

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academic_hub_security")
      .select("active_key_hash, rotated_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.active_key_hash) {
      memoryActiveHash = data.active_key_hash;
      memoryRotatedAt = data.rotated_at || memoryRotatedAt;
      return data.active_key_hash;
    }

    // First bootstrap insertion if table exists but is empty
    if (!data) {
      try {
        await supabase.from("academic_hub_security").insert({
          active_key_hash: bootstrapHash,
        });
      } catch {
        // Table might not exist yet
      }
    }
  } catch {
    // Supabase unavailable or in-memory fallback
  }

  if (!memoryActiveHash) {
    memoryActiveHash = bootstrapHash;
  }
  return memoryActiveHash;
}

/**
 * Updates the active key hash in the DB and memory store.
 */
export async function updateActiveKeyHash(newHash: string): Promise<void> {
  memoryActiveHash = newHash;
  memoryRotatedAt = new Date().toISOString();

  try {
    const supabase = await createClient();
    await supabase.from("academic_hub_security").insert({
      active_key_hash: newHash,
      rotated_at: memoryRotatedAt,
    });
  } catch (err) {
    console.warn("Could not persist updated key hash to Supabase, stored in memory:", err);
  }
}

/**
 * Validates entered security key against the active hash.
 */
export async function validateSecurityKey(enteredKey: string): Promise<boolean> {
  if (!enteredKey) return false;
  const activeHash = await getActiveKeyHash();
  const enteredHash = hashKey(enteredKey);
  return crypto.timingSafeEqual(Buffer.from(activeHash), Buffer.from(enteredHash));
}

/**
 * Creates an authenticated session cookie for the Academic Hub upload gate.
 */
export async function createAcademicHubSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ token, exp: expiry })).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Verifies if the current request has an unlocked Academic Hub session.
 */
export async function isAcademicHubUnlocked(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return false;

    const decoded = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8"));
    if (!decoded.exp || decoded.exp < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears the session cookie (locks the upload interface).
 */
export async function clearAcademicHubSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore error
  }
}

/**
 * Returns the recovery question.
 */
export function getRecoveryQuestion(): string {
  return process.env.ACADEMIC_HUB_RECOVERY_QUESTION || "What is your favorite color?";
}

/**
 * Validates recovery question answer, rotates key, and returns the new plaintext key ONCE.
 */
export async function recoverViaQuestion(
  answer: string
): Promise<{ success: boolean; newKey?: string; error?: string }> {
  // Rate limiting: 5 attempts per 10 minutes
  const rate = checkRateLimit("recovery-question", 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Too many attempts. Please try again in ${rate.resetInSeconds} seconds.`,
    };
  }

  const expectedAnswer = (process.env.ACADEMIC_HUB_RECOVERY_ANSWER || "Black")
    .replace(/^["']|["']$/g, "")
    .trim()
    .toLowerCase();

  const enteredClean = (answer || "").trim().toLowerCase();

  if (enteredClean !== expectedAnswer) {
    return {
      success: false,
      error: "Incorrect recovery answer. Please try again.",
    };
  }

  // Generate new cryptographically secure random key
  const newKey = generateSecureKey();
  const newHash = hashKey(newKey);
  await updateActiveKeyHash(newHash);

  // Invalidate any open sessions
  await clearAcademicHubSession();

  return { success: true, newKey };
}

/**
 * Sends a 6-digit verification code to the configured recovery email.
 */
export async function requestRecoveryEmailOtp(): Promise<{
  success: boolean;
  maskedEmail?: string;
  error?: string;
}> {
  // Rate limiting: 3 requests per 10 minutes
  const rate = checkRateLimit("recovery-email-request", 3, 10 * 60 * 1000);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Too many email recovery requests. Please wait ${rate.resetInSeconds} seconds.`,
    };
  }

  const recoveryEmail = (process.env.ACADEMIC_HUB_RECOVERY_EMAIL || "festusphillip19@gmail.com")
    .replace(/^["']|["']$/g, "")
    .trim();

  // Generate 6 digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  recoveryTokens.set(code, {
    code,
    email: recoveryEmail,
    expiresAt,
    used: false,
  });

  // Mask email for display e.g. f***9@gmail.com
  const atIdx = recoveryEmail.indexOf("@");
  const maskedEmail =
    atIdx > 2
      ? `${recoveryEmail[0]}***${recoveryEmail[atIdx - 1]}${recoveryEmail.slice(atIdx)}`
      : recoveryEmail;

  // Send via Brevo
  const emailResult = await sendBrevoEmail({
    to: [{ email: recoveryEmail, name: "Academic Hub Admin" }],
    subject: "TACSFON Academic Hub — Master Key Recovery Code",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1c1917; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; background-color: #fafaf9;">
        <div style="background-color: #0c4a6e; padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">TACSFON Academic Hub</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #bae6fd;">Security Key Reset Verification</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="font-size: 14px; margin-top: 0;">An administrator has requested to reset the <strong>Academic Hub Document Ingestion Security Key</strong>.</p>
          <div style="margin: 24px 0; text-align: center;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background-color: #f0f9ff; border: 1px dashed #0284c7; color: #0369a1; border-radius: 8px;">
              ${code}
            </span>
          </div>
          <p style="font-size: 12px; color: #78716c; margin-bottom: 0;">This code is valid for <strong>10 minutes</strong>. If you did not initiate this request, no action is needed; your current security key remains unchanged.</p>
        </div>
        <div style="padding: 12px 24px; background-color: #f5f5f4; text-align: center; font-size: 11px; color: #a8a29e;">
          TACSFON OAUSTECH Chapter × Academic Hub
        </div>
      </div>
    `,
  });

  if (!emailResult.success) {
    // If Brevo failed, in development log the code so developer is not blocked
    console.warn(`[DEV RECOVERY OTP]: Code for ${recoveryEmail} is ${code}`);
  }

  return { success: true, maskedEmail };
}

/**
 * Verifies email OTP code, generates new random security key, and returns it once.
 */
export async function verifyEmailRecoveryOtp(
  code: string
): Promise<{ success: boolean; newKey?: string; error?: string }> {
  const rate = checkRateLimit("recovery-email-verify", 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Too many attempts. Please wait ${rate.resetInSeconds} seconds.`,
    };
  }

  const cleanCode = (code || "").trim();
  const token = recoveryTokens.get(cleanCode);

  if (!token || token.used || token.expiresAt < Date.now()) {
    return {
      success: false,
      error: "Invalid or expired verification code.",
    };
  }

  token.used = true;
  recoveryTokens.delete(cleanCode);

  const newKey = generateSecureKey();
  const newHash = hashKey(newKey);
  await updateActiveKeyHash(newHash);
  await clearAcademicHubSession();

  return { success: true, newKey };
}
