import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "../../lib/tasks/state-machine";

describe("assignment state machine", () => {
  it("allows the normal worker path", () => {
    expect(canTransition("ASSIGNED","CLAIMED")).toBe(true);
    expect(canTransition("CLAIMED","IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS","SUBMITTED")).toBe(true);
    expect(canTransition("SUBMITTED","UNDER_REVIEW")).toBe(true);
    expect(canTransition("UNDER_REVIEW","APPROVED")).toBe(true);
    expect(canTransition("APPROVED","REWARDED")).toBe(true);
  });

  it("allows more-proof loops", () => {
    expect(canTransition("UNDER_REVIEW","MORE_PROOF_REQUIRED")).toBe(true);
    expect(canTransition("MORE_PROOF_REQUIRED","SUBMITTED")).toBe(true);
  });

  it("rejects arbitrary jumps", () => {
    expect(canTransition("IN_PROGRESS","APPROVED")).toBe(false);
    expect(() => assertTransition("IN_PROGRESS","APPROVED")).toThrow("INVALID_STATE_TRANSITION");
  });
});