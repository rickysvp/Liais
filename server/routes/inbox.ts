import { Router } from "express";
import { prisma } from "../lib/db.js";
import { generateJsonObject, isAIConfigured } from "../lib/ai.js";
import { visitorIntakeSchema } from "../schemas.js";
import { buildPromptSection } from "../lib/promptSanitizer.js";
import { getAvailableCredits, isPaidSubscriptionStatus } from "../lib/usage.js";
import { authMiddleware, profileMiddleware } from "../lib/auth.js";
import type { Profile } from "@prisma/client";
import { parseScreeningOutput } from "../lib/aiSchemas.js";

export const inboxRouter = Router();

const VALID_STATUSES = ["new", "Waiting on you", "Ready to send", "Waiting on them", "Monitor later", "replied", "ignored", "Archived by AI"] as const;
const AI_SCREENING_CREDIT_COST = 2;

async function createVisitorConversation(profile: Pick<Profile, "id" | "userId">, data: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId: profile.userId },
    orderBy: { updatedAt: "desc" },
  });
  const ledger = await prisma.usageLedger.aggregate({
    where: { userId: profile.userId },
    _sum: { creditsDelta: true },
  });

  const hasPaidPlan =
    !!subscription &&
    subscription.planName !== "Free" &&
    isPaidSubscriptionStatus(subscription.status);
  const availableCredits = getAvailableCredits({
    monthlyIncludedCredits: hasPaidPlan ? subscription?.monthlyCredits : 0,
    purchasedCredits: 0,
    ledgerCreditsDelta: ledger._sum.creditsDelta ?? 0,
  });
  const canRunAiScreening =
    isAIConfigured() &&
    availableCredits >= AI_SCREENING_CREDIT_COST &&
    (hasPaidPlan || availableCredits >= AI_SCREENING_CREDIT_COST);

  let aiScreeningUsed = false;
  let summaryText = canRunAiScreening
    ? "Summary pending"
    : "AI screening requires an active plan or credits.";
  let qualificationLevel = "unclear";
  let suggestedAction = canRunAiScreening ? "Review safely" : "Upgrade or add credits to enable AI screening.";

  if (canRunAiScreening) {
    try {
      const prompt = `Based on this inbound connection request, generate a structured summary.
${buildPromptSection("Request", data)}
Return JSON: {"summaryText": "...", "qualificationLevel": "high fit | possible fit | low fit | unclear", "suggestedAction": "..."}`;

      const text = await generateJsonObject([{ role: "user", content: prompt }]);
      if (text) {
        const aiParse = parseScreeningOutput(text);
        summaryText = aiParse.summaryText;
        qualificationLevel = aiParse.qualificationLevel;
        suggestedAction = aiParse.suggestedAction;
        aiScreeningUsed = true;
      }
    } catch (e: any) {
      console.error("[AI Intake Summary Error]", e.message);
    }
  }

  const conv = await prisma.visitorConversation.create({
    data: {
      profileId: profile.id,
      visitorName: data.visitorName || "",
      visitorCompany: data.visitorCompany || "",
      visitorBackground: data.visitorBackground || "",
      visitorReason: data.visitorReason || "",
      visitorIntentCategory: data.visitorIntentCategory || "",
      requestedNextStep: data.requestedNextStep || "",
      contactInfo: data.contactInfo || "",
      transcript: JSON.stringify(data.transcript || []),
      summaryText,
      qualificationLevel,
      suggestedAction,
      status: "new"
    }
  });

  if (aiScreeningUsed) {
    await prisma.usageLedger.create({
      data: {
        userId: profile.userId,
        conversationId: conv.id,
        actionType: "Visitor Intake Summary",
        creditsDelta: -AI_SCREENING_CREDIT_COST,
      }
    });
  }

  return conv;
}

inboxRouter.post("/p/:slug/intake", async (req, res) => {
  try {
    const parsed = visitorIntakeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const profile = await prisma.profile.findUnique({ where: { slug: req.params.slug } });
    if (!profile || !profile.isPublished) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const conv = await createVisitorConversation(profile, parsed.data);
    res.json(conv);
  } catch (e: any) {
    console.error("[Public Intake Error]", e.message);
    res.status(500).json({ error: "Failed to process intake" });
  }
});

inboxRouter.get("/inbox", authMiddleware, profileMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [convos, total] = await Promise.all([
      prisma.visitorConversation.findMany({
        where: { profileId: req.profileId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.visitorConversation.count({ where: { profileId: req.profileId } })
    ]);

    res.json({ data: convos, total, limit, offset });
  } catch (e: any) {
    console.error("[Inbox List Error]", e.message);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

inboxRouter.get("/inbox/:id", authMiddleware, profileMiddleware, async (req, res) => {
  try {
    const conv = await prisma.visitorConversation.findFirst({
      where: { id: req.params.id, profileId: req.profileId },
    });
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(conv);
  } catch (e: any) {
    console.error("[Inbox Detail Error]", e.message);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

inboxRouter.put("/inbox/:id/status", authMiddleware, profileMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid status", validStatuses: VALID_STATUSES });
      return;
    }
    const result = await prisma.visitorConversation.updateMany({
      where: { id: req.params.id, profileId: req.profileId },
      data: { status }
    });
    if (result.count === 0) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const conv = await prisma.visitorConversation.findFirst({
      where: { id: req.params.id, profileId: req.profileId },
    });
    res.json(conv);
  } catch (e: any) {
    console.error("[Inbox Status Update Error]", e.message);
    res.status(500).json({ error: "Failed to update status" });
  }
});
