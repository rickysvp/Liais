import process from 'process';
process.env.DATABASE_URL = "file:./dev.db";

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Demo User
  const demoUserId = "user-123"
  const user = await prisma.user.upsert({
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      email: 'demo@cordio.ai',
      name: 'Demo User',
    },
  })

  // Demo Profile
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      slug: 'demo',
      displayName: 'Alex Demo',
      headline: 'Founder & CEO',
      whatYouDo: 'Building AI tools',
      generatedIntro: 'Hi, I am Alex. I build AI tools for the future of work.',
      generatedWelcomeMessage: 'Hi there! I am the AI secretary for Alex. How can I help you today?',
      generatedContactScopeText: 'Alex is open to product feedback, investor inquiries, and partnerships.',
      isPublished: true,
      primaryConnectionGoal: 'Business partnerships',
      personaType: 'Founder'
    },
  })

  // Seed Inbounds
  await prisma.visitorConversation.createMany({
    data: [
      {
        profileId: profile.id,
        visitorName: 'Jane Smith',
        visitorCompany: 'Acme Corp',
        visitorIntentCategory: 'Partnership',
        visitorReason: 'Would love to discuss integrating our services.',
        contactInfo: 'jane@acmecorp.com',
        transcript: '[]',
        summaryText: 'Jane from Acme Corp wants to discuss a service integration partnership.',
        qualificationLevel: 'high fit',
        status: 'new'
      },
      {
        profileId: profile.id,
        visitorName: 'John Doe',
        visitorCompany: 'Capital Ventures',
        visitorIntentCategory: 'Investing',
        visitorReason: 'Interested in your seed round.',
        contactInfo: 'john@capital.vc',
        transcript: '[]',
        summaryText: 'John from Capital Ventures is interested in the seed round.',
        qualificationLevel: 'possible fit',
        status: 'new'
      }
    ]
  })

  console.log("Seeding complete")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
