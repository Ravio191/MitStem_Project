-- MITstem - Phase 1: website contact enquiries.
-- BEFORE YOU RUN: verify there is no existing public.website_enquiries table
-- with a different purpose. This script does not touch other tables.

create table if not exists public.website_enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  stage text not null check (stage in (
    'Not specified', 'Primary', 'Lower secondary',
    'IGCSE / O Level', 'AS / A Level', 'General enquiry'
  )),
  message text not null check (char_length(message) between 10 and 3000),
  consent_to_contact boolean not null check (consent_to_contact = true),
  source text not null default 'website' check (source = 'website'),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

-- Clients cannot access this table. Only the server-side secret key may write.
alter table public.website_enquiries enable row level security;
revoke all on table public.website_enquiries from anon, authenticated;
grant select, insert, update, delete on table public.website_enquiries to service_role;

-- Do not add an "allow all" RLS policy for anon or authenticated.
-- Staff can inspect records directly from Supabase's Table Editor.
