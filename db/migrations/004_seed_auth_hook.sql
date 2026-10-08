create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare worker_role uuid;
begin
  select id into worker_role from public.roles where name='WORKER';
  insert into public.users(auth_user_id,role_id,email,status,email_verified_at)
  values(new.id,worker_role,new.email,'ACTIVE',case when new.email_confirmed_at is not null then new.email_confirmed_at else null end)
  on conflict (auth_user_id) do nothing;
  insert into public.profiles(user_id,display_name)
  select id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1))
  from public.users where auth_user_id=new.id
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_auth_user();