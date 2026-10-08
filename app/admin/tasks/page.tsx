import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTasks(){
 const s=await createClient();
 const {data:rows}=await s.from("tasks").select("id,task_code,title,category,reward_amount,currency,status,max_workers,deadline,created_at").order("created_at",{ascending:false});
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">ADMIN</span><h1>Task management</h1></div><div className="actions"><Link href="/admin/tasks/new" className="button primary">Create task</Link><Link href="/admin" className="button">Command center</Link></div></header><section className="card"><div className="table-wrap"><table><thead><tr><th>Code</th><th>Task</th><th>Category</th><th>Reward</th><th>Status</th><th>Workers</th></tr></thead><tbody>{rows?.map((t:any)=><tr key={t.id}><td>{t.task_code}</td><td>{t.title}</td><td>{t.category}</td><td>{t.currency} {Number(t.reward_amount).toLocaleString()}</td><td>{t.status}</td><td>{t.max_workers??"∞"}</td></tr>)}</tbody></table>{!rows?.length&&<p>No tasks yet.</p>}</div></section></main>;
}