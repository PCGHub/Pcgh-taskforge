-- Restrict notifications to server-created content; workers only mark read via RPC.

drop policy if exists "workers mark own notifications" on public.notifications;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql security definer set search_path=public
as $$
begin
 update public.notifications
 set read_at=coalesce(read_at,now())
 where id=p_notification_id
   and user_id=public.current_app_user_id();
end;
$$;

revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;
