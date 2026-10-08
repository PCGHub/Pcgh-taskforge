create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('ADMIN','WORKER')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.roles (name, description)
values ('ADMIN','Platform administrator'),('WORKER','Task performer')
on conflict (name) do nothing;