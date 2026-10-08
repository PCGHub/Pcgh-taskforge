import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function WithdrawalsPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return <main className="center"><div className="card"><h1>Sign in required</h1><Link className="button primary" href="/login">Sign in</Link></div></main>;
 const {data:app}=await s.from("users").select("id").eq("auth_user_id",user.id).maybeSingle();
 if(!app)return <main className="shell"><div className="card"><p>Account provisioning is still in progress.</p></div></main>;
 const {data:rows}=await s.from("withdrawals").select("id,withdrawal_code,amount,currency,method,destination_reference,status,requested_at,processed_at,admin_note").eq("user_id",app.id).order("requested_at",{ascending:false});
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">WORKER</span><h1>Withdrawals</h1></div><div className="actions"><Link href="/worker/wallet" className="button">Wallet</Link><Link href="/worker" className="button">Dashboard</Link></div></header><section className="card"><h2>Withdrawal history</h2>{!rows?.length?<p>No withdrawals yet.</p>:<div className="table-wrap"><table><thead><tr><th>Code</th><th>Amount</th><th>Method</th><th>Status</th><th>Requested</th></tr></thead><tbody>{rows.map(w=><tr key={w.id}><td>{w.withdrawal_code}</td><td>{w.currency} {Number(w.amount).toLocaleString()}</td><td>{w.method}</td><td>{w.status}</td><td>{new Date(w.requested_at).toLocaleString()}</td></tr>)}</tbody></table></div>}</section></main>;
}