create or replace function public.claim_task(p_task_id uuid)
returns uuid
language plpgsql
security definer set search_path=public
as $$
declare uid uuid; t public.tasks%rowtype; assignment_id uuid;
begin
  uid := public.current_app_user_id();
  if uid is null or public.current_app_role() <> 'WORKER' then raise exception 'FORBIDDEN'; end if;
  select * into t from public.tasks where id=p_task_id for update;
  if not found or t.status <> 'PUBLISHED' then raise exception 'TASK_NOT_AVAILABLE'; end if;
  if t.deadline is not null and t.deadline <= now() then raise exception 'TASK_NOT_AVAILABLE'; end if;
  if exists(select 1 from public.task_assignments where task_id=p_task_id and user_id=uid) then raise exception 'TASK_ALREADY_ASSIGNED'; end if;
  if t.max_workers is not null and (select count(*) from public.task_assignments where task_id=p_task_id and status not in ('CANCELLED','EXPIRED','REJECTED')) >= t.max_workers then raise exception 'TASK_NOT_AVAILABLE'; end if;

  insert into public.task_assignments(task_id,user_id,status,claimed_at,started_at)
  values(p_task_id,uid,'IN_PROGRESS',now(),now())
  returning id into assignment_id;

  insert into public.task_events(assignment_id,event_type,actor_user_id)
  values(assignment_id,'TASK_CLAIMED',uid),(assignment_id,'TASK_STARTED',uid);
  return assignment_id;
end;
$$;

create or replace function public.submit_task(p_assignment_id uuid,p_comment text)
returns uuid
language plpgsql
security definer set search_path=public
as $$
declare uid uuid; a public.task_assignments%rowtype; sid uuid; next_number integer;
begin
  uid := public.current_app_user_id();
  select * into a from public.task_assignments where id=p_assignment_id and user_id=uid for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if a.status not in ('IN_PROGRESS','MORE_PROOF_REQUIRED') then raise exception 'SUBMISSION_NOT_ALLOWED'; end if;

  select coalesce(max(submission_number),0)+1 into next_number from public.task_submissions where assignment_id=p_assignment_id;
  insert into public.task_submissions(assignment_id,submission_number,submitted_by,comment,status)
  values(p_assignment_id,next_number,uid,p_comment,'PENDING') returning id into sid;

  update public.task_assignments
  set status='SUBMITTED',submitted_at=now(),attempt_count=attempt_count+1,updated_at=now()
  where id=p_assignment_id;

  insert into public.task_events(assignment_id,event_type,actor_user_id,metadata)
  values(p_assignment_id,'SUBMISSION_CREATED',uid,jsonb_build_object('submission_id',sid,'submission_number',next_number));
  return sid;
end;
$$;

revoke all on function public.claim_task(uuid) from public;
revoke all on function public.submit_task(uuid,text) from public;
grant execute on function public.claim_task(uuid) to authenticated;
grant execute on function public.submit_task(uuid,text) to authenticated;