import { Request, Response, NextFunction } from "express";
import { prisma } from "./db";
import { getAuthenticatedUser } from "./session";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string | null;
      profileId?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch (error: any) {
    console.error("[Auth Middleware Error]", error?.message || error);
    res.status(503).json({ error: "Authentication service unavailable" });
  }
}

export async function profileMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
      include: { boundaries: true }
    });

    if (!profile) {
      res.status(404).json({ error: "Profile not found. Complete onboarding first." });
      return;
    }

    req.profileId = profile.id;
    next();
  } catch (error: any) {
    console.error("[Profile Middleware Error]", error?.message || error);
    res.status(503).json({ error: "Profile service unavailable" });
  }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}
