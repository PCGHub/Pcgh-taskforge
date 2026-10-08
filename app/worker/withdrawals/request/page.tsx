"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RequestWithdrawal(){
 const [amount,setAmount]=useState("");const [destination,setDestination]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const router=useRouter();
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const {data,error}=await createClient().rpc("request_withdrawal",{p_amount:Number(amount),p_currency:"NGN",p_method:"BANK_TRANSFER",p_destination_reference:destination,p_idempotency_key:crypto.randomUUID()});if(error){setError(error.message);setBusy(false);return;}router.push("/worker/withdrawals");}
 return <main className="center"><form className="card form" onSubmit={submit}><span className="eyebrow">TASKFORGE PAYOUT</span><h1>Request withdrawal</h1><p>Requested funds are reserved immediately and cannot be spent twice.</p><label>Amount (NGN)<input required type="number" min="1" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>Bank/account reference<input required value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Account number or approved payout reference"/></label><button className="button primary" disabled={busy}>{busy?"Submitting…":"Request withdrawal"}</button>{error&&<p className="notice">{error}</p>}</form></main>;
}