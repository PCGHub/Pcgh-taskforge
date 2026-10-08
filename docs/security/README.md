# Security Foundation

- Supabase Auth owns authentication.
- Application roles live in public.users/public.roles.
- RLS is defense in depth; server-side authorization is mandatory.
- Workers must never approve submissions, reward themselves, alter task rewards, or process withdrawals.
- Evidence belongs in private storage and should use short-lived signed URLs.
- Money operations require atomic database transactions and idempotency keys.
- Audit logs are append-only.
- Never expose a Supabase service-role key to the browser.
- Risky or policy-violating task categories require compliance review before publication.
