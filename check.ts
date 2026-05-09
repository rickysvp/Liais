import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    const profile = await prisma.profile.findFirst();
    console.log("Profile ID:", profile?.id);
    if (!profile) {
      console.log("No profile found.");
      return;
    }
    const msgs = await prisma.secretaryMessage.findMany({ where: { profileId: profile.id }});
    console.log("Messages count:", msgs.length);
    console.log("First message:", msgs[0]);
  } catch(e) {
    console.error(e);
  }
}
test().finally(() => prisma.$disconnect());
