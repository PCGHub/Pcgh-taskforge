"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ReviewActions({submissionId}:{submissionId:string}){
 const [comment,setComment]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const router=useRouter();
 async function review(decision:"APPROVE"|"REJECT"|"MORE_PROOF_REQUIRED"){
  setBusy(true);setError("");
  const {error}=await createClient().rpc("review_submission",{p_submission_id:submissionId,p_decision:decision,p_comment:comment||null});
  if(error){setError(error.message);setBusy(false);return;}
  router.push("/admin/submissions");
 }
 return <form className="form" onSubmit={(e:FormEvent)=>e.preventDefault()}>
  <label>Review note<textarea value={comment} onChange={e=>setComment(e.target.value)} rows={5} placeholder="Explain your decision for the audit trail." /></label>
  <div className="actions">
   <button className="button primary" disabled={busy} onClick={()=>review("APPROVE")}>Approve & reward</button>
   <button className="button" disabled={busy} onClick={()=>review("MORE_PROOF_REQUIRED")}>Request more proof</button>
   <button className="button" disabled={busy} onClick={()=>review("REJECT")}>Reject</button>
  </div>
  {error&&<p className="notice">{error}</p>}
 </form>;
}