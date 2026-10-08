# Review and Reward Contract

Administrator review is one atomic database action.

APPROVE:
1. Lock submission and assignment.
2. Validate state.
3. Mark submission approved.
4. Mark assignment rewarded/completed.
5. Create the worker wallet if needed.
6. Insert exactly one TASK_REWARD ledger entry using assignment identity as the idempotent reference.
7. Append approval/reward events.

REJECT:
- Submission becomes REJECTED.
- Assignment becomes REJECTED.
- Reason is retained.

MORE_PROOF_REQUIRED:
- Submission becomes MORE_INFORMATION_REQUIRED.
- Assignment becomes MORE_PROOF_REQUIRED.
- Worker may submit another numbered submission.

The ledger is append-only. Balance is derived from posted credits/debits, never stored as a mutable user balance.