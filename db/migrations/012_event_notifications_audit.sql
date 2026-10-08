-- TaskForge V1 event-driven notifications and immutable audit trail

create or replace function public.handle_task_event_notifications()
returns trigger
language plpgsql security definer set search_path=public
as $$
declare
  worker_id uuid;
  ntype public.notification_type;
  title text;
  message text;
begin
  select user_id into worker_id from public.task_assignments where id=NEW.assignment_id;
  if worker_id is null then return NEW; end if;

  if NEW.event_type='TASK_ASSIGNED' then
    ntype:='TASK_ASSIGNED'; title:='New task assigned'; message:='A task has been assigned to you.';
  elsif NEW.event_type='SUBMISSION_CREATED' then
    ntype:='TASK_SUBMITTED'; title:='Task submitted'; message:='Your task submission has been received for review.';
  elsif NEW.event_type='TASK_APPROVED' then
    ntype:='TASK_APPROVED'; title:='Task approved'; message:='Your task has been approved.';
  elsif NEW.event_type='TASK_REJECTED' then
    ntype:='TASK_REJECTED'; title:='Task rejected'; message:=coalesce(NEW.metadata->>'reason','Your task submission was rejected.');
  elsif NEW.event_type='MORE_PROOF_REQUESTED' then
    ntype:='MORE_PROOF_REQUIRED'; title:='More proof required'; message:=coalesce(NEW.metadata->>'reason','Please provide additional proof for this task.');
  elsif NEW.event_type='REWARD_CREATED' then
    ntype:='REWARD_CREATED'; title:='Reward credited'; message:='Your task reward has been credited to your wallet.';
  else
    return NEW;
  end if;

  perform public.create_notification(
    worker_id,ntype,title,message,
    jsonb_build_object('assignment_id',NEW.assignment_id,'event_id',NEW.id)
  );
  return NEW;
end;
$$;

drop trigger if exists trg_task_event_notifications on public.task_events;
create trigger trg_task_event_notifications
after insert on public.task_events
for each row execute function public.handle_task_event_notifications();

create or replace function public.handle_withdrawal_notifications()
returns trigger
language plpgsql security definer set search_path=public
as $$
declare
  ntype public.notification_type;
  title text;
  message text;
begin
  if TG_OP='INSERT' then
    ntype:='WITHDRAWAL_REQUESTED';
    title:='Withdrawal requested';
    message:='Your withdrawal '||NEW.withdrawal_code||' has been received and is awaiting review.';
  elsif NEW.status is distinct from OLD.status then
    ntype:='WITHDRAWAL_UPDATED';
    title:='Withdrawal updated';
    message:='Withdrawal '||NEW.withdrawal_code||' is now '||replace(NEW.status::text,'_',' ')||'.';
    if NEW.status='PAID' then
      message:='Withdrawal '||NEW.withdrawal_code||' has been paid.';
    elsif NEW.status in ('FAILED','REJECTED') then
      message:='Withdrawal '||NEW.withdrawal_code||' was not completed.'||case when NEW.failure_reason is not null then ' '||NEW.failure_reason else '' end;
    end if;
  else
    return NEW;
  end if;

  perform public.create_notification(
    NEW.user_id,ntype,title,message,
    jsonb_build_object('withdrawal_id',NEW.id,'withdrawal_code',NEW.withdrawal_code,'status',NEW.status)
  );
  return NEW;
end;
$$;

drop trigger if exists trg_withdrawal_notifications on public.withdrawals;
create trigger trg_withdrawal_notifications
after insert or update on public.withdrawals
for each row execute function public.handle_withdrawal_notifications();

create or replace function public.audit_row_change()
returns trigger
language plpgsql security definer set search_path=public
as $$
declare
  actor uuid;
  entity_id uuid;
  payload jsonb;
begin
  actor:=public.current_app_user_id();
  entity_id:=coalesce(NEW.id,OLD.id);
  payload:=jsonb_build_object('operation',TG_OP);
  if TG_OP<>'DELETE' then payload:=payload||jsonb_build_object('new',to_jsonb(NEW)); end if;
  if TG_OP<>'INSERT' then payload:=payload||jsonb_build_object('old',to_jsonb(OLD)); end if;

  insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,metadata)
  values(actor,TG_OP||'_'||upper(TG_TABLE_NAME),TG_TABLE_NAME,entity_id,payload);

  return coalesce(NEW,OLD);
end;
$$;

drop trigger if exists trg_audit_tasks on public.tasks;
create trigger trg_audit_tasks after insert or update or delete on public.tasks
for each row execute function public.audit_row_change();

drop trigger if exists trg_audit_assignments on public.task_assignments;
create trigger trg_audit_assignments after insert or update or delete on public.task_assignments
for each row execute function public.audit_row_change();

drop trigger if exists trg_audit_submissions on public.task_submissions;
create trigger trg_audit_submissions after insert or update or delete on public.task_submissions
for each row execute function public.audit_row_change();

drop trigger if exists trg_audit_withdrawals on public.withdrawals;
create trigger trg_audit_withdrawals after insert or update or delete on public.withdrawals
for each row execute function public.audit_row_change();

drop trigger if exists trg_audit_wallet_transactions on public.wallet_transactions;
create trigger trg_audit_wallet_transactions after insert or update or delete on public.wallet_transactions
for each row execute function public.audit_row_change();

revoke all on function public.handle_task_event_notifications() from public;
revoke all on function public.handle_withdrawal_notifications() from public;
revoke all on function public.audit_row_change() from public;
