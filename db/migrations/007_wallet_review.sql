create type public.wallet_status as enum ('ACTIVE','SUSPENDED','CLOSED');
create type public.transaction_direction as enum ('CREDIT','DEBIT');
create type public.wallet_transaction_status as enum ('PENDING','POSTED','REVERSED','CANCELLED');

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id),
  currency char(3) not null default 'NGN',
  status public.wallet_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id),
  user_id uuid not null references public.users(id),
  transaction_type text not null,
  direction public.transaction_direction not null,
  amount numeric(18,2) not null check (amount > 0),
  currency char(3) not null default 'NGN',
  status public.wallet_transaction_status not null default 'POSTED',
  reference_type text,
  reference_id uuid,
  description text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create unique index if not exists uq_wallet_reward_reference
on public.wallet_transactions(reference_type,reference_id)
where transaction_type='TASK_REWARD' and status<>'CANCELLED';

create index if not exists idx_wallet_tx_user_created on public.wallet_transactions(user_id,created_at desc);
create index if not exists idx_wallet_tx_wallet_created on public.wallet_transactions(wallet_id,created_at desc);
create index if not exists idx_wallet_tx_reference on public.wallet_transactions(reference_id);

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "workers read own wallet" on public.wallets for select
using (user_id=public.current_app_user_id());

create policy "admins manage wallets" on public.wallets for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');

create policy "workers read own transactions" on public.wallet_transactions for select
using (user_id=public.current_app_user_id());

create policy "admins read transactions" on public.wallet_transactions for select
using (public.current_app_role()='ADMIN');

create or replace function public.review_submission(
  p_submission_id uuid,
  p_decision text,
  p_comment text default null
)
returns jsonb
language plpgsql
security definer set search_path=public
as $$
declare
  admin_id uuid;
  s public.task_submissions%rowtype;
  a public.task_assignments%rowtype;
  t public.tasks%rowtype;
  w public.wallets%rowtype;
  tx_id uuid;
begin
  admin_id := public.current_app_user_id();
  if admin_id is null or public.current_app_role() <> 'ADMIN' then raise exception 'FORBIDDEN'; end if;

  if p_decision not in ('APPROVE','REJECT','MORE_PROOF_REQUIRED') then
    raise exception 'VALIDATION_ERROR';
  end if;

  select * into s from public.task_submissions where id=p_submission_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if s.status not in ('PENDING','UNDER_REVIEW','MORE_INFORMATION_REQUIRED') then
    raise exception 'INVALID_STATE_TRANSITION';
  end if;

  select * into a from public.task_assignments where id=s.assignment_id for update;
  select * into t from public.tasks where id=a.task_id;
  if a.status not in ('SUBMITTED','UNDER_REVIEW') then raise exception 'INVALID_STATE_TRANSITION'; end if;

  update public.task_submissions
  set status=case p_decision
    when 'APPROVE' then 'APPROVED'::public.submission_status
    when 'REJECT' then 'REJECTED'::public.submission_status
    else 'MORE_INFORMATION_REQUIRED'::public.submission_status
  end,
  reviewed_at=now(),reviewed_by=admin_id,review_comment=p_comment,updated_at=now()
  where id=s.id;

  if p_decision='APPROVE' then
    update public.task_assignments
    set status='REWARDED',approved_at=now(),completed_at=now(),reviewed_at=now(),review_notes=p_comment,updated_at=now()
    where id=a.id;

    insert into public.wallets(user_id,currency)
    values(a.user_id,t.currency)
    on conflict(user_id) do nothing;

    select * into w from public.wallets where user_id=a.user_id for update;

    insert into public.wallet_transactions(
      wallet_id,user_id,transaction_type,direction,amount,currency,status,reference_type,reference_id,description,created_by
    )
    values(
      w.id,a.user_id,'TASK_REWARD','CREDIT',t.reward_amount,t.currency,'POSTED','TASK_ASSIGNMENT',a.id,
      'Reward for approved task '||t.task_code,admin_id
    )
    on conflict (reference_type,reference_id) where transaction_type='TASK_REWARD' and status<>'CANCELLED'
    do nothing
    returning id into tx_id;

    if tx_id is not null then
      insert into public.task_events(assignment_id,event_type,actor_user_id,metadata)
      values(a.id,'TASK_APPROVED',admin_id,jsonb_build_object('submission_id',s.id)),
            (a.id,'REWARD_CREATED',admin_id,jsonb_build_object('transaction_id',tx_id,'amount',t.reward_amount,'currency',t.currency));
    end if;
  elsif p_decision='REJECT' then
    update public.task_assignments
    set status='REJECTED',reviewed_at=now(),review_notes=p_comment,rejection_reason=p_comment,updated_at=now()
    where id=a.id;
    insert into public.task_events(assignment_id,event_type,actor_user_id,metadata)
    values(a.id,'TASK_REJECTED',admin_id,jsonb_build_object('submission_id',s.id,'reason',p_comment));
  else
    update public.task_assignments
    set status='MORE_PROOF_REQUIRED',reviewed_at=now(),review_notes=p_comment,updated_at=now()
    where id=a.id;
    insert into public.task_events(assignment_id,event_type,actor_user_id,metadata)
    values(a.id,'MORE_PROOF_REQUESTED',admin_id,jsonb_build_object('submission_id',s.id,'reason',p_comment));
  end if;

  return jsonb_build_object('assignment_id',a.id,'submission_id',s.id,'decision',p_decision,'transaction_id',tx_id);
end;
$$;

create or replace function public.wallet_available_balance(p_user_id uuid,p_currency char(3) default 'NGN')
returns numeric
language sql stable security definer set search_path=public
as $$
  select coalesce(sum(case when direction='CREDIT' then amount else -amount end),0)
  from public.wallet_transactions
  where user_id=p_user_id and currency=p_currency and status='POSTED'
$$;

revoke all on function public.review_submission(uuid,text,text) from public;
revoke all on function public.wallet_available_balance(uuid,char) from public;
grant execute on function public.review_submission(uuid,text,text) to authenticated;
grant execute on function public.wallet_available_balance(uuid,char) to authenticated;