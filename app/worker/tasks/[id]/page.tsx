import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimForm } from "./claim-form";

export default async function TaskDetails({params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const supabase=await createClient();
 const {data:task}=await supabase.from("tasks").select("id,task_code,title,description,category,reward_amount,currency,target_url,deadline,completion_window_hours,status").eq("id",id).eq("status","PUBLISHED").maybeSingle();
 if(!task) notFound();
 const {data:requirements}=await supabase.from("task_requirements").select("id,title,description,requirement_type,is_required,sort_order").eq("task_id",id).order("sort_order");
 return <main className="shell"><Link href="/worker/tasks" className="button">← Tasks</Link><section className="card task-detail"><span className="eyebrow">{task.category} · {task.task_code}</span><h1>{task.title}</h1><p>{task.description}</p><div className="reward">{task.currency} {Number(task.reward_amount).toLocaleString()}</div>{task.target_url&&<a className="button" href={task.target_url} target="_blank" rel="noreferrer">Open task target</a>}<h2>Requirements</h2><ol>{requirements?.map(r=><li key={r.id}><strong>{r.title}</strong><p>{r.description}</p></li>)}</ol><ClaimForm taskId={task.id}/></section></main>;
}