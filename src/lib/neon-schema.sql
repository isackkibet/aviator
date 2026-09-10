-- Run this in your Neon SQL editor (Neon console -> SQL Editor)
-- or: psql "$DATABASE_URL" -f src/lib/neon-schema.sql

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

-- Demo game settings (controls the free practice dashboard)
create table if not exists admin_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null default '',
  updated_at timestamptz not null default now()
);

insert into admin_settings (key, value) values
  ('max_multiplier', '100'),
  ('signals_running', 'true')
on conflict (key) do nothing;
