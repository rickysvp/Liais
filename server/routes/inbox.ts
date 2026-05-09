import { Router } from "express";
import { prisma } from "../lib/db";
import { ai, isAIConfigured } from "../lib/ai";
import { visitorIntakeSchema } from "../schemas";
import { buildPromptSection } from "../lib/promptSanitizer";

export const inboxRouter = Router();

const VALID_STATUSES = ["new", "Waiting on you", "Ready to send", "Waiting on them", "Monitor later", "replied", "ignored", "Archived by AI"] as const;

inboxRouter.post("/intake/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    const parsed = visitorIntakeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }
    const data = parsed.data;

    let summaryText = "Summary pending";
    let qualificationLevel = "unclear";
    let suggestedAction = "Review safely";

    if (isAIConfigured()) {
      try {
        const prompt = `Based on this inbound connection request, generate a structured summary.
${buildPromptSection("Request", data)}
Return JSON: {"summaryText": "...", "qualificationLevel": "high fit | possible fit | low fit | unclear", "suggestedAction": "..."}`;

        const resAI = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        if (resAI.text) {
          const aiParse = JSON.parse(resAI.text);
          summaryText = aiParse.summaryText;
          qualificationLevel = aiParse.qualificationLevel;
          suggestedAction = aiParse.suggestedAction;
        }
      } catch (e: any) {
        console.error("[AI Intake Summary Error]", e.message);
      }
    }

    const conv = await prisma.visitorConversation.create({
      data: {
        profileId,
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

    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (profile) {
      await prisma.usageLedger.create({
        data: {
          userId: profile.userId,
          conversationId: conv.id,
          actionType: "Visitor Intake Summary",
          creditsDelta: -2,
        }
      });
    }

    res.json(conv);
  } catch (e: any) {
    console.error("[Intake Error]", e.message);
    res.status(500).json({ error: "Failed to process intake" });
  }
});

inboxRouter.get("/inbox", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [convos, total] = await Promise.all([
      prisma.visitorConversation.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.visitorConversation.count()
    ]);

    res.json({ data: convos, total, limit, offset });
  } catch (e: any) {
    console.error("[Inbox List Error]", e.message);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

inboxRouter.put("/inbox/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid status", validStatuses: VALID_STATUSES });
      return;
    }
    const conv = await prisma.visitorConversation.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(conv);
  } catch (e: any) {
    console.error("[Inbox Status Update Error]", e.message);
    res.status(500).json({ error: "Failed to update status" });
  }
});
