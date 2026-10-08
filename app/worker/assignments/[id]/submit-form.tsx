"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateEvidenceFile } from "@/lib/evidence";

export function SubmitForm({assignmentId}:{assignmentId:string}){
 const [comment,setComment]=useState(""); const [file,setFile]=useState<File|null>(null); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const router=useRouter();
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError("");
  try{
   if(file) validateEvidenceFile(file);
   const supabase=createClient();
   const {data:submission,error:submitError}=await supabase.rpc("submit_task",{p_assignment_id:assignmentId,p_comment:comment||null});
   if(submitError) throw submitError;
   if(file){
    const {data:{user}}=await supabase.auth.getUser(); if(!user) throw new Error("UNAUTHORIZED");
    const {data:app}=await supabase.from("users").select("id").eq("auth_user_id",user.id).single(); if(!app) throw new Error("ACCOUNT_NOT_READY");
    const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const path="task-evidence/"+app.id+"/"+assignmentId+"/"+submission+"/"+crypto.randomUUID()+"-"+safe;
    const {error:uploadError}=await supabase.storage.from("task-evidence").upload(path,file,{contentType:file.type,upsert:false});
    if(uploadError) throw uploadError;
    const type=file.type.startsWith("image/")?"SCREENSHOT":file.type.startsWith("video/")?"VIDEO":file.type==="application/pdf"?"DOCUMENT":"TEXT";
    const {error:evidenceError}=await supabase.rpc("create_evidence_record",{p_submission_id:submission,p_evidence_type:type,p_file_path:path,p_file_name:file.name,p_mime_type:file.type,p_file_size:file.size});
    if(evidenceError) throw evidenceError;
   }
   router.push("/worker/assignments/"+assignmentId+"?submitted=1");
  }catch(err:any){setError(err?.message||"Unable to submit");setBusy(false);}
 }
 return <form className="form" onSubmit={submit}><h2>Submit proof</h2><p>Upload evidence required by the task. Files are private and only exposed through authorized review.</p><label>Completion statement<textarea value={comment} onChange={e=>setComment(e.target.value)} required placeholder="Explain what you completed and how it can be verified." rows={5}/></label><label>Evidence file<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf,text/plain" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>{file&&<p className="notice">{file.name} · {(file.size/1024/1024).toFixed(2)} MB</p>}<button className="button primary" disabled={busy}>{busy?"Submitting…":"Submit for review"}</button>{error&&<p className="notice">{error}</p>}</form>;
}