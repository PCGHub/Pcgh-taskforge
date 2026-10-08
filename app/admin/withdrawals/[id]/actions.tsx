"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

export function WithdrawalActions({withdrawalId,status}:{withdrawalId:string,status:string}){
 const [note,setNote]=useState("");const[busy,setBusy]=useState(false);const[error,setError]=useState("");const router=useRouter();
 async function act(decision:string){setBusy(true);setError("");const {error}=await createClient().rpc("admin_update_withdrawal",{p_withdrawal_id:withdrawalId,p_decision:decision,p_note:note||null});if(error){setError(error.message);setBusy(false);return;}router.push("/admin/withdrawals");}
 return <div className="form"><label>Admin note<textarea value={note} onChange={e=>setNote(e.target.value)} rows={4}/></label><div className="actions">{status==="REQUESTED"&&<><button className="button" disabled={busy} onClick={()=>act("UNDER_REVIEW")}>Under review</button><button className="button" disabled={busy} onClick={()=>act("REJECT")}>Reject</button></>}{["UNDER_REVIEW","APPROVED"].includes(status)&&<button className="button primary" disabled={busy} onClick={()=>act(status==="UNDER_REVIEW"?"APPROVE":"PROCESS")}>{status==="UNDER_REVIEW"?"Approve":"Start processing"}</button>}{status==="PROCESSING"&&<button className="button primary" disabled={busy} onClick={()=>act("PAID")}>Mark paid</button>}{["REQUESTED","UNDER_REVIEW","APPROVED","PROCESSING"].includes(status)&&<button className="button" disabled={busy} onClick={()=>act("FAIL")}>Mark failed / release funds</button>}</div>{error&&<p className="notice">{error}</p>}</div>;
}