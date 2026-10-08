alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.profiles enable row level security;

create or replace function public.current_app_user_id()
returns uuid language sql stable security definer set search_path = public
as $$ select id from public.users where auth_user_id = auth.uid() limit 1 $$;

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = public
as $$ select r.name from public.users u join public.roles r on r.id=u.role_id where u.auth_user_id=auth.uid() limit 1 $$;

create policy "users read own record" on public.users for select using (auth_user_id = auth.uid());
create policy "profiles read own record" on public.profiles for select using (user_id = public.current_app_user_id());
create policy "profiles update own record" on public.profiles for update using (user_id = public.current_app_user_id()) with check (user_id = public.current_app_user_id());
create policy "admin read users" on public.users for select using (public.current_app_role() = 'ADMIN');
create policy "admin read profiles" on public.profiles for select using (public.current_app_role() = 'ADMIN');