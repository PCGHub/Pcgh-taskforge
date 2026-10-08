create or replace function public.create_evidence_record(
  p_submission_id uuid,
  p_evidence_type public.evidence_type,
  p_file_path text,
  p_file_name text,
  p_mime_type text,
  p_file_size bigint,
  p_content_hash text default null,
  p_text_value text default null,
  p_external_url text default null,
  p_reference_value text default null
)
returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid; s public.task_submissions%rowtype; eid uuid;
begin
  uid := public.current_app_user_id();
  if uid is null or public.current_app_role() <> 'WORKER' then raise exception 'FORBIDDEN'; end if;
  select s.* into s from public.task_submissions s
  join public.task_assignments a on a.id=s.assignment_id
  where s.id=p_submission_id and a.user_id=uid for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if s.status not in ('PENDING','MORE_INFORMATION_REQUIRED') then raise exception 'EVIDENCE_NOT_ALLOWED'; end if;
  if p_file_path is null and p_external_url is null and p_text_value is null and p_reference_value is null then raise exception 'VALIDATION_ERROR'; end if;
  insert into public.task_evidence(submission_id,evidence_type,file_path,file_name,mime_type,file_size,content_hash,text_value,external_url,reference_value)
  values(p_submission_id,p_evidence_type,p_file_path,p_file_name,p_mime_type,p_file_size,p_content_hash,p_text_value,p_external_url,p_reference_value)
  returning id into eid;
  insert into public.task_events(assignment_id,event_type,actor_user_id,metadata)
  select assignment_id,'EVIDENCE_ADDED',uid,jsonb_build_object('evidence_id',eid,'submission_id',p_submission_id)
  from public.task_submissions where id=p_submission_id;
  return eid;
end; $$;

revoke all on function public.create_evidence_record(uuid,public.evidence_type,text,text,text,bigint,text,text,text,text) from public;
grant execute on function public.create_evidence_record(uuid,public.evidence_type,text,text,text,bigint,text,text,text,text) to authenticated;