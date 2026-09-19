import crypto from "crypto";

export interface InitializePaystackOptions {
  email: string;
  amount: number; // in NGN (will be converted to kobo)
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string; // 'success', 'failed', 'abandoned'
    reference: string;
    amount: number; // in kobo
    currency: string;
    customer?: {
      email: string;
    };
    metadata?: Record<string, unknown>;
    paid_at?: string;
  };
}

export async function initializePaystackTransaction(
  options: InitializePaystackOptions
): Promise<PaystackInitResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured on the server");
  }

  const payload = {
    email: options.email,
    amount: Math.round(options.amount * 100), // convert NGN to kobo
    reference: options.reference,
    callback_url: options.callback_url,
    metadata: options.metadata || {},
  };

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = await res.json();
  return json as PaystackInitResponse;
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured on the server");
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();
  return json as PaystackVerifyResponse;
}

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !signatureHeader) return false;

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  return hash === signatureHeader;
}
