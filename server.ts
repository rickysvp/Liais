import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import process from "process";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // === API ROUTES ===

  // 1. Onboarding endpoints
  app.post("/api/onboarding/draft", async (req, res) => {
    try {
      const { sessionId, step, payload } = req.body;
      const draft = await prisma.onboardingDraft.create({
        data: {
          sessionId,
          step,
          payload: JSON.stringify(payload),
        },
      });
      res.json(draft);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Generate Profile Preview
  app.post("/api/ai/generate-preview", async (req, res) => {
    try {
      const { payload } = req.body;
      // We use Gemini to generate intro, welcome message, and contact scope
      const prompt = `You are a professional business secretary AI generation system. 
Based on this user info, generate a 2-3 sentence 'generatedIntro', a warm but professional 'generatedWelcomeMessage' (for an AI secretary to greet visitors), and 'generatedContactScopeText' outlining what connections the person is open to.
User Info: ${JSON.stringify(payload)}

Return JSON exactly as: {"generatedIntro": "...", "generatedWelcomeMessage": "...","generatedContactScopeText": "..."}`;
      
      const resAI = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      if (!resAI.text) throw new Error("No response");
      res.json(JSON.parse(resAI.text));
    } catch (e: any) {
      // Fallback
      res.json({
        generatedIntro: `I am a professional focused on delivering great work.`,
        generatedWelcomeMessage: `Hi there, I'm the AI secretary. How can I help you?`,
        generatedContactScopeText: `Open to business inquiries.`,
      });
    }
  });

  // Publish profile
  app.post("/api/profile/publish", async (req, res) => {
    try {
      const { userId, payload, generated } = req.body;
      
      // Upsert User
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if(!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`,
          }
        });
      }

      // Upsert profile
      const slug = payload.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const profileData = {
          displayName: payload.displayName,
          headline: payload.headline,
          companyOrProject: payload.companyOrProject,
          city: payload.city,
          whatYouDo: payload.whatYouDo,
          whoYouHelp: payload.whoYouHelp,
          currentFocus: payload.currentFocus,
          topicsYouLike: payload.topicsYouLike,
          websiteUrl: payload.websiteUrl,
          linkedinUrl: payload.linkedinUrl,
          twitterUrl: payload.twitterUrl,
          primaryConnectionGoal: payload.primaryConnectionGoal,
          personaType: payload.personaType,
          secretaryTone: payload.secretaryTone,
          greetingStyle: payload.greetingStyle,
          screeningStyle: payload.screeningStyle,
          generatedIntro: generated?.generatedIntro,
          generatedWelcomeMessage: generated?.generatedWelcomeMessage,
          generatedContactScopeText: generated?.generatedContactScopeText,
          isPublished: true,
      };

      const profile = await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          ...profileData,
          slug,
        },
        create: {
          userId: user.id,
          slug,
          ...profileData,
        }
      });

      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get profile by slug
  app.get("/api/p/:slug", async (req, res) => {
    try {
      const profile = await prisma.profile.findUnique({
        where: { slug: req.params.slug }
      });
      if (!profile) return res.status(404).json({ error: "Not found" });
      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get user credits summary for dash
  app.get("/api/me/credits", async (req, res) => {
    try {
      const user = await prisma.user.findFirst();
      if (!user) return res.json({ credits: 0 });
      
      const sub = await prisma.subscription.findFirst({ where: { userId: user.id } });
      const monthlyCredits = sub?.monthlyCredits || 10;

      const ledger = await prisma.usageLedger.findMany({ where: { userId: user.id } });
      const used = ledger.reduce((acc, l) => acc + l.creditsDelta, 0); // delta is negative
      
      res.json({ credits: monthlyCredits + used, plan: sub?.planName || "Free" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get user profile summary for dash
  app.get("/api/me/profile", async (req, res) => {
    try {
      // get first created for mock user
      const profile = await prisma.profile.findFirst({
        include: { boundaries: true }
      });
      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/me/profile", express.json(), async (req, res) => {
    try {
      const profile = await prisma.profile.findFirst();
      if (!profile) return res.status(404).json({ error: "Profile not found" });

      const {
        displayName, headline, generatedIntro, generatedWelcomeMessage,
        primaryConnectionGoal, generatedContactScopeText, boundaries
      } = req.body;

      // Update profile
      const updatedProfile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          displayName,
          headline,
          generatedIntro,
          generatedWelcomeMessage,
          primaryConnectionGoal,
          generatedContactScopeText
        }
      });

      // Update boundaries if provided
      if (boundaries && Array.isArray(boundaries)) {
        await prisma.profileBoundary.deleteMany({
          where: { profileId: profile.id }
        });
        
        if (boundaries.length > 0) {
          await prisma.profileBoundary.createMany({
            data: boundaries.map((b: any) => ({
              profileId: profile.id,
              category: b.category || "General",
              value: b.value,
              visibilityType: b.visibilityType || "public"
            }))
          });
        }
      }

      res.json(updatedProfile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Visitor intake submit
  app.post("/api/intake/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      const data = req.body;

      // generate summary
      const prompt = `Based on this inbound connection request, generate a structured summary.
      Request: ${JSON.stringify(data)}
      Return JSON: {"summaryText": "...", "qualificationLevel": "high fit | possible fit | low fit | unclear", "suggestedAction": "..."}`;

      let summaryText = "Summary pending";
      let qualificationLevel = "unclear";
      let suggestedAction = "Review safely";

      try {
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
      } catch(e) {}

      const conv = await prisma.visitorConversation.create({
        data: {
          profileId,
          visitorName: data.visitorName,
          visitorCompany: data.visitorCompany,
          visitorBackground: data.visitorBackground,
          visitorReason: data.visitorReason,
          visitorIntentCategory: data.visitorIntentCategory,
          requestedNextStep: data.requestedNextStep,
          contactInfo: data.contactInfo,
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
      res.status(500).json({ error: e.message });
    }
  });

  // Get inbox
  app.get("/api/inbox", async (req, res) => {
    try {
      const convos = await prisma.visitorConversation.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.json(convos);
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/inbox/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const conv = await prisma.visitorConversation.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json(conv);
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // === VITE / STATIC SERVING ===

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Determine __dirname since ESM doesn't have it automatically
    // Actually this is built as CJS via esbuild so __dirname works, but if ESM, use url
    const distPath = path.join(__dirname, "..", "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    
    // In express 4 we use * 
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
