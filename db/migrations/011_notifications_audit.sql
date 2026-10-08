-- TaskForge V1 notifications and audit trail

create type public.notification_type as enum (
  'TASK_ASSIGNED','TASK_SUBMITTED','TASK_APPROVED','TASK_REJECTED',
  'MORE_PROOF_REQUIRED','REWARD_CREATED','WITHDRAWAL_REQUESTED',
  'WITHDRAWAL_UPDATED','SYSTEM'
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_created on public.notifications(user_id,created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id,created_at desc) where read_at is null;
alter table public.notifications enable row level security;

create policy "workers read own notifications" on public.notifications for select
using (user_id=public.current_app_user_id());
create policy "workers update own notifications" on public.notifications for update
using (user_id=public.current_app_user_id())
with check (user_id=public.current_app_user_id());
create policy "admins manage notifications" on public.notifications for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');

create or replace function public.create_notification(
 p_user_id uuid,p_type public.notification_type,p_title text,p_message text,p_data jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path=public as $$
declare nid uuid;
begin
 insert into public.notifications(user_id,type,title,message,data)
 values(p_user_id,p_type,p_title,p_message,coalesce(p_data,'{}'::jsonb))
 returning id into nid;
 return nid;
end; $$;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_entity on public.audit_logs(entity_type,entity_id,created_at desc);
create index if not exists idx_audit_actor on public.audit_logs(actor_user_id,created_at desc);
create index if not exists idx_audit_request on public.audit_logs(request_id) where request_id is not null;
alter table public.audit_logs enable row level security;

create policy "admins read audit logs" on public.audit_logs for select
using (public.current_app_role()='ADMIN');

create or replace function public.write_audit_log(
 p_action text,p_entity_type text,p_entity_id uuid default null,p_metadata jsonb default '{}'::jsonb,p_request_id text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare aid uuid; log_id uuid;
begin
 aid:=public.current_app_user_id();
 insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,request_id,metadata)
 values(aid,p_action,p_entity_type,p_entity_id,p_request_id,coalesce(p_metadata,'{}'::jsonb))
 returning id into log_id;
 return log_id;
end; $$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 update public.notifications set read_at=coalesce(read_at,now())
 where id=p_notification_id and user_id=public.current_app_user_id();
end; $$;

revoke all on function public.create_notification(uuid,public.notification_type,text,text,jsonb) from public;
revoke all on function public.write_audit_log(text,text,uuid,jsonb,text) from public;
revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;
