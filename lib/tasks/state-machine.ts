export type AssignmentStatus =
  | "ASSIGNED" | "CLAIMED" | "IN_PROGRESS" | "SUBMITTED" | "UNDER_REVIEW"
  | "MORE_PROOF_REQUIRED" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED" | "REWARDED";

const transitions: Record<AssignmentStatus, AssignmentStatus[]> = {
  ASSIGNED: ["CLAIMED", "EXPIRED"],
  CLAIMED: ["IN_PROGRESS", "EXPIRED"],
  IN_PROGRESS: ["SUBMITTED", "EXPIRED"],
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "MORE_PROOF_REQUIRED"],
  MORE_PROOF_REQUIRED: ["SUBMITTED"],
  APPROVED: ["REWARDED"],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
  REWARDED: [],
};

export function canTransition(from: AssignmentStatus, to: AssignmentStatus) {
  return transitions[from]?.includes(to) ?? false;
}

export function assertTransition(from: AssignmentStatus, to: AssignmentStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`INVALID_STATE_TRANSITION: ${from} -> ${to}`);
  }
}