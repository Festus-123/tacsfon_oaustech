import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 *
 * Students are not Supabase users (every authenticated user is an admin under the
 * current RLS policies), so their entitlements and the private academic files are
 * read and written here, on the server, after the server has checked access itself.
 * Never import this from a client component.
 */
export function createServiceClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient must only be used on the server");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const SERVICE_KEY_MISSING =
  "SUPABASE_SERVICE_ROLE_KEY is not configured on the server, so student access cannot be saved or checked.";
