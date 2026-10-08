import Link from "next/link";
import {createClient} from "@/lib/supabase/server";

export default async function NotificationsPage(){
 const s=await createClient();
 const {data:rows}=await s.from("notifications").select("id,type,title,message,read_at,created_at").order("created_at",{ascending:false}).limit(100);
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">WORKER</span><h1>Notifications</h1></div><Link href="/worker" className="button">Dashboard</Link></header><section className="card">{!rows?.length?<p>No notifications yet.</p>:rows.map((n:any)=><article key={n.id} className="notice"><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.created_at).toLocaleString()} · {n.read_at?"Read":"Unread"}</small></article>)}</section></main>;
}