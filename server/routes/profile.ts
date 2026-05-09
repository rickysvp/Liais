import { Router } from "express";
import { prisma } from "../lib/db.js";
import { profileUpdateSchema, profilePublishSchema } from "../schemas.js";
import { authMiddleware, profileMiddleware } from "../lib/auth.js";

export const profileRouter = Router();

function toBaseSlug(displayName: string): string {
  const normalized = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "profile";
}

async function resolveUniqueSlug(userId: string, displayName: string): Promise<string> {
  const baseSlug = toBaseSlug(displayName);
  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const owner = await prisma.profile.findUnique({
      where: { slug: candidate },
      select: { userId: true },
    });
    if (!owner || owner.userId === userId) {
      return candidate;
    }
  }
  throw new Error("Unable to allocate unique profile slug");
}

profileRouter.post("/profile/publish", authMiddleware, async (req, res) => {
  try {
    const parsed = profilePublishSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { payload, generated, accountEmail } = parsed.data;
    const userId = req.userId;
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const resolvedEmail = req.userEmail || accountEmail;
      if (!resolvedEmail) {
        res.status(400).json({ error: "A verified account email is required before publishing." });
        return;
      }
      user = await prisma.user.create({
        data: {
          id: userId,
          email: resolvedEmail,
        }
      });
    } else if (!user.email && (req.userEmail || accountEmail)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email: req.userEmail || accountEmail || undefined },
      });
    }

    let slug = await resolveUniqueSlug(user.id, payload.displayName);
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

    let profile;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        profile = await prisma.profile.upsert({
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
        break;
      } catch (error: any) {
        if (error?.code === "P2002" && attempt < 2) {
          slug = await resolveUniqueSlug(user.id, `${payload.displayName}-${Date.now().toString().slice(-4)}`);
          continue;
        }
        throw error;
      }
    }

    if (!profile) {
      throw new Error("Failed to save profile");
    }

    res.json({
      ...profile,
      profileUrl: `${process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:3000"}/u/${profile.slug}`,
    });
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
