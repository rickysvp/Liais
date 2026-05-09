import { describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "../server/app";

describe("app smoke routes", () => {
  it("serves the API version without starting a network listener", async () => {
    const app = createApp();

    const res = await request(app).get("/api/version");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("version");
  });
});
