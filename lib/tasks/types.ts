export type Task = {
  id: string;
  task_code: string;
  title: string;
  description: string;
  category: string;
  reward_amount: number;
  currency: string;
  target_url: string | null;
  status: string;
  deadline: string | null;
  completion_window_hours: number | null;
};

export type Assignment = {
  id: string;
  task_id: string;
  user_id: string;
  status: string;
  assigned_at: string;
  claimed_at: string | null;
  started_at: string | null;
  submitted_at: string | null;
};