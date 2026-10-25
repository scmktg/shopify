-- Run once in the dedicated quotations Supabase project before deploying webhook changes.
-- Preserve original invoice_paid_at for audit purposes.
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_invoice_status_check;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_invoice_status_check
  CHECK (invoice_status IN ('unpaid', 'checkout_started', 'paid', 'cancelled', 'refunded'));
