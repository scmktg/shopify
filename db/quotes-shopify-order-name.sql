-- Already applied to dedicated Enviro Aqua quotations Supabase database.
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS shopify_order_name text;
