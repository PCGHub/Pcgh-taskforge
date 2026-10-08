import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function WorkerDashboard() {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 const { data: app } = user ? await supabase.from("users").select("id").eq("auth_user_id",user.id).maybeSingle() : {data:null};
 let available=0,active=0,pending=0,balance=0,unread=0;
 if(app){
   const [{count:c1},{count:c2},{count:c3},{data:tx},{count:nc}]=await Promise.all([
    supabase.from("tasks").select("id",{count:"exact",head:true}).eq("status","PUBLISHED"),
    supabase.from("task_assignments").select("id",{count:"exact",head:true}).eq("user_id",app.id).in("status",["IN_PROGRESS","MORE_PROOF_REQUIRED"]),
    supabase.from("task_assignments").select("id",{count:"exact",head:true}).eq("user_id",app.id).in("status",["SUBMITTED","UNDER_REVIEW"]),
    supabase.from("wallet_transactions").select("direction,amount,status").eq("user_id",app.id),
    supabase.from("notifications").select("id",{count:"exact",head:true}).eq("user_id",app.id).is("read_at",null)
   ]);
   available=c1||0;active=c2||0;pending=c3||0;unread=nc||0;
   balance=(tx||[]).filter((x:any)=>x.status==="POSTED").reduce((n:any,x:any)=>n+(x.direction==="CREDIT"?Number(x.amount):-Number(x.amount)),0);
 }
 return <main className="shell">
  <header className="topbar"><div><span className="eyebrow">TASKFORGE</span><h1>Worker dashboard</h1></div><div className="actions"><Link href="/worker/notifications" className="button">Notifications {unread ? "(" + unread + ")" : ""}</Link><Link href="/worker/wallet" className="button">Wallet</Link><Link href="/" className="button">Home</Link></div></header>
  <section className="grid stats"><article><span>Available tasks</span><strong>{available}</strong></article><article><span>Active tasks</span><strong>{active}</strong></article><article><span>Pending review</span><strong>{pending}</strong></article><article><span>Available earnings</span><strong>₦{balance.toLocaleString()}</strong></article></section>
  <section className="grid"><Link className="card" href="/worker/tasks"><h2>Browse tasks</h2><p>Find published work and claim eligible tasks.</p></Link><Link className="card" href="/worker/withdrawals"><h2>Withdrawals</h2><p>Track payout requests and processing status.</p></Link><Link className="card" href="/worker/notifications"><h2>Notifications</h2><p>See approval results, proof requests, rewards, and payout updates.</p></Link></section>
 </main>;
}