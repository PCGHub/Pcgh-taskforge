import Link from "next/link";
import {createClient} from "@/lib/supabase/server";

export default async function AuditPage(){
 const s=await createClient();
 const {data:logs}=await s.from("audit_logs").select("id,actor_user_id,action,entity_type,entity_id,request_id,created_at").order("created_at",{ascending:false}).limit(200);
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">ADMIN SECURITY</span><h1>Audit trail</h1><p>Immutable operational history for privileged and financial activity.</p></div><Link href="/admin" className="button">Command center</Link></header><section className="card"><div className="table-wrap"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Request</th></tr></thead><tbody>{logs?.map((l:any)=><tr key={l.id}><td>{new Date(l.created_at).toLocaleString()}</td><td>{l.actor_user_id||"SYSTEM"}</td><td>{l.action}</td><td>{l.entity_type}</td><td>{l.entity_id||"—"}</td><td>{l.request_id||"—"}</td></tr>)}</tbody></table>{!logs?.length&&<p>No audit entries yet.</p>}</div></section></main>;
}