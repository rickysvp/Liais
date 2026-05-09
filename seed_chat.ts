import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
  const profile = await prisma.profile.findFirst();
  if (!profile) return;

  await prisma.secretaryMessage.deleteMany({ where: { profileId: profile.id } });

  const messages = [
    { role: "assistant", content: "Good morning, Ricky. Yesterday you had 12 visitors to your page. I handled 2 requests for your time. One was a recruiter, which I politely declined based on your config. The other was a founder asking for consulting." },
    { role: "user", content: "Thanks Liais. What did the founder want?" },
    { role: "assistant", content: "They are building a Fintech startup and want your advice on architecture. They fall into your 'Consulting' boundary. Shall I send them your scheduling link?" },
    { role: "user", content: "Yes please, but make sure they know my hourly rate first." },
    { role: "assistant", content: "Done. I've updated your config to ensure all future consulting inquiries are informed of your hourly rate before booking." },
    { role: "user", content: "Also, update my bio. I'm now focusing heavily on AI agents, not just web apps." },
    { role: "assistant", content: "Noted. I've updated your public bio and current focus to emphasize AI agents." },
    { 
      role: "assistant", 
      content: JSON.stringify({
        type: "briefing",
        text: "Welcome back, Ricky. I've been active while you were away. I've screened 1,240 visitors and successfully filtered 28 junk inquiries (spam and non-target recruiters), saving you approximately 45 minutes of manual review.",
        filteredCount: 28,
        timeSaved: "45m",
        stats: [
          { label: "Total Screening", value: "1,240", trend: "+12.5%", color: "emerald" },
          { label: "Junk Filtered", value: "28", trend: "Blocked", color: "blue" },
          { label: "Priority Leads", value: "6", trend: "Review", color: "purple" }
        ],
        schedule: [
          { time: "10:00 AM", title: "Sequoia Capital Interview", type: "External" },
          { time: "02:00 PM", title: "Deep Work: Agent Logic", type: "Focus" }
        ],
        insights: [
          { 
            type: "opportunity", 
            observation: "High Signal: 3 distinct partners from Sequoia Capital viewed your profile in the last 4 hours.",
            inference: "Strong institutional interest from a Tier-1 VC firm.",
            action: "Prioritize the draft response to Sarah Jenkins."
          },
          { 
            type: "market", 
            observation: "Market Shift: 40% of today's organic traffic is searching for 'AI Agents' rather than 'Fullstack'.",
            inference: "Your recent bio update is resonating with the current market trend.",
            action: "Consider pinning your 'Agent Architect' case study."
          }
        ],
        cards: [
          {
            id: "1",
            name: "David Chen",
            role: "Journalist",
            company: "TechCrunch",
            relevance: "High Fit",
            summary: "Reaching out regarding an exclusive interview feature on your new AI product launch.",
            recommendation: "Accept. This aligns with your media goals.",
            actions: ["Schedule Call", "Decline"]
          },
          {
            id: "2",
            name: "Sarah Jenkins",
            role: "Partner",
            company: "Sequoia Capital",
            relevance: "High Fit",
            summary: "Interested in your latest project metrics for a potential seed round.",
            recommendation: "Accept immediately. Tier-1 fund.",
            actions: ["Review Draft", "Decline"]
          }
        ]
      }) 
    }
  ];

  let now = Date.now() - 100000;
  for (const msg of messages) {
    now += 1000;
    await prisma.secretaryMessage.create({
      data: {
        profileId: profile.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(now)
      }
    });
  }
  console.log("Seeded rich chat with multiple inbounds successfully!");
}
seed().finally(() => prisma.$disconnect());
