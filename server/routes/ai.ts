import { Router } from "express";
import { generateJsonObject, isAIConfigured } from "../lib/ai.js";
import { aiLimiter } from "../lib/rateLimiter.js";
import { buildPromptSection } from "../lib/promptSanitizer.js";

export const aiRouter = Router();

aiRouter.post("/ai/generate-preview", aiLimiter, async (req, res, next) => {
  try {
    if (!isAIConfigured()) {
      res.status(503).json({ error: "Preview service is temporarily unavailable" });
      return;
    }

    const { payload } = req.body;
    const prompt = `You are a professional business secretary AI generation system. 
Based on this user info, generate a 2-3 sentence 'generatedIntro', a warm but professional 'generatedWelcomeMessage' (for an AI secretary to greet visitors), and 'generatedContactScopeText' outlining what connections the person is open to.
${buildPromptSection("User Info", payload)}
Return JSON exactly as: {"generatedIntro": "...", "generatedWelcomeMessage": "...","generatedContactScopeText": "..."}`;
    
    const text = await generateJsonObject([{ role: "user", content: prompt }]);
    if (!text) throw new Error("No response from AI");
    res.json(JSON.parse(text));
  } catch (e: any) {
    console.error("[AI Generate Preview Error]", e.message);
    res.status(500).json({ error: "Failed to generate preview" });
  }
});
