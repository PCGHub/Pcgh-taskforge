"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SITE_URL = "https://pcgh-taskforge.vercel.app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("Sending sign-in link…");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
    });
    setMessage(error ? error.message : "Check your email for the secure sign-in link.");
  }

  return (
    <main className="center">
      <form className="card form" onSubmit={submit}>
        <span className="eyebrow">TASKFORGE AUTH</span>
        <h1>Sign in</h1>
        <p>Use your email to receive a secure magic link.</p>
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <button className="button primary" type="submit">Send magic link</button>
        {message && <p className="notice">{message}</p>}
      </form>
    </main>
  );
}