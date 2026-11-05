-- Purchase order requests require explicit Enviro Aqua review and MYOB invoicing.
create table if not exists public.quote_purchase_order_requests (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  customer_email text not null,
  purchase_order_number text not null,
  notes text not null default '',
  status text not null default 'pending_review' check (status in ('pending_review','approved','declined','invoiced')),
  created_at timestamptz not null default now(),
  unique (quote_id, purchase_order_number)
);
create index if not exists quote_po_created_idx on public.quote_purchase_order_requests(created_at desc);
alter table public.quote_purchase_order_requests enable row level security;
revoke all on public.quote_purchase_order_requests from anon, authenticated;
