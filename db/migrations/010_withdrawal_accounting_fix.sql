-- TaskForge V1 accounting hardening
-- Reservations are represented by withdrawal status, not a posted wallet debit.
-- Existing reservation/release pairs are cancelled so historical net balances remain correct.

update public.wallet_transactions r
set status='CANCELLED'
where r.transaction_type='WITHDRAWAL_RESERVATION'
  and r.status='POSTED';

update public.wallet_transactions r
set status='CANCELLED'
where r.transaction_type='WITHDRAWAL_RELEASE'
  and r.status='POSTED';

create or replace function public.request_withdrawal(
 p_amount numeric,
 p_currency char(3),
 p_method text,
 p_destination_reference text,
 p_idempotency_key text
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare
 uid uuid; w public.wallets%rowtype; available numeric; wid uuid; code text;
begin
 uid:=public.current_app_user_id();
 if uid is null or public.current_app_role()<>'WORKER' then raise exception 'FORBIDDEN'; end if;
 if p_amount<=0 or p_currency is null or p_method is null
    or p_destination_reference is null or p_idempotency_key is null then raise exception 'VALIDATION_ERROR'; end if;
 select * into w from public.wallets where user_id=uid and currency=p_currency for update;
 if not found then raise exception 'INSUFFICIENT_BALANCE'; end if;
 select id into wid from public.withdrawals where user_id=uid and idempotency_key=p_idempotency_key;
 if wid is not null then return wid; end if;
 available:=public.wallet_available_balance(uid,p_currency)
   - coalesce((select sum(amount) from public.withdrawals
               where user_id=uid and currency=p_currency
               and status in ('REQUESTED','UNDER_REVIEW','APPROVED','PROCESSING')),0);
 if available<p_amount then raise exception 'INSUFFICIENT_BALANCE'; end if;
 code:='WD-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
 insert into public.withdrawals(withdrawal_code,user_id,wallet_id,amount,currency,method,destination_reference,status,idempotency_key)
 values(code,uid,w.id,p_amount,p_currency,p_method,p_destination_reference,'REQUESTED',p_idempotency_key)
 returning id into wid;
 return wid;
end; $$;

create or replace function public.admin_update_withdrawal(
 p_withdrawal_id uuid,p_decision text,p_note text default null
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare aid uuid; wd public.withdrawals%rowtype; tx_id uuid;
begin
 aid:=public.current_app_user_id();
 if aid is null or public.current_app_role()<>'ADMIN' then raise exception 'FORBIDDEN'; end if;
 select * into wd from public.withdrawals where id=p_withdrawal_id for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if p_decision not in ('UNDER_REVIEW','APPROVE','PROCESS','PAID','FAIL','REJECT') then raise exception 'VALIDATION_ERROR'; end if;

 if p_decision='UNDER_REVIEW' then
   if wd.status<>'REQUESTED' then raise exception 'INVALID_STATE_TRANSITION'; end if;
   update public.withdrawals set status='UNDER_REVIEW',admin_note=p_note,updated_at=now() where id=wd.id;
 elsif p_decision='APPROVE' then
   if wd.status<>'UNDER_REVIEW' then raise exception 'INVALID_STATE_TRANSITION'; end if;
   update public.withdrawals set status='APPROVED',admin_note=p_note,processed_by=aid,updated_at=now() where id=wd.id;
 elsif p_decision='PROCESS' then
   if wd.status<>'APPROVED' then raise exception 'INVALID_STATE_TRANSITION'; end if;
   update public.withdrawals set status='PROCESSING',admin_note=p_note,processed_by=aid,updated_at=now() where id=wd.id;
 elsif p_decision='PAID' then
   if wd.status<>'PROCESSING' then raise exception 'INVALID_STATE_TRANSITION'; end if;
   update public.withdrawals set status='PAID',processed_at=now(),processed_by=aid,admin_note=p_note,updated_at=now() where id=wd.id;
   insert into public.wallet_transactions(wallet_id,user_id,transaction_type,direction,amount,currency,status,reference_type,reference_id,description,created_by)
   values(wd.wallet_id,wd.user_id,'WITHDRAWAL','DEBIT',wd.amount,wd.currency,'POSTED','WITHDRAWAL',wd.id,'Withdrawal paid '||wd.withdrawal_code,aid)
   returning id into tx_id;
 elsif p_decision='FAIL' then
   if wd.status not in ('REQUESTED','UNDER_REVIEW','APPROVED','PROCESSING') then raise exception 'INVALID_STATE_TRANSITION'; end if;
   update public.withdrawals set status='FAILED',failure_reason=p_note,processed_at=now(),processed_by=aid,updated_at=now() where id=wd.id;
 elsif p_decision='REJECT' then
   if wd.status not in ('REQUESTED','UNDER_REVIEW') then raise exception 'INVALID_STATE_TRANSITION'; end if;
   update public.withdrawals set status='REJECTED',failure_reason=p_note,processed_at=now(),processed_by=aid,updated_at=now() where id=wd.id;
 end if;
 return jsonb_build_object('withdrawal_id',wd.id,'decision',p_decision,'transaction_id',tx_id);
end; $$;

revoke all on function public.request_withdrawal(numeric,char,text,text,text) from public;
revoke all on function public.admin_update_withdrawal(uuid,text,text) from public;
grant execute on function public.request_withdrawal(numeric,char,text,text,text) to authenticated;
grant execute on function public.admin_update_withdrawal(uuid,text,text) to authenticated;
