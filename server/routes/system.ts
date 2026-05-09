import { Router } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/db";
import { authMiddleware } from "../lib/auth";

export const systemRouter = Router();

systemRouter.get("/version", (req, res) => {
  try {
    let pkgPath = path.join(__dirname, "..", "..", "package.json");
    if (!fs.existsSync(pkgPath)) {
      pkgPath = path.join(__dirname, "..", "..", "..", "package.json");
    }
    const pkgContent = fs.readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(pkgContent);
    res.json({ version: pkg.version });
  } catch (e: any) {
    console.error("[Version Error]", e.message);
    res.status(500).json({ error: "Could not read version" });
  }
});

systemRouter.get("/me/credits", authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const sub = await prisma.subscription.findFirst({ where: { userId: req.userId } });
    const monthlyCredits = sub?.monthlyCredits || 10;

    const ledger = await prisma.usageLedger.findMany({ where: { userId: req.userId } });
    const used = ledger.reduce((acc, l) => acc + l.creditsDelta, 0);

    res.json({ credits: monthlyCredits + used, plan: sub?.planName || "Free" });
  } catch (e: any) {
    console.error("[Credits Error]", e.message);
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});
