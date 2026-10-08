import { createClient } from "@/lib/supabase/server";

export async function EvidenceList({submissionId}:{submissionId:string}){
 const s=await createClient();
 const {data:evidence}=await s.from("task_evidence").select("id,evidence_type,file_path,file_name,mime_type,file_size,text_value,external_url,reference_value,created_at").eq("submission_id",submissionId).order("created_at");
 if(!evidence?.length) return <div className="notice">No evidence attached.</div>;
 const items=await Promise.all(evidence.map(async e=>{
  let url:string|null=null;
  if(e.file_path){const {data}=await s.storage.from("task-evidence").createSignedUrl(e.file_path,300);url=data?.signedUrl||null;}
  return {...e,url};
 }));
 return <div className="evidence-list">{items.map(e=><article className="card" key={e.id}><strong>{e.evidence_type}</strong><p>{e.file_name||e.text_value||e.reference_value||"External evidence"}</p>{e.url&&<a className="button" href={e.url} target="_blank" rel="noreferrer">Open securely</a>}{e.external_url&&<a className="button" href={e.external_url} target="_blank" rel="noreferrer">Open reference</a>}</article>)}</div>;
}