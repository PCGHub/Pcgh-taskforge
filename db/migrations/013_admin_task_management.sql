-- TaskForge V1 admin task management

create or replace function public.admin_create_task(
 p_title text,p_description text,p_category text,p_reward_amount numeric,
 p_currency char(3) default 'NGN',p_target_url text default null,
 p_max_workers integer default null,p_deadline timestamptz default null,
 p_completion_window_hours integer default null,p_requirements jsonb default '[]'::jsonb
) returns uuid language plpgsql security definer set search_path=public as $$
declare aid uuid; tid uuid; code text; req jsonb; n integer:=0;
begin
 aid:=public.current_app_user_id();
 if aid is null or public.current_app_role()<>'ADMIN' then raise exception 'FORBIDDEN'; end if;
 if nullif(trim(p_title),'') is null or nullif(trim(p_description),'') is null
    or nullif(trim(p_category),'') is null or p_reward_amount<0 then raise exception 'VALIDATION_ERROR'; end if;
 if p_max_workers is not null and p_max_workers<=0 then raise exception 'VALIDATION_ERROR'; end if;
 if p_completion_window_hours is not null and p_completion_window_hours<=0 then raise exception 'VALIDATION_ERROR'; end if;
 code:='TSK-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
 insert into public.tasks(task_code,title,description,category,reward_amount,currency,target_url,status,max_workers,deadline,completion_window_hours,created_by)
 values(code,trim(p_title),trim(p_description),trim(p_category),p_reward_amount,p_currency,nullif(trim(p_target_url),''),'DRAFT',p_max_workers,p_deadline,p_completion_window_hours,aid)
 returning id into tid;
 if jsonb_typeof(coalesce(p_requirements,'[]'::jsonb))='array' then
   for req in select value from jsonb_array_elements(p_requirements) loop
     if nullif(trim(req->>'title'),'') is not null and nullif(trim(req->>'description'),'') is not null then
       n:=n+1;
       insert into public.task_requirements(task_id,title,description,requirement_type,is_required,sort_order)
       values(tid,trim(req->>'title'),trim(req->>'description'),coalesce(nullif(req->>'requirement_type',''),'GENERAL'),true,n);
     end if;
   end loop;
 end if;
 perform public.write_audit_log('TASK_CREATED','TASK',tid,jsonb_build_object('task_code',code));
 return tid;
end; $$;

create or replace function public.admin_publish_task(p_task_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare aid uuid; tid uuid;
begin
 aid:=public.current_app_user_id();
 if aid is null or public.current_app_role()<>'ADMIN' then raise exception 'FORBIDDEN'; end if;
 update public.tasks set status='PUBLISHED',published_at=now(),updated_at=now()
 where id=p_task_id and status='DRAFT' returning id into tid;
 if tid is null then raise exception 'INVALID_STATE_TRANSITION'; end if;
 perform public.write_audit_log('TASK_PUBLISHED','TASK',tid);
 return tid;
end; $$;

create or replace function public.admin_pause_task(p_task_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare aid uuid; tid uuid;
begin
 aid:=public.current_app_user_id();
 if aid is null or public.current_app_role()<>'ADMIN' then raise exception 'FORBIDDEN'; end if;
 update public.tasks set status='PAUSED',updated_at=now()
 where id=p_task_id and status in ('PUBLISHED','FULL') returning id into tid;
 if tid is null then raise exception 'INVALID_STATE_TRANSITION'; end if;
 perform public.write_audit_log('TASK_PAUSED','TASK',tid);
 return tid;
end; $$;

revoke all on function public.admin_create_task(text,text,text,numeric,char,text,integer,timestamptz,integer,jsonb) from public;
revoke all on function public.admin_publish_task(uuid) from public;
revoke all on function public.admin_pause_task(uuid) from public;
grant execute on function public.admin_create_task(text,text,text,numeric,char,text,integer,timestamptz,integer,jsonb) to authenticated;
grant execute on function public.admin_publish_task(uuid) to authenticated;
grant execute on function public.admin_pause_task(uuid) to authenticated;