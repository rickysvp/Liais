import { Router } from "express";
import { prisma } from "../lib/db";
import { profileUpdateSchema, profilePublishSchema } from "../schemas";
import { authMiddleware, profileMiddleware } from "../lib/auth";

export const profileRouter = Router();

profileRouter.post("/profile/publish", async (req, res) => {
  try {
    const parsed = profilePublishSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const { userId, payload, generated } = parsed.data;
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com`,
        }
      });
    }

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
    console.error("[Profile Publish Error]", e.message);
    res.status(500).json({ error: "Failed to publish profile" });
  }
});

profileRouter.get("/p/:slug", async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { slug: req.params.slug }
    });
    if (!profile) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (!profile.isPublished) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      slug: profile.slug,
      displayName: profile.displayName,
      headline: profile.headline,
      generatedIntro: profile.generatedIntro,
      generatedWelcomeMessage: profile.generatedWelcomeMessage,
      generatedContactScopeText: profile.generatedContactScopeText,
      linkedinUrl: profile.linkedinUrl,
      twitterUrl: profile.twitterUrl,
      websiteUrl: profile.websiteUrl,
    });
  } catch (e: any) {
    console.error("[Profile Get By Slug Error]", e.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

profileRouter.get("/me/profile", authMiddleware, profileMiddleware, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
      include: { boundaries: true }
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(profile);
  } catch (e: any) {
    console.error("[Profile Get Error]", e.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

profileRouter.put("/me/profile", authMiddleware, profileMiddleware, async (req, res) => {
  try {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const {
      displayName, headline, generatedIntro, generatedWelcomeMessage,
      primaryConnectionGoal, generatedContactScopeText, boundaries
    } = parsed.data;

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

    if (boundaries && Array.isArray(boundaries)) {
      await prisma.profileBoundary.deleteMany({
        where: { profileId: profile.id }
      });

      if (boundaries.length > 0) {
        await prisma.profileBoundary.createMany({
          data: boundaries.map((b) => ({
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
    console.error("[Profile Update Error]", e.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
