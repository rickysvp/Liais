import { describe, expect, it, vi } from "vitest";

import {
  fulfillCheckoutSession,
  fulfillSubscriptionChange,
  getCreditPackCredits,
  getMonthlyCreditsForPrice,
  processStripeEventOnce,
} from "../server/lib/billingFulfillment";

function createPrismaMock() {
  return {
    stripeWebhookEvent: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
    subscription: {
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({}),
    },
    usageLedger: {
      create: vi.fn().mockResolvedValue({}),
    },
  };
}

describe("Stripe billing fulfillment", () => {
  it("maps configured subscription prices to monthly AI credits", () => {
    process.env.STRIPE_PRICE_STARTER_MONTHLY = "price_starter";
    process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro";

    expect(getMonthlyCreditsForPrice("price_starter")).toBe(50);
    expect(getMonthlyCreditsForPrice("price_pro")).toBe(250);
    expect(getMonthlyCreditsForPrice("price_unknown")).toBe(0);
  });

  it("maps credit pack prices to purchased credits", () => {
    process.env.STRIPE_PRICE_CREDIT_PACK_SMALL = "price_small";
    process.env.STRIPE_PRICE_CREDIT_PACK_MEDIUM = "price_medium";

    expect(getCreditPackCredits("price_small")).toBe(25);
    expect(getCreditPackCredits("price_medium")).toBe(100);
    expect(getCreditPackCredits("price_unknown")).toBe(0);
  });

  it("credits a one-time credit pack checkout once", async () => {
    const prisma = createPrismaMock();

    await fulfillCheckoutSession(prisma as any, {
      id: "cs_1",
      mode: "payment",
      client_reference_id: "user-1",
      metadata: { priceLookupKey: "credit_pack_small" },
      line_items: {
        data: [{ price: { id: "price_small" } }],
      },
    } as any);

    expect(prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: { purchasedCredits: { increment: 25 } },
      })
    );
    expect(prisma.usageLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          actionType: "Stripe Credit Pack Purchase",
          creditsDelta: 25,
        }),
      })
    );
  });

  it("upserts subscription status and included credits", async () => {
    const prisma = createPrismaMock();

    await fulfillSubscriptionChange(prisma as any, {
      id: "sub_1",
      customer: "cus_1",
      status: "active",
      cancel_at_period_end: false,
      current_period_start: 1760000000,
      current_period_end: 1762592000,
      metadata: { userId: "user-1" },
      items: {
        data: [{ price: { id: "price_pro" } }],
      },
    } as any);

    expect(prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeSubscriptionId: "sub_1" },
        update: expect.objectContaining({
          status: "active",
          monthlyCredits: 250,
          stripePriceId: "price_pro",
        }),
      })
    );
  });

  it("skips duplicate Stripe webhook events", async () => {
    const prisma = createPrismaMock();
    prisma.stripeWebhookEvent.findUnique.mockResolvedValueOnce({ id: "evt_1" });
    const handler = vi.fn();

    await processStripeEventOnce(prisma as any, { id: "evt_1", type: "checkout.session.completed" } as any, handler);

    expect(handler).not.toHaveBeenCalled();
    expect(prisma.stripeWebhookEvent.create).not.toHaveBeenCalled();
  });
});
