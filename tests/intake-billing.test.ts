import { describe, expect, it, vi } from "vitest";
import request from "supertest";

import { createApp } from "../server/app";
import { ai } from "../server/lib/ai";

vi.mock("../server/lib/ai", () => ({
  ai: {
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          summaryText: "High-signal partnership request",
          qualificationLevel: "high fit",
          suggestedAction: "Review now",
        }),
      }),
    },
  },
  isAIConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock("../server/lib/db", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn().mockResolvedValue({
        id: "profile-1",
        userId: "user-1",
      }),
    },
    subscription: {
      findFirst: vi.fn().mockResolvedValue({
        status: "inactive",
        monthlyCredits: 0,
        purchasedCredits: 0,
      }),
    },
    usageLedger: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { creditsDelta: 0 } }),
      create: vi.fn().mockResolvedValue({}),
    },
    visitorConversation: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "conv-1", ...data })),
    },
  },
}));

describe("public intake billing gate", () => {
  it("does not call AI screening when the profile owner has no paid credits", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/intake/profile-1")
      .send({
        visitorName: "Buyer",
        visitorReason: "I want to discuss a partnership.",
        contactInfo: "buyer@example.com",
        consentToContact: true,
      });

    expect(res.status).toBe(200);
    expect(ai.models.generateContent).not.toHaveBeenCalled();
    expect(res.body.summaryText).toBe("AI screening requires an active plan or credits.");
  });
});
