# TaskForge test strategy

Unit tests protect deterministic domain rules such as assignment transitions and reward calculations.

Integration tests will exercise Supabase functions, RLS, and service transactions.

E2E tests will eventually execute the complete money-safe path:
claim → start → submit evidence → review → approve → ledger reward → withdrawal reservation → payment.