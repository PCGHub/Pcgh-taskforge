create type public.task_status as enum ('DRAFT','PUBLISHED','PAUSED','FULL','CLOSED','EXPIRED','CANCELLED');
create type public.assignment_status as enum ('ASSIGNED','CLAIMED','IN_PROGRESS','SUBMITTED','UNDER_REVIEW','MORE_PROOF_REQUIRED','APPROVED','REJECTED','EXPIRED','CANCELLED','REWARDED');
create type public.submission_status as enum ('PENDING','UNDER_REVIEW','APPROVED','REJECTED','MORE_INFORMATION_REQUIRED');
create type public.evidence_type as enum ('SCREENSHOT','VIDEO','DOCUMENT','TEXT','URL','REFERENCE_ID','EMAIL');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null unique,
  title text not null,
  description text not null,
  category text not null,
  reward_amount numeric(18,2) not null default 0 check (reward_amount >= 0),
  currency char(3) not null default 'NGN',
  target_url text,
  status public.task_status not null default 'DRAFT',
  max_workers integer check (max_workers is null or max_workers > 0),
  deadline timestamptz,
  completion_window_hours integer check (completion_window_hours is null or completion_window_hours > 0),
  created_by uuid not null references public.users(id),
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_requirements (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  description text not null,
  requirement_type text not null,
  is_required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id),
  user_id uuid not null references public.users(id),
  status public.assignment_status not null default 'ASSIGNED',
  assigned_by uuid references public.users(id),
  assigned_at timestamptz not null default now(),
  claimed_at timestamptz,
  started_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  rejection_reason text,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(task_id,user_id)
);

create table if not exists public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.task_assignments(id) on delete cascade,
  submission_number integer not null check (submission_number > 0),
  submitted_by uuid not null references public.users(id),
  comment text,
  status public.submission_status not null default 'PENDING',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id),
  review_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(assignment_id,submission_number)
);

create table if not exists public.task_evidence (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.task_submissions(id) on delete cascade,
  evidence_type public.evidence_type not null,
  file_path text,
  file_name text,
  mime_type text,
  file_size bigint,
  external_url text,
  text_value text,
  reference_value text,
  metadata jsonb not null default '{}'::jsonb,
  content_hash text,
  created_at timestamptz not null default now(),
  check (file_path is not null or external_url is not null or text_value is not null or reference_value is not null)
);

create table if not exists public.task_events (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.task_assignments(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid references public.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_category on public.tasks(category);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_tasks_deadline on public.tasks(deadline);
create index if not exists idx_assignments_user_status on public.task_assignments(user_id,status);
create index if not exists idx_assignments_task_status on public.task_assignments(task_id,status);
create index if not exists idx_assignments_expires on public.task_assignments(expires_at);
create index if not exists idx_submissions_assignment on public.task_submissions(assignment_id);
create index if not exists idx_submissions_status on public.task_submissions(status);
create index if not exists idx_evidence_submission on public.task_evidence(submission_id);
create index if not exists idx_events_assignment_created on public.task_events(assignment_id,created_at);

alter table public.tasks enable row level security;
alter table public.task_requirements enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_submissions enable row level security;
alter table public.task_evidence enable row level security;
alter table public.task_events enable row level security;

create policy "workers read published tasks" on public.tasks for select
using (status in ('PUBLISHED','FULL') and public.current_app_role()='WORKER');

create policy "admins manage tasks" on public.tasks for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');

create policy "workers read task requirements" on public.task_requirements for select
using (exists (select 1 from public.tasks t where t.id=task_id and t.status in ('PUBLISHED','FULL') and public.current_app_role()='WORKER'));

create policy "admins manage task requirements" on public.task_requirements for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');

create policy "workers read own assignments" on public.task_assignments for select
using (user_id=public.current_app_user_id());

create policy "admins manage assignments" on public.task_assignments for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');

create policy "workers read own submissions" on public.task_submissions for select
using (submitted_by=public.current_app_user_id() or exists(select 1 from public.task_assignments a where a.id=assignment_id and a.user_id=public.current_app_user_id()));

create policy "admins manage submissions" on public.task_submissions for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');

create policy "workers read own evidence" on public.task_evidence for select
using (exists(select 1 from public.task_submissions s join public.task_assignments a on a.id=s.assignment_id where s.id=submission_id and a.user_id=public.current_app_user_id()));

create policy "admins manage evidence" on public.task_evidence for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');

create policy "workers read own events" on public.task_events for select
using (exists(select 1 from public.task_assignments a where a.id=assignment_id and a.user_id=public.current_app_user_id()));

create policy "admins manage events" on public.task_events for all
using (public.current_app_role()='ADMIN')
with check (public.current_app_role()='ADMIN');