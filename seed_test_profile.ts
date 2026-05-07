import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findUnique({ where: { id: "test-user-123" } });
  if(!user) {
    user = await prisma.user.create({
      data: {
        id: "test-user-123",
        email: "test@example.com",
      }
    });
  }

  const existingProfile = await prisma.profile.findFirst({ where: { slug: "demo" } });
  
  const profileData = {
    userId: user.id,
    slug: "demo",
    displayName: "Alex Innovator",
    headline: "Founder & CEO at Alpha Startups",
    companyOrProject: "Alpha Startups",
    city: "San Francisco, CA",
    whatYouDo: "I build amazing products for developers.",
    whoYouHelp: "Developers and product managers.",
    currentFocus: "Raising a Series A.",
    topicsYouLike: "Tech, AI, Startups",
    linkedinUrl: "https://linkedin.com/in/alex-innovator",
    twitterUrl: "https://x.com/alexinnovator",
    websiteUrl: "https://alphastartups.com",
    primaryConnectionGoal: "Business partnerships",
    personaType: "Founder",
    secretaryTone: "Professional",
    greetingStyle: "Friendly",
    screeningStyle: "Direct",
    generatedIntro: "I am a founder with 10 years of experience building products that people love. My focus is on intersecting design and AI.",
    generatedWelcomeMessage: "Hi there! I'm Alex's AI Secretary. I manage all incoming inquiries so Alex can stay focused. Who are you and how can we collaborate?",
    generatedContactScopeText: "Alex is always open to chatting about interesting partnerships, potential hires, and angel investments.",
    isPublished: true,
  };

  if (!existingProfile) {
    await prisma.profile.create({
      data: profileData
    });
    console.log("Created demo profile");
  } else {
    await prisma.profile.update({
      where: { slug: "demo" },
      data: profileData
    });
    console.log("Updated demo profile");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
