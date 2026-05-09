export type CreditBalanceInput = {
  monthlyIncludedCredits: number | null | undefined;
  purchasedCredits: number | null | undefined;
  ledgerCreditsDelta: number | null | undefined;
};

const PAID_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function isPaidSubscriptionStatus(status: string | null | undefined): boolean {
  return !!status && PAID_SUBSCRIPTION_STATUSES.has(status);
}

export function getAvailableCredits(input: CreditBalanceInput): number {
  return (
    (input.monthlyIncludedCredits ?? 0) +
    (input.purchasedCredits ?? 0) +
    (input.ledgerCreditsDelta ?? 0)
  );
}

export function assertCanSpendCredits(availableCredits: number, requiredCredits: number): void {
  if (availableCredits < requiredCredits) {
    throw new Error(
      `Insufficient AI credits: ${requiredCredits} required, ${availableCredits} available`
    );
  }
}
