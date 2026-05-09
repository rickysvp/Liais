import { Router } from "express";
import { prisma } from "../lib/db";
import { generateText, isAIConfigured } from "../lib/ai";
import type { ChatMessage } from "../lib/ai";
import { buildPromptSection, sanitizeForPrompt } from "../lib/promptSanitizer";
import { aiLimiter } from "../lib/rateLimiter";
import { authMiddleware, profileMiddleware } from "../lib/auth";

export const chatRouter = Router();

chatRouter.get("/", authMiddleware, profileMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [msgs, total] = await Promise.all([
      prisma.secretaryMessage.findMany({
        where: { profileId: req.profileId },
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.secretaryMessage.count({ where: { profileId: req.profileId } })
    ]);

    res.json({ data: msgs, total, limit, offset });
  } catch (e: any) {
    console.error("[Chat History Error]", e.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

chatRouter.post("/greeting", authMiddleware, profileMiddleware, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: req.profileId! } });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const inbounds = await prisma.visitorConversation.findMany({
      where: { profileId: profile.id, status: "new" }
    });

    // Return a full rich briefing regardless of inbounds to ensure the Dashboard UI is visible
    const content = JSON.stringify({
      type: "briefing",
      text: inbounds.length > 0 
        ? `Welcome back, ${sanitizeForPrompt(profile.displayName.split(" ")[0])}. Liais has been active. I've screened your latest traffic and identified ${inbounds.length} high-signal introductions that require your attention.`
        : `Good morning, ${sanitizeForPrompt(profile.displayName.split(" ")[0])}. Your executive inbox is currently clear. No new qualified introductions have been detected yet.`,
      filteredCount: inbounds.length,
      timeSaved: inbounds.length > 0 ? `${Math.min(inbounds.length * 3, 60)}m` : "0m",
      stats: [
        { label: "Total Screening", value: inbounds.length.toString(), trend: "Live", color: "emerald" },
        { label: "Actionable", value: inbounds.length.toString(), trend: inbounds.length > 0 ? "Review" : "Clear", color: inbounds.length > 0 ? "purple" : "slate" }
      ],
      schedule: [],
      insights: inbounds.length > 0 
        ? inbounds.slice(0, 2).map(ib => ({
            type: "opportunity",
            observation: `High Signal: ${ib.visitorName} from ${ib.visitorCompany} viewed your profile.`,
            inference: "Potential high-value partnership or investment inquiry.",
            action: `Review details for ${ib.visitorName}`
          }))
        : [
            { 
              type: "status", 
              observation: "System Healthy: intake endpoint is active and waiting for new submissions.",
              inference: "No pending opportunities require action right now.",
              action: "Share your profile link to receive qualified inbound requests."
            }
          ],
      cards: inbounds.map(ib => ({
        id: ib.id,
        name: ib.visitorName || "Anonymous",
        role: "Visitor",
        company: ib.visitorCompany || "Unknown",
        relevance: "High Fit",
        summary: ib.summaryText || ib.visitorReason || "Interested in connection.",
        recommendation: "Review and respond.",
        actions: ["Review Draft", "Archive"]
      }))
    });

    const msg = await prisma.secretaryMessage.create({
      data: {
        profileId: profile.id,
        role: "assistant",
        content: content
      }
    });

    res.json(msg);
  } catch (e: any) {
    console.error("[Chat Greeting Error]", e.message);
    res.status(500).json({ error: "Failed to generate greeting" });
  }
});

chatRouter.post("/message", authMiddleware, profileMiddleware, aiLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    if (message.length > 5000) {
      res.status(400).json({ error: "Message too long (max 5000 characters)" });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { id: req.profileId! },
      include: { boundaries: true }
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    await prisma.secretaryMessage.create({
      data: {
        profileId: profile.id,
        role: "user",
        content: message
      }
    });

    const history = await prisma.secretaryMessage.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    history.reverse();

    const inbounds = await prisma.visitorConversation.findMany({
      where: { profileId: profile.id, status: "new" }
    });

    let assistantText = "I couldn't process that just now. Please try again in a moment.";

    if (isAIConfigured()) {
      try {
        const systemInstruction = `You are a professional AI business secretary. Your name is Liais (unless the user renames you). You assist the user (${sanitizeForPrompt(profile.displayName)}) in managing their inbound connections and updating their profile.
${buildPromptSection("Current Inbox (Pending review)", inbounds)}
${buildPromptSection("Current Profile Focus", profile.currentFocus)}
${buildPromptSection("Current Boundaries", profile.boundaries)}

Respond conversationally, like iMessage or Slack DM. Be concise, professional, and helpful. 
If the user asks to update their profile or boundaries, acknowledge the change.
If the user asks to take action on an inbound (e.g., ignore, reply), acknowledge it.`;

        const messages: ChatMessage[] = [
          { role: "system" as const, content: systemInstruction },
          ...history.map((h) => {
            const normalizedRole: ChatMessage["role"] = h.role === "assistant" ? "assistant" : "user";
            return {
              role: normalizedRole,
              content: h.content,
            };
          }),
        ];

        assistantText = (await generateText(messages)) || assistantText;
      } catch (e: any) {
        console.error("[AI Chat Error]", e.message);
      }
    }

    const msg = await prisma.secretaryMessage.create({
      data: {
        profileId: profile.id,
        role: "assistant",
        content: assistantText
      }
    });

    res.json(msg);
  } catch (e: any) {
    console.error("[Chat Message Error]", e.message);
    res.status(500).json({ error: "Failed to process message" });
  }
});
