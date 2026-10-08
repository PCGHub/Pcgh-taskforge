import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="shell">
      <header className="topbar"><div><span className="eyebrow">TASKFORGE CONTROL</span><h1>Command center</h1></div><Link href="/" className="button">Home</Link></header>
      <section className="grid stats">
        <article><span>Workers</span><strong>—</strong></article>
        <article><span>Published tasks</span><strong>—</strong></article>
        <article><span>Pending submissions</span><strong>—</strong></article>
        <article><span>Pending withdrawals</span><strong>₦—</strong></article>
      </section>
      <section className="grid">
        <article className="card"><h2>Submission queue</h2><p>Review, approve, reject, or request more proof.</p></article>
        <article className="card"><h2>User 360</h2><p>Open any worker to reconstruct tasks, evidence, earnings, and activity.</p></article>
        <article className="card"><h2>Audit trail</h2><p>Every privileged state and money operation will be traceable.</p></article>
      </section>
    </main>
  );
}