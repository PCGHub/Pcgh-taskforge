import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/tasks/types";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id,task_code,title,description,category,reward_amount,currency,target_url,status,deadline,completion_window_hours")
    .eq("status","PUBLISHED")
    .order("created_at",{ascending:false}) as {data: Task[] | null};

  return <main className="shell">
    <header className="topbar"><div><span className="eyebrow">WORKER</span><h1>Available tasks</h1></div><Link href="/worker" className="button">Dashboard</Link></header>
    <section className="task-list">
      {!tasks?.length && <div className="card"><h2>No published tasks yet</h2><p>New legitimate tasks will appear here when an administrator publishes them.</p></div>}
      {tasks?.map(task => <article className="card task-card" key={task.id}>
        <div><span className="eyebrow">{task.category} · {task.task_code}</span><h2>{task.title}</h2><p>{task.description}</p></div>
        <div className="task-meta"><strong>{task.currency} {Number(task.reward_amount).toLocaleString()}</strong><Link className="button primary" href={`/worker/tasks/${task.id}`}>View task</Link></div>
      </article>)}
    </section>
  </main>;
}