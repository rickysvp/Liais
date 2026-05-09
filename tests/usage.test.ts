import { describe, expect, it } from "vitest";

import {
  assertCanSpendCredits,
  getAvailableCredits,
  isPaidSubscriptionStatus,
} from "../server/lib/usage";

describe("usage credit policy", () => {
  it("treats active and trialing subscriptions as paid access", () => {
    expect(isPaidSubscriptionStatus("active")).toBe(true);
    expect(isPaidSubscriptionStatus("trialing")).toBe(true);
    expect(isPaidSubscriptionStatus("past_due")).toBe(false);
    expect(isPaidSubscriptionStatus(null)).toBe(false);
  });

  it("combines included, purchased, and ledger deltas into available credits", () => {
    const available = getAvailableCredits({
      monthlyIncludedCredits: 25,
      purchasedCredits: 10,
      ledgerCreditsDelta: -8,
    });

    expect(available).toBe(27);
  });

  it("allows spending when enough credits are available", () => {
    expect(() => assertCanSpendCredits(3, 2)).not.toThrow();
  });

  it("blocks spending before an AI call when credits are exhausted", () => {
    expect(() => assertCanSpendCredits(1, 2)).toThrow(/Insufficient AI credits/);
  });
});
