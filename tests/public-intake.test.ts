import { describe, expect, it, vi } from "vitest";
import request from "supertest";

import { createApp } from "../server/app";

vi.mock("../server/lib/ai", () => ({
  ai: { models: { generateContent: vi.fn() } },
  isAIConfigured: vi.fn().mockReturnValue(false),
}));

vi.mock("../server/lib/db", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn().mockResolvedValue({
        id: "profile-1",
        userId: "user-1",
        slug: "ricky",
        displayName: "Ricky",
        headline: "Builder",
        generatedIntro: "I build useful things.",
        generatedWelcomeMessage: "Tell me why you want to connect.",
        generatedContactScopeText: "Partnerships and focused intros.",
        linkedinUrl: "https://linkedin.com/in/ricky",
        twitterUrl: null,
        websiteUrl: "https://example.com",
        isPublished: true,
      }),
    },
    subscription: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    usageLedger: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { creditsDelta: 0 } }),
    },
    visitorConversation: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "conv-1", ...data })),
    },
  },
}));

describe("public profile and intake", () => {
  it("does not expose internal profile ownership fields publicly", async () => {
    const app = createApp();

    const res = await request(app).get("/api/p/ricky");

    expect(res.status).toBe(200);
    expect(res.body.displayName).toBe("Ricky");
    expect(res.body).not.toHaveProperty("id");
    expect(res.body).not.toHaveProperty("userId");
  });

  it("accepts public intake by slug without exposing profileId in the URL", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/p/ricky/intake")
      .send({
        visitorName: "Partner",
        visitorReason: "I have a relevant distribution partnership idea.",
        contactInfo: "partner@example.com",
        consentToContact: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.profileId).toBe("profile-1");
  });

  it("rejects public intake without contact consent", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/p/ricky/intake")
      .send({
        visitorName: "Partner",
        visitorReason: "I have a relevant distribution partnership idea.",
        contactInfo: "partner@example.com",
        consentToContact: false,
      });

    expect(res.status).toBe(400);
  });
});
