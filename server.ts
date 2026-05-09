import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import process from "process";
import fs from "fs";
import "dotenv/config";
import { fileURLToPath } from 'url';
import { prisma } from "./server/lib/db.js";
import { createApp } from "./server/app.js";
import { validateRuntimeEnvOrThrow } from "./server/lib/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  validateRuntimeEnvOrThrow();
  const app = createApp();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // === VITE / STATIC SERVING ===
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "..", "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Closing server gracefully...`);
    server.close(async () => {
      console.log("HTTP server closed.");
      await prisma.$disconnect();
      console.log("Database connection closed.");
      process.exit(0);
    });
    
    // Fallback timeout
    setTimeout(() => {
      console.error("Forcing shutdown after 10s timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
