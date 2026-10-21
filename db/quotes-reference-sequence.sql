-- Already applied to Enviro Aqua quotations Supabase database.
CREATE SEQUENCE IF NOT EXISTS public.enviro_quote_reference_seq AS bigint START WITH 3410 INCREMENT BY 1 MINVALUE 3410;
CREATE OR REPLACE FUNCTION public.next_enviro_quote_reference() RETURNS text LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$ SELECT 'EA-Q-' || nextval('public.enviro_quote_reference_seq'::regclass)::text $$;
REVOKE ALL ON FUNCTION public.next_enviro_quote_reference() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_enviro_quote_reference() TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.enviro_quote_reference_seq TO service_role;
