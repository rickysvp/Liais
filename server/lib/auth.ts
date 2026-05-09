import { Request, Response, NextFunction } from "express";
import { prisma } from "./db";
import { getAuthenticatedUserId } from "./session";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      profileId?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = await getAuthenticatedUserId(req);

  if (!userId) {
    res.status(401).json({ error: "Authentication required. Provide x-user-id header." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  req.userId = userId;
  next();
}

export async function profileMiddleware(req: Request, res: Response, next: NextFunction) {
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
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"] as string;
  if (userId && process.env.NODE_ENV !== "production") {
    req.userId = userId;
  }
  next();
}
