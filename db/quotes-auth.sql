-- Add to dedicated quote schema before enabling login.
create table if not exists public.quote_sessions (
  token_digest text primary key,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists quote_sessions_email_idx on public.quote_sessions (lower(email));
alter table public.quote_sessions enable row level security;
revoke all on public.quote_sessions from anon, authenticated;
