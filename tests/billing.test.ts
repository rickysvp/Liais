import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { createApp } from "../server/app";
const getUser = vi.fn();
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser },
  })),
}));

vi.mock("../server/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: "user-1", email: "test@example.com" }),
    },
    subscription: {
      findFirst: vi.fn().mockResolvedValue({
        planName: "Starter",
        status: "active",
        monthlyCredits: 50,
        purchasedCredits: 10,
        currentPeriodEnd: new Date("2026-06-01T00:00:00.000Z"),
      }),
    },
    usageLedger: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { creditsDelta: -12 } }),
    },
  },
}));

describe("Billing API", () => {
  beforeEach(() => {
    getUser.mockReset();
    getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "test@example.com" } }, error: null });
  });

  it("requires authentication before creating a checkout session", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/billing/checkout-session")
      .send({ priceLookupKey: "starter_monthly" });

    expect(res.status).toBe(401);
  });

  it("returns a configuration error when Stripe is not configured", async () => {
    const originalSecret = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    const app = createApp();

    const res = await request(app)
      .post("/api/billing/checkout-session")
      .set("Authorization", "Bearer token-1")
      .send({ priceLookupKey: "starter_monthly" });

    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/Stripe is not configured/);
    process.env.STRIPE_SECRET_KEY = originalSecret;
  });

  it("returns authenticated billing and usage summary", async () => {
    const app = createApp();

    const res = await request(app)
      .get("/api/billing/summary")
      .set("Authorization", "Bearer token-1");

    expect(res.status).toBe(200);
    expect(res.body.planName).toBe("Starter");
    expect(res.body.status).toBe("active");
    expect(res.body.monthlyCredits).toBe(50);
    expect(res.body.purchasedCredits).toBe(10);
    expect(res.body.availableCredits).toBe(38);
  });
});
