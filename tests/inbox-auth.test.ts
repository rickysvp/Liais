import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { createApp } from "../server/app";
import { prisma } from "../server/lib/db";
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
      findUnique: vi.fn().mockResolvedValue({ id: "user-1", email: "owner@example.com" }),
    },
    profile: {
      findUnique: vi.fn().mockResolvedValue({ id: "profile-1", userId: "user-1", boundaries: [] }),
    },
    visitorConversation: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

describe("owner inbox authorization", () => {
  beforeEach(() => {
    getUser.mockReset();
    getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "owner@example.com" } }, error: null });
  });

  it("requires authentication to list owner inbox conversations", async () => {
    const app = createApp();

    const res = await request(app).get("/api/inbox");

    expect(res.status).toBe(401);
  });

  it("scopes inbox list queries to the authenticated owner profile", async () => {
    const app = createApp();

    const res = await request(app)
      .get("/api/inbox")
      .set("Authorization", "Bearer token-1");

    expect(res.status).toBe(200);
    expect(prisma.visitorConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { profileId: "profile-1" },
      })
    );
    expect(prisma.visitorConversation.count).toHaveBeenCalledWith({
      where: { profileId: "profile-1" },
    });
  });

  it("requires authentication before updating inbox status", async () => {
    const app = createApp();

    const res = await request(app)
      .put("/api/inbox/conversation-1/status")
      .send({ status: "Monitor later" });

    expect(res.status).toBe(401);
  });
});
