import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function WalletPage(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
 if(!user) return <main className="center"><div className="card"><h1>Sign in required</h1><Link className="button primary" href="/login">Sign in</Link></div></main>;
 const {data:app}=await s.from("users").select("id").eq("auth_user_id",user.id).maybeSingle();
 if(!app) return <main className="shell"><div className="card"><p>Your TaskForge account is still being provisioned.</p></div></main>;
 const {data:tx}=await s.from("wallet_transactions").select("id,transaction_type,direction,amount,currency,status,description,created_at").eq("user_id",app.id).order("created_at",{ascending:false}).limit(50);
 const balance=(tx||[]).filter(x=>x.status==="POSTED").reduce((n,x)=>n+(x.direction==="CREDIT"?Number(x.amount):-Number(x.amount)),0);
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">WORKER WALLET</span><h1>Earnings</h1></div><Link href="/worker" className="button">Dashboard</Link></header>
 <section className="grid stats"><article><span>Available balance</span><strong>₦{balance.toLocaleString()}</strong></article><article><span>Transactions</span><strong>{tx?.length||0}</strong></article><article><span>Status</span><strong>ACTIVE</strong></article><article><span>Withdrawals</span><strong>—</strong></article></section>
 <section className="card"><h2>Ledger</h2>{!tx?.length?<p>No wallet transactions yet. Approved task rewards will appear here.</p>:<div className="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Direction</th><th>Amount</th><th>Description</th></tr></thead><tbody>{tx.map(x=><tr key={x.id}><td>{new Date(x.created_at).toLocaleString()}</td><td>{x.transaction_type}</td><td>{x.direction}</td><td>{x.currency} {Number(x.amount).toLocaleString()}</td><td>{x.description}</td></tr>)}</tbody></table></div>}</section></main>;
}