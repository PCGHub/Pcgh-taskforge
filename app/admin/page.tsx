import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
 const s=await createClient();
 const [{count:workers},{count:tasks},{count:submissions},{count:withdrawals}]=await Promise.all([
   s.from("users").select("id",{count:"exact",head:true}).eq("role_id",(await s.from("roles").select("id").eq("name","WORKER").single()).data?.id),
   s.from("tasks").select("id",{count:"exact",head:true}).eq("status","PUBLISHED"),
   s.from("task_submissions").select("id",{count:"exact",head:true}).in("status",["PENDING","UNDER_REVIEW","MORE_INFORMATION_REQUIRED"]),
   s.from("withdrawals").select("id",{count:"exact",head:true}).in("status",["REQUESTED","UNDER_REVIEW","APPROVED","PROCESSING"])
 ]);
 return <main className="shell">
  <header className="topbar"><div><span className="eyebrow">TASKFORGE CONTROL</span><h1>Command center</h1></div><div className="actions"><Link href="/admin/tasks" className="button">Tasks</Link><Link href="/admin/withdrawals" className="button">Withdrawals</Link><Link href="/" className="button">Home</Link></div></header>
  <section className="grid stats"><article><span>Workers</span><strong>{workers??0}</strong></article><article><span>Published tasks</span><strong>{tasks??0}</strong></article><article><span>Pending submissions</span><strong>{submissions??0}</strong></article><article><span>Pending withdrawals</span><strong>{withdrawals??0}</strong></article></section>
  <section className="grid"><Link className="card" href="/admin/submissions"><h2>Submission queue</h2><p>Review, approve, reject, or request more proof.</p></Link><Link className="card" href="/admin/tasks"><h2>Task management</h2><p>Create, publish, pause, and monitor worker capacity.</p></Link><Link className="card" href="/admin/withdrawals"><h2>Finance</h2><p>Review withdrawal requests and payout state.</p></Link><article className="card"><h2>Audit trail</h2><p>Every privileged state and money operation is recorded for reconstruction.</p></article></section>
 </main>;
}