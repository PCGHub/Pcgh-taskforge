# Task Lifecycle API Contract

The first vertical slice follows:

PUBLISHED → ASSIGNED/CLAIMED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED/MORE_PROOF_REQUIRED → REWARDED.

The database owns persistence; service-layer actions own transitions.

Worker actions:
- list published tasks
- view task requirements
- claim an available task
- start a claimed task
- submit proof
- resubmit after more proof is requested

Admin actions:
- create/publish/pause task
- assign workers
- inspect submissions
- approve/reject/request more proof

No client-side state mutation is trusted. Approval and rewards will be implemented in an atomic service transaction in the next money slice.