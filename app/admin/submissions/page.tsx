import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SubmissionQueue() {
  const supabase=await createClient();
  const {data:rows}=await supabase.from("task_submissions").select("id,submission_number,status,submitted_at,comment,assignment_id,task_assignments!inner(status,task_id,users!inner(email),tasks!inner(title,task_code))").in("status",["PENDING","UNDER_REVIEW","MORE_INFORMATION_REQUIRED"]).order("submitted_at",{ascending:true});
  return <main className="shell">
    <header className="topbar"><div><span className="eyebrow">ADMIN</span><h1>Submission queue</h1></div><Link href="/admin" className="button">Command center</Link></header>
    <section className="card">
      {!rows?.length ? <p>No submissions awaiting review.</p> : <div className="table-wrap"><table><thead><tr><th>Task</th><th>Worker</th><th>Status</th><th>Submitted</th><th></th></tr></thead><tbody>{rows.map((row:any)=><tr key={row.id}><td>{row.task_assignments?.tasks?.task_code} · {row.task_assignments?.tasks?.title}</td><td>{row.task_assignments?.users?.email}</td><td>{row.status}</td><td>{new Date(row.submitted_at).toLocaleString()}</td><td><Link className="button" href={`/admin/submissions/${row.id}`}>Review</Link></td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}