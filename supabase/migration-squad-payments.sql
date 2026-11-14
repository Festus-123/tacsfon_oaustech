-- ============================================================
-- TACSFON: SQUAD PAYMENT CONFIRMATION MIGRATION
-- Run in the Supabase SQL Editor. Safe to run more than once.
--
-- 1. payment_transactions: one row per Squad checkout (reference, amount,
--    passengers, payer, status, verification status, paid date).
-- 2. confirm_payment_transaction(): atomically marks a transaction PAID and
--    records the passengers once (duplicate webhooks are ignored).
-- 3. Removes the public "anyone can insert" policies, so a registration can
--    no longer be self-declared; only the server (service role) records
--    confirmed payments.
-- 4. Bank details on payment_requests become optional (Squad handles transfers).
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id UUID NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE,
  payer_email TEXT NOT NULL,
  names JSONB NOT NULL,
  total_people INTEGER NOT NULL CHECK (total_people > 0),
  amount_per_person_snapshot NUMERIC(10, 2) NOT NULL,
  amount_kobo BIGINT NOT NULL CHECK (amount_kobo > 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED')),
  verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (verification_status IN ('UNVERIFIED', 'VERIFIED', 'MISMATCH', 'REJECTED')),
  squad_status TEXT,
  checkout_url TEXT,
  submission_id UUID REFERENCES public.payment_submissions(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_transactions_request_idx
  ON public.payment_transactions (payment_request_id, created_at DESC);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Admins may read transactions. Students never touch this table directly;
-- the server uses the service role key (which bypasses RLS).
DROP POLICY IF EXISTS "Admin can view payment transactions" ON public.payment_transactions;
CREATE POLICY "Admin can view payment transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Remove self-declared payment: no more public inserts.
DROP POLICY IF EXISTS "Public can insert submissions" ON public.payment_submissions;
DROP POLICY IF EXISTS "Public can insert submission people" ON public.payment_submission_people;

-- Bank details are no longer required.
ALTER TABLE public.payment_requests ALTER COLUMN bank_name DROP NOT NULL;
ALTER TABLE public.payment_requests ALTER COLUMN account_name DROP NOT NULL;
ALTER TABLE public.payment_requests ALTER COLUMN account_number DROP NOT NULL;

-- Atomic, idempotent confirmation. Returns 'CONFIRMED' the first time a
-- transaction is confirmed, 'ALREADY_PAID' on duplicates, 'NOT_FOUND' otherwise.
CREATE OR REPLACE FUNCTION public.confirm_payment_transaction(p_reference TEXT, p_paid_at TIMESTAMPTZ)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tx public.payment_transactions%ROWTYPE;
  new_submission UUID;
  person_name TEXT;
BEGIN
  SELECT * INTO tx FROM public.payment_transactions WHERE reference = p_reference FOR UPDATE;
  IF NOT FOUND THEN
    RETURN 'NOT_FOUND';
  END IF;
  IF tx.status = 'PAID' THEN
    RETURN 'ALREADY_PAID';
  END IF;

  INSERT INTO public.payment_submissions (payment_request_id, total_people, amount_per_person_snapshot, total_amount)
  VALUES (tx.payment_request_id, tx.total_people, tx.amount_per_person_snapshot, tx.amount_kobo / 100.0)
  RETURNING id INTO new_submission;

  FOR person_name IN SELECT jsonb_array_elements_text(tx.names) LOOP
    INSERT INTO public.payment_submission_people (submission_id, payment_request_id, name)
    VALUES (new_submission, tx.payment_request_id, person_name);
  END LOOP;

  UPDATE public.payment_transactions
     SET status = 'PAID',
         verification_status = 'VERIFIED',
         paid_at = COALESCE(p_paid_at, now()),
         submission_id = new_submission,
         updated_at = now()
   WHERE id = tx.id;

  RETURN 'CONFIRMED';
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_payment_transaction(TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_transaction(TEXT, TIMESTAMPTZ) TO service_role;

COMMIT;
