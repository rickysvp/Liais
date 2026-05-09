import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";

import { profileRouter } from "../server/routes/profile";

const app = express();
app.use(express.json());
app.use("/api", profileRouter);

vi.mock("../server/lib/db", () => ({
  prisma: {
    profile: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue({ id: "mock-id", displayName: "Mock User", userId: "user-1", boundaries: [] }),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "mock-id", ...data })),
    },
    profileBoundary: {
      deleteMany: vi.fn().mockResolvedValue({}),
      createMany: vi.fn().mockResolvedValue({})
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: "user-1", email: "test@example.com" })
    }
  }
}));

describe("Profile API Endpoints", () => {
  describe("PUT /api/me/profile", () => {
    it("should return 401 without authentication", async () => {
      const res = await request(app)
        .put("/api/me/profile")
        .send({
          displayName: "Valid Name",
          boundaries: [{ value: "Don't share", visibilityType: "restricted" }]
        });
      
      expect(res.status).toBe(401);
    });

    it("should return 400 for invalid boundary visibilityType", async () => {
      const res = await request(app)
        .put("/api/me/profile")
        .set("x-user-id", "user-1")
        .send({
          displayName: "Valid Name",
          boundaries: [{ value: "Don't share", visibilityType: 123 }]
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid payload");
    });

    it("should return 200 for valid payload with auth", async () => {
      const res = await request(app)
        .put("/api/me/profile")
        .set("x-user-id", "user-1")
        .send({
          displayName: "Updated Name",
          boundaries: [{ value: "Don't share secrets", visibilityType: "restricted" }]
        });
      
      expect(res.status).toBe(200);
      expect(res.body.displayName).toBe("Updated Name");
    });
  });

  describe("POST /api/profile/publish", () => {
    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/profile/publish")
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid payload");
    });
  });
});
