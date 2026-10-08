import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">PCGH TASKFORGE · V1 FOUNDATION</span>
        <h1>Verified work, tracked from task to reward.</h1>
        <p>
          TaskForge is the foundation for a verified task-performance marketplace.
          Workers complete legitimate tasks, submit evidence, and earn only after review.
        </p>
        <div className="actions">
          <Link className="button primary" href="/login">Sign in</Link>
          <Link className="button" href="/worker">Worker dashboard</Link>
          <Link className="button" href="/admin">Admin command center</Link>
        </div>
      </section>
      <section className="grid">
        <article><strong>Track</strong><span>Assignment lifecycle and evidence.</span></article>
        <article><strong>Verify</strong><span>Human review before rewards.</span></article>
        <article><strong>Account</strong><span>Immutable wallet ledger and audit trail.</span></article>
      </section>
    </main>
  );
}