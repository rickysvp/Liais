import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { Request } from "express";

let supabaseAuthClient: ReturnType<typeof createClient> | null = null;

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
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
        realtime: {
          transport: ws as any,
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return supabaseAuthClient;
}

export async function getAuthenticatedUser(req: Request): Promise<{ id: string; email: string | null } | null> {
  const bearerToken = getBearerToken(req);
  const supabase = getSupabaseAuthClient();

  if (bearerToken && supabase) {
    const { data, error } = await supabase.auth.getUser(bearerToken);
    if (error || !data.user?.id) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  }

  return null;
}

export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const user = await getAuthenticatedUser(req);
  return user?.id ?? null;
}
