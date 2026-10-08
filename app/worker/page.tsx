import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function WorkerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="shell">
      <header className="topbar"><div><span className="eyebrow">TASKFORGE</span><h1>Worker dashboard</h1></div><Link href="/" className="button">Home</Link></header>
      <section className="grid stats">
        <article><span>Available tasks</span><strong>—</strong></article>
        <article><span>Active tasks</span><strong>—</strong></article>
        <article><span>Pending review</span><strong>—</strong></article>
        <article><span>Available earnings</span><strong>₦—</strong></article>
      </section>
      <section className="card">
        <h2>{user ? "Account connected" : "Authentication required"}</h2>
        <p>{user ? `Signed in as ${user.email}. Task data will appear here as the database layer is connected.` : "Sign in first to access worker data."}</p>
        {!user && <Link className="button primary" href="/login">Sign in</Link>}
      </section>
    </main>
  );
}