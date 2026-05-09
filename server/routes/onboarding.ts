import { Router } from "express";
import { prisma } from "../lib/db.js";
import { onboardingDraftSchema } from "../schemas.js";

export const onboardingRouter = Router();

onboardingRouter.post("/onboarding/draft", async (req, res) => {
  try {
    const parsed = onboardingDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const { sessionId, step, payload } = parsed.data;
    const draft = await prisma.onboardingDraft.create({
      data: {
        sessionId,
        step,
        payload: JSON.stringify(payload),
      },
    });
    res.json(draft);
  } catch (e: any) {
    console.error("[Onboarding Draft Error]", e.message);
    res.status(500).json({ error: "Failed to save draft" });
  }
});
