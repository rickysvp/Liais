import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import fs from "fs";
import helmet from "helmet";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { onboardingRouter } from "./server/routes/onboarding";
import { aiRouter } from "./server/routes/ai";
import { systemRouter } from "./server/routes/system";
import { profileRouter } from "./server/routes/profile";
import { inboxRouter } from "./server/routes/inbox";
import { chatRouter } from "./server/routes/chat";
import { generalLimiter } from "./server/lib/rateLimiter";
import { prisma } from "./server/lib/db";

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  const allowedOrigin = process.env.FRONTEND_URL || "*";
  app.use(cors({ origin: allowedOrigin }));

  app.use(generalLimiter);
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", onboardingRouter);
  app.use("/api", aiRouter);
  app.use("/api", systemRouter);
  app.use("/api", profileRouter);
  app.use("/api", inboxRouter);
  app.use("/api", chatRouter);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const distPath = path.join(__dirname, "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.get("*", (req, res) => {
      res.json({ message: "API is running. Frontend is not built yet." });
    });
  }

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("[Global Error]", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Closing server gracefully...`);
    server.close(async () => {
      console.log("HTTP server closed.");
      await prisma.$disconnect();
      console.log("Database connection closed.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Forcing shutdown after 10s timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
