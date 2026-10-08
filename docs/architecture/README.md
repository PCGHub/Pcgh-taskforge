# TaskForge Architecture

TaskForge is a verified task-performance platform.

V1 is intentionally manual: task creation → assignment → worker performance → evidence submission → admin review → reward ledger → withdrawal.

Architectural rule: the server is authoritative. UI controls never directly mutate protected state.

Core modules:
- Auth / RBAC
- Users / Profiles
- Tasks / Requirements
- Assignments / State machine
- Submissions / Evidence
- Events / Audit
- Wallet / Ledger
- Withdrawals
- Notifications

Evolution path:
V1 manual verification → V2 tracking/automation → V3 fraud/trust intelligence → V4 client campaigns → V5 workforce infrastructure.

Financial rule: wallet balance is derived from an append-only ledger. Withdrawal funds are reserved atomically before processing.