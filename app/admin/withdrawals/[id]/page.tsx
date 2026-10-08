import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WithdrawalActions } from "./actions";

export default async function WithdrawalReview({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const s=await createClient();const {data:w}=await s.from("withdrawals").select("id,withdrawal_code,user_id,amount,currency,method,destination_reference,status,requested_at,processed_at,failure_reason,admin_note").eq("id",id).maybeSingle();
 if(!w)notFound();
 return <main className="shell"><Link href="/admin/withdrawals" className="button">← Queue</Link><section className="card task-detail"><span className="eyebrow">{w.withdrawal_code} · {w.status}</span><h1>{w.currency} {Number(w.amount).toLocaleString()}</h1><p>Worker: {w.user_id}</p><p>Method: {w.method}</p><p>Destination reference: {w.destination_reference}</p><p>Requested: {new Date(w.requested_at).toLocaleString()}</p>{w.failure_reason&&<div className="notice">{w.failure_reason}</div>}<h2>Processing</h2><WithdrawalActions withdrawalId={id} status={w.status}/></section></main>;
}