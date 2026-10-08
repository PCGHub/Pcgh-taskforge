import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminWithdrawals(){
 const s=await createClient();
 const {data:rows}=await s.from("withdrawals").select("id,withdrawal_code,user_id,amount,currency,method,destination_reference,status,requested_at").in("status",["REQUESTED","UNDER_REVIEW","APPROVED","PROCESSING"]).order("requested_at",{ascending:true});
 return <main className="shell"><header className="topbar"><div><span className="eyebrow">ADMIN FINANCE</span><h1>Withdrawal queue</h1></div><Link href="/admin" className="button">Command center</Link></header><section className="card">{!rows?.length?<p>No pending withdrawals.</p>:<div className="table-wrap"><table><thead><tr><th>Code</th><th>Worker</th><th>Amount</th><th>Method</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(w=><tr key={w.id}><td>{w.withdrawal_code}</td><td>{w.user_id}</td><td>{w.currency} {Number(w.amount).toLocaleString()}</td><td>{w.method}</td><td>{w.status}</td><td><Link className="button" href={"/admin/withdrawals/"+w.id}>Open</Link></td></tr>)}</tbody></table></div>}</section></main>;
}