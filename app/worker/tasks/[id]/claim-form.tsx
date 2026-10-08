"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ClaimForm({taskId}:{taskId:string}) {
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const router=useRouter();
  async function claim(){
    setBusy(true); setError("");
    const {data,error}=await createClient().rpc("claim_task",{p_task_id:taskId});
    if(error){setError(error.message);setBusy(false);return;}
    router.push(`/worker/assignments/${data}`);
  }
  return <div>
    <button className="button primary" disabled={busy} onClick={claim}>{busy?"Claiming…":"Claim task"}</button>
    {error && <p className="notice">{error}</p>}
  </div>;
}