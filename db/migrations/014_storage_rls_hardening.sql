-- TaskForge V1 storage and notification RLS hardening

insert into storage.buckets(id,name,public)
values('task-evidence','task-evidence',false)
on conflict (id) do update set public=false;

drop policy if exists "task evidence worker upload" on storage.objects;
create policy "task evidence worker upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id='task-evidence'
  and public.current_app_role()='WORKER'
  and split_part(name,'/',2)=public.current_app_user_id()::text
);

drop policy if exists "task evidence worker read own" on storage.objects;
create policy "task evidence worker read own"
on storage.objects for select
to authenticated
using (
  bucket_id='task-evidence'
  and (
    (public.current_app_role()='WORKER' and split_part(name,'/',2)=public.current_app_user_id()::text)
    or public.current_app_role()='ADMIN'
  )
);

drop policy if exists "workers update own notifications" on public.notifications;
create policy "workers mark own notifications"
on public.notifications for update
using (user_id=public.current_app_user_id())
with check (user_id=public.current_app_user_id());

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;
