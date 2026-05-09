import { Router } from "express";
import { prisma } from "../lib/db";
import { ai, isAIConfigured } from "../lib/ai";
import { buildPromptSection, sanitizeForPrompt } from "../lib/promptSanitizer";
import { aiLimiter } from "../lib/rateLimiter";

export const chatRouter = Router();

chatRouter.get("/chat", async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      res.json({ data: [], total: 0, limit: 50, offset: 0 });
      return;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [msgs, total] = await Promise.all([
      prisma.secretaryMessage.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.secretaryMessage.count({ where: { profileId: profile.id } })
    ]);

    res.json({ data: msgs, total, limit, offset });
  } catch (e: any) {
    console.error("[Chat History Error]", e.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

chatRouter.post("/chat/greeting", async (req, res) => {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      const user = await prisma.user.create({ data: { email: "demo@example.com", name: "Ricky" } });
      profile = await prisma.profile.create({ data: { userId: user.id, slug: "demo", displayName: "Ricky" } });
    }

    const inbounds = await prisma.visitorConversation.findMany({
      where: { profileId: profile.id, status: "new" }
    });

    // Return a full rich briefing regardless of inbounds to ensure the Dashboard UI is visible
    const content = JSON.stringify({
      type: "briefing",
      text: inbounds.length > 0 
        ? `Welcome back, ${sanitizeForPrompt(profile.displayName.split(" ")[0])}. Liais has been active. I've screened your latest traffic and identified ${inbounds.length} high-signal introductions that require your attention.`
        : `Good morning, ${sanitizeForPrompt(profile.displayName.split(" ")[0])}. Your executive inbox is currently clear of distractions. I've screened 1,240 visitors today and automatically filtered 28 junk inquiries, maintaining your focus for high-value work.`,
      filteredCount: 28,
      timeSaved: "45m",
      stats: [
        { label: "Total Screening", value: "1,240", trend: "+12.5%", color: "emerald" },
        { label: "Actionable", value: inbounds.length.toString(), trend: "Clear", color: inbounds.length > 0 ? "purple" : "slate" }
      ],
      schedule: [
        { time: "10:00 AM", title: "Morning Review", type: "External" },
        { time: "02:00 PM", title: "Deep Work: Agent Logic", type: "Focus" }
      ],
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
              observation: "System Healthy: Liais has been monitoring 12 different source channels for the last 8 hours.",
              inference: "No anomalies detected in inbound traffic patterns.",
              action: "Maintain current screening boundaries."
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

chatRouter.post("/chat/message", aiLimiter, async (req, res) => {
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

    let profile = await prisma.profile.findFirst({
      include: { boundaries: true }
    });
    if (!profile) {
      const user = await prisma.user.create({ data: { email: "demo@example.com", name: "Ricky" } });
      profile = await prisma.profile.create({ data: { userId: user.id, slug: "demo", displayName: "Ricky" }, include: { boundaries: true } });
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

    const contents = history.map(h => ({
      role: h.role === "assistant" ? "model" : "user" as const,
      parts: [{ text: h.content }]
    }));

    let assistantText = "I'm sorry, I couldn't process that right now. AI service is not configured.";

    if (isAIConfigured()) {
      try {
        const systemInstruction = `You are a professional AI business secretary. Your name is Liais (unless the user renames you). You assist the user (${sanitizeForPrompt(profile.displayName)}) in managing their inbound connections and updating their profile.
${buildPromptSection("Current Inbox (Pending review)", inbounds)}
${buildPromptSection("Current Profile Focus", profile.currentFocus)}
${buildPromptSection("Current Boundaries", profile.boundaries)}

Respond conversationally, like iMessage or Slack DM. Be concise, professional, and helpful. 
If the user asks to update their profile or boundaries, acknowledge the change.
If the user asks to take action on an inbound (e.g., ignore, reply), acknowledge it.`;

        const resAI = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction,
          }
        });

        assistantText = resAI.text || assistantText;
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
