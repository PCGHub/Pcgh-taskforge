import Link from "next/link";
import {createClient} from "@/lib/supabase/server";

export default async function AdminUsers(){
 const s=await createClient();
 const {data:role}=await s.from("roles").select("id").eq("name","WORKER").single(); const {data:workers}=await s.from("users").select("id,email,status,created_at,profiles(first_name,last_name,display_name)").eq("role_id",role?.id||"00000000-0000-0000-0000-000000000000").order("created_at",{ascending:false});
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">ADMIN</span><h1>Workers</h1></div><Link href="/admin" className="button">Command center</Link></header><section className="card"><div className="table-wrap"><table><thead><tr><th>Worker</th><th>Email</th><th>Status</th><th>Joined</th><th></th></tr></thead><tbody>{workers?.map((u:any)=><tr key={u.id}><td>{u.profiles?.display_name||[u.profiles?.first_name,u.profiles?.last_name].filter(Boolean).join(" ")||"—"}</td><td>{u.email}</td><td>{u.status}</td><td>{new Date(u.created_at).toLocaleDateString()}</td><td><Link className="button" href={`/admin/users/${u.id}`}>Open 360</Link></td></tr>)}</tbody></table></div></section></main>;
}