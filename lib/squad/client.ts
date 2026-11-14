import crypto from "crypto";

/**
 * Squad (GTCO) payment gateway client. Server-only: the secret key must never reach the browser.
 * Amounts handed to / received from Squad are in kobo (₦1 = 100 kobo).
 */

const DEFAULT_BASE_URL = "https://api-d.squadco.com";

function getSecretKey(): string {
  const key = process.env.SQUAD_SECRET_KEY;
  if (!key) throw new Error("SQUAD_SECRET_KEY is not configured on the server");
  return key;
}

function getBaseUrl(): string {
  return (process.env.SQUAD_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export interface InitiateSquadOptions {
  amountKobo: number;
  email: string;
  reference: string;
  callbackUrl: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
}

export async function initiateSquadTransaction(
  options: InitiateSquadOptions
): Promise<{ ok: true; checkoutUrl: string } | { ok: false; error: string }> {
  const res = await fetch(`${getBaseUrl()}/transaction/initiate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: options.amountKobo,
      email: options.email,
      currency: "NGN",
      initiate_type: "inline",
      transaction_ref: options.reference,
      callback_url: options.callbackUrl,
      customer_name: options.customerName,
      payment_channels: ["transfer"],
      metadata: options.metadata ?? {},
    }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  const checkoutUrl: unknown = json?.data?.checkout_url;
  if (!res.ok || typeof checkoutUrl !== "string" || !checkoutUrl) {
    return { ok: false, error: json?.message || `Squad rejected the request (HTTP ${res.status})` };
  }
  return { ok: true, checkoutUrl };
}

export interface SquadVerification {
  /** Squad answered and the lookup succeeded */
  found: boolean;
  /** Raw Squad transaction status, lower-cased (e.g. "success", "failed", "pending") */
  status: string;
  amountKobo: number | null;
  reference: string | null;
  paidAt: string | null;
}

/** Ask Squad directly about a transaction. Never trust a redirect or webhook body on its own. */
export async function verifySquadTransaction(reference: string): Promise<SquadVerification> {
  const res = await fetch(
    `${getBaseUrl()}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${getSecretKey()}` },
      cache: "no-store",
    }
  );

  const json = await res.json().catch(() => null);
  const data = json?.data;
  if (!res.ok || !data) {
    return { found: false, status: "unknown", amountKobo: null, reference: null, paidAt: null };
  }

  const rawAmount = data.transaction_amount ?? data.amount;
  const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);

  return {
    found: true,
    status: String(data.transaction_status ?? data.status ?? "unknown").toLowerCase(),
    amountKobo: Number.isFinite(amount) ? Math.round(amount) : null,
    reference: data.transaction_ref ?? null,
    paidAt: data.created_at ?? data.paid_at ?? null,
  };
}

/** Squad signs the raw webhook body with HMAC-SHA512 (secret key) and sends it uppercase-hex in x-squad-encrypted-body. */
export function verifySquadWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.SQUAD_SECRET_KEY;
  if (!secret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected.toLowerCase());
  const b = Buffer.from(signatureHeader.trim().toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
