-- Run this in your Supabase SQL editor

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  package_id text not null,
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  created_at timestamptz not null default now(),
  checkout_id text
);

create index if not exists payments_phone_status_idx
  on payments (phone, status);

-- Admin users table
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null default '',
  created_at timestamptz not null default now()
);

-- Admin sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_token_idx on sessions (token);
create index if not exists sessions_admin_id_idx on sessions (admin_id);
