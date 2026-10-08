import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ReviewPage({params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const s=await createClient();
 const {data:submission}=await s.from("task_submissions").select("id,submission_number,status,comment,submitted_at,assignment_id,task_assignments!inner(status,user_id,tasks!inner(title,task_code))").eq("id",id).maybeSingle();
 if(!submission) notFound();
 return <main className="shell"><Link href="/admin/submissions" className="button">← Queue</Link><section className="card task-detail"><span className="eyebrow">SUBMISSION #{submission.submission_number} · {submission.status}</span><h1>{submission.task_assignments.tasks.title}</h1><p>Task: {submission.task_assignments.tasks.task_code}</p><p>Worker ID: {submission.task_assignments.user_id}</p><h2>Worker statement</h2><div className="notice">{submission.comment}</div><p>Submitted: {new Date(submission.submitted_at).toLocaleString()}</p><h2>Review actions</h2><p>Approval/rejection/request-more-proof actions will be connected to the atomic review service in the next slice.</p></section></main>;
}