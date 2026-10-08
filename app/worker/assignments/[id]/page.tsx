import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmitForm } from "./submit-form";

export default async function AssignmentPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const supabase=await createClient();
  const {data:a}=await supabase.from("task_assignments").select("id,status,task_id,claimed_at,started_at,submitted_at,tasks!inner(title,description,category,reward_amount,currency,target_url)").eq("id",id).maybeSingle();
  if(!a) notFound();
  const {data:reqs}=await supabase.from("task_requirements").select("id,title,description,requirement_type,is_required").eq("task_id",a.task_id).order("sort_order");
  return <main className="shell"><Link href="/worker/tasks" className="button">← Tasks</Link><section className="card task-detail">
    <span className="eyebrow">{a.tasks.category} · {a.status}</span><h1>{a.tasks.title}</h1><p>{a.tasks.description}</p>
    <div className="reward">{a.tasks.currency} {Number(a.tasks.reward_amount).toLocaleString()}</div>
    {a.tasks.target_url && <a className="button" href={a.tasks.target_url} target="_blank" rel="noreferrer">Open target</a>}
    <h2>Requirements</h2><ol>{reqs?.map(r=><li key={r.id}><strong>{r.title}</strong><p>{r.description}</p></li>)}</ol>
    {["IN_PROGRESS","MORE_PROOF_REQUIRED"].includes(a.status) && <SubmitForm assignmentId={id}/>}
    {a.status==="SUBMITTED" && <div className="notice">Submitted. Your proof is awaiting administrator review.</div>}
    {a.status==="UNDER_REVIEW" && <div className="notice">Your submission is currently being reviewed.</div>}
  </section></main>;
}