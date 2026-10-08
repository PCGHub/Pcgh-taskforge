"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SubmitForm({assignmentId}:{assignmentId:string}){
 const [comment,setComment]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const router=useRouter();
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const {data,error}=await createClient().rpc("submit_task",{p_assignment_id:assignmentId,p_comment:comment||null});if(error){setError(error.message);setBusy(false);return;}router.push(`/worker/assignments/${assignmentId}?submitted=${data}`);}
 return <form className="form" onSubmit={submit}><h2>Submit proof</h2><p>Evidence upload is the next storage slice. For now, submit your completion statement so the lifecycle can be tested end-to-end.</p><textarea value={comment} onChange={e=>setComment(e.target.value)} required placeholder="Explain what you completed and how it can be verified." rows={6}/><button className="button primary" disabled={busy}>{busy?"Submitting…":"Submit for review"}</button>{error&&<p className="notice">{error}</p>}</form>;
}