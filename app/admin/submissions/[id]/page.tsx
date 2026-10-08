import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewActions } from "./review-actions";

export default async function ReviewPage({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 const s=await createClient();
 const {data:submission}=await s.from("task_submissions").select("id,submission_number,status,comment,submitted_at,assignment_id,task_assignments!inner(status,user_id,tasks!inner(title,task_code,reward_amount,currency))").eq("id",id).maybeSingle();
 if(!submission) notFound();
 return <main className="shell"><Link href="/admin/submissions" className="button">← Queue</Link><section className="card task-detail">
 <span className="eyebrow">SUBMISSION #{submission.submission_number} · {submission.status}</span>
 <h1>{submission.task_assignments.tasks.title}</h1>
 <p>Task: {submission.task_assignments.tasks.task_code} · Reward: {submission.task_assignments.tasks.currency} {Number(submission.task_assignments.tasks.reward_amount).toLocaleString()}</p>
 <p>Worker ID: {submission.task_assignments.user_id}</p>
 <h2>Worker statement</h2><div className="notice">{submission.comment||"No statement supplied."}</div>
 <p>Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
 {["PENDING","UNDER_REVIEW","MORE_INFORMATION_REQUIRED"].includes(submission.status) ? <><h2>Review</h2><ReviewActions submissionId={id}/></> : <div className="notice">This submission has already been finalized.</div>}
 </section></main>;
}