import Link from "next/link";
import {notFound} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

export default async function User360({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const s=await createClient();
 const [{data:u},{data:assignments},{data:tx},{data:withdrawals},{data:events}]=await Promise.all([
  s.from("users").select("id,email,phone,status,created_at,last_login_at,profiles(first_name,last_name,display_name,country_code,timezone,bio)").eq("id",id).maybeSingle(),
  s.from("task_assignments").select("id,status,assigned_at,submitted_at,approved_at,completed_at,attempt_count,tasks(title,task_code,reward_amount,currency)").eq("user_id",id).order("created_at",{ascending:false}).limit(50),
  s.from("wallet_transactions").select("id,transaction_type,direction,amount,currency,status,reference_type,reference_id,description,created_at").eq("user_id",id).order("created_at",{ascending:false}).limit(50),
  s.from("withdrawals").select("id,withdrawal_code,amount,currency,status,method,requested_at,processed_at,failure_reason").eq("user_id",id).order("created_at",{ascending:false}).limit(50),
  s.from("audit_logs").select("id,action,entity_type,entity_id,metadata,created_at").eq("actor_user_id",id).order("created_at",{ascending:false}).limit(50)
 ]);
 if(!u)notFound(); const p=(u as any).profiles; const a:any[]=assignments||[]; const posted:any[]=tx||[];
 const balance=posted.filter(x=>x.status==="POSTED").reduce((n,x)=>n+(x.direction==="CREDIT"?Number(x.amount):-Number(x.amount)),0);
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">USER 360</span><h1>{p?.display_name||u.email}</h1><p>{u.email} · {u.status}</p></div><Link href="/admin/users" className="button">Workers</Link></header>
 <section className="grid stats"><article><span>Wallet balance</span><strong>₦{balance.toLocaleString()}</strong></article><article><span>Total assignments</span><strong>{a.length}</strong></article><article><span>Rewarded</span><strong>{a.filter(x=>x.status==="REWARDED").length}</strong></article><article><span>Withdrawals</span><strong>{withdrawals?.length||0}</strong></article></section>
 <section className="grid"><article className="card"><h2>Profile</h2><p>{p?.first_name||""} {p?.last_name||""}</p><p>Country: {p?.country_code||"—"} · Timezone: {p?.timezone||"—"}</p><p>Joined: {new Date(u.created_at).toLocaleString()}</p></article>
 <article className="card"><h2>Task history</h2>{a.map(x=>{const task=x.tasks?.[0]; return <p key={x.id}><strong>{task?.task_code}</strong> · {task?.title} · {x.status}</p>})}</article>
 <article className="card"><h2>Withdrawals</h2>{withdrawals?.map((x:any)=><p key={x.id}>{x.withdrawal_code} · ₦{Number(x.amount).toLocaleString()} · {x.status}</p>)}</article>
 <article className="card"><h2>Ledger</h2>{posted.map(x=><p key={x.id}>{x.direction} ₦{Number(x.amount).toLocaleString()} · {x.transaction_type}</p>)}</article></section></main>;
}