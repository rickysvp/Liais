import { createClient } from "@supabase/supabase-js";
import type { Request } from "express";

let supabaseAuthClient: ReturnType<typeof createClient> | null = null;

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

function canUseDemoHeaderFallback(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_AUTH === "true";
}

function getSupabaseAuthClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  if (!supabaseAuthClient) {
    supabaseAuthClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return supabaseAuthClient;
}

export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const bearerToken = getBearerToken(req);
  const supabase = getSupabaseAuthClient();

  if (bearerToken && supabase) {
    const { data, error } = await supabase.auth.getUser(bearerToken);
    if (error || !data.user?.id) return null;
    return data.user.id;
  }

  const demoUserId = req.headers["x-user-id"];
  if (typeof demoUserId === "string" && canUseDemoHeaderFallback()) {
    return demoUserId;
  }

  return null;
}
