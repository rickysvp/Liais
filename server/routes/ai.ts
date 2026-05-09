import { Router } from "express";
import { ai, isAIConfigured } from "../lib/ai";
import { aiLimiter } from "../lib/rateLimiter";
import { buildPromptSection } from "../lib/promptSanitizer";

export const aiRouter = Router();

aiRouter.post("/ai/generate-preview", aiLimiter, async (req, res, next) => {
  try {
    if (!isAIConfigured()) {
      res.status(503).json({ error: "AI service is not configured" });
      return;
    }

    const { payload } = req.body;
    const prompt = `You are a professional business secretary AI generation system. 
Based on this user info, generate a 2-3 sentence 'generatedIntro', a warm but professional 'generatedWelcomeMessage' (for an AI secretary to greet visitors), and 'generatedContactScopeText' outlining what connections the person is open to.
${buildPromptSection("User Info", payload)}
Return JSON exactly as: {"generatedIntro": "...", "generatedWelcomeMessage": "...","generatedContactScopeText": "..."}`;
    
    const resAI = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    if (!resAI.text) throw new Error("No response from AI");
    res.json(JSON.parse(resAI.text));
  } catch (e: any) {
    console.error("[AI Generate Preview Error]", e.message);
    res.status(500).json({ error: "Failed to generate preview" });
  }
});
