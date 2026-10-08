create type public.user_status as enum ('PENDING','ACTIVE','SUSPENDED','BANNED','DEACTIVATED');

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  email text not null unique,
  phone text unique,
  status public.user_status not null default 'PENDING',
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  country_code char(2),
  timezone text,
  bio text,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);