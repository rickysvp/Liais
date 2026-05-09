import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

import { onboardingRouter } from "./routes/onboarding.js";
import { aiRouter } from "./routes/ai.js";
import { systemRouter } from "./routes/system.js";
import { profileRouter } from "./routes/profile.js";
import { inboxRouter } from "./routes/inbox.js";
import { chatRouter } from "./routes/chat.js";
import { billingRouter, billingWebhookRouter } from "./routes/billing.js";
import { generalLimiter } from "./lib/rateLimiter.js";

export function createApp() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  const allowedOrigin = process.env.FRONTEND_URL || process.env.APP_URL || (isProduction ? undefined : "*");

  app.use(helmet({
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.SUPABASE_URL || "", "https://api.stripe.com"].filter(Boolean),
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      },
    } : false,
  }));

  app.use(cors({ origin: allowedOrigin }));

  app.use(generalLimiter);
  app.use("/api/billing/webhook", express.raw({ type: "application/json" }), billingWebhookRouter);
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", onboardingRouter);
  app.use("/api", aiRouter);
  app.use("/api", systemRouter);
  app.use("/api", profileRouter);
  app.use("/api", inboxRouter);
  app.use("/api", billingRouter);
  app.use("/api/chat", chatRouter);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("[Global Error]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  });

  return app;
}
