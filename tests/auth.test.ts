import { describe, expect, it, vi } from "vitest";
import type { Request } from "express";

import { getAuthenticatedUserId } from "../server/lib/session";

const getUser = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser },
  })),
}));

function req(headers: Record<string, string | undefined>): Request {
  return { headers } as unknown as Request;
}

describe("session authentication", () => {
  it("verifies Supabase bearer tokens when configured", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    getUser.mockResolvedValueOnce({ data: { user: { id: "supabase-user-1" } }, error: null });

    await expect(getAuthenticatedUserId(req({ authorization: "Bearer token-1" }))).resolves.toBe("supabase-user-1");
    expect(getUser).toHaveBeenCalledWith("token-1");
  });

  it("rejects authentication without a valid bearer token", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(getAuthenticatedUserId(req({ "x-user-id": "demo-user" }))).resolves.toBeNull();
  });
});
