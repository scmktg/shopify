-- Dedicated Enviro Aqua quotation database. Apply only to the explicitly approved quote project.
-- This migration deliberately does not grant customer-facing Data API access.
create extension if not exists pgcrypto;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_email text not null,
  organisation text not null,
  contact_name text not null,
  postcode text not null,
  items jsonb not null,
  currency text not null default 'AUD' check (currency = 'AUD'),
  product_total_cents bigint not null check (product_total_cents >= 0),
  freight_status text not null default 'to_be_confirmed' check (freight_status in ('to_be_confirmed','confirmed')),
  status text not null default 'issued' check (status in ('issued','checkout_started','purchased','expired','cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  checkout_started_at timestamptz,
  shopify_cart_id text,
  shopify_order_id text,
  confirmed_at timestamptz
);

create index if not exists quote_email_created_idx on public.quotes (lower(customer_email), created_at desc);
create index if not exists quote_created_idx on public.quotes (created_at desc);
alter table public.quotes enable row level security;
revoke all on public.quotes from anon, authenticated;
-- Only server-side role can access quotes. Do not expose service role keys to browsers.

create table if not exists public.quote_access_challenges (
  token_digest text primary key,
  email text not null,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists quote_challenge_email_idx on public.quote_access_challenges(lower(email));
alter table public.quote_access_challenges enable row level security;
revoke all on public.quote_access_challenges from anon, authenticated;
