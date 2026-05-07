import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  en: {
    liaisActionLog: "Liais Action Log",
    screenedRequests: "I screened 18 inbound requests since yesterday.",
    autoArchived: "I auto-archived 15 low-value pitches, saving you an estimated 2.5 hours today.",
    foundPriority: "I found 3 priority requests that need your decision today, and drafted one media response for your review.",
    whatIHandled: "What I handled for you",
    salesPitches: "15 sales pitches",
    archivedByAI: "Archived by AI",
    techCrunchInq: "TechCrunch Inquiry",
    rankedUrgent: "Ranked urgent",
    davidChensEmail: "David Chen's email",
    draftPrepared: "Draft prepared",
    acmeCorpPartner: "Acme Corp Partner",
    introSuggested: "Intro suggested",
    aiExecutiveQueue: "AI Executive Queue",
    categorizedByIntent: "Categorized by intent and priority",
    needsYourDecision: "Needs your decision",
    readyToSend: "Ready to send",
    waitingOnThem: "Waiting on them",
    monitorLater: "Monitor later",
    noItemsInQueue: "No items in this queue.",
    anonymous: "Anonymous",
    selectABrief: "Select a brief to review",
    identity: "Identity",
    noContactInfo: "No contact info provided.",
    unclear: "Unclear",
    whyISurfaced: "Why I surfaced this now",
    whyItMatters: "Why it matters",
    whatIPrepared: "What I already prepared",
    recommendedNextMove: "Recommended next move",
    providedContext: "Provided Context",
    aiDraftedMeeting: "AI Drafted Meeting Invite",
    aiDraftedFollowUp: "AI Drafted Follow-up",
    aiDraftedReply: "AI Drafted Reply",
    reviewAndEdit: "Review and edit before sending via Liais",
    to: "To:",
    subject: "Subject:",
    suggestedNextStep: "Suggested Next Step:",
    cancel: "Cancel",
    copy: "Copy",
    copied: "✓ Copied",
    sending: "Sending...",
    sendEmail: "Send Email",
    emailSent: "✓ Email Sent",
    replyByEmail: "Reply by email",
    sendMeetingLink: "Send meeting link",
    askForMoreDetails: "Ask for more details",
    monitorLaterAction: "Monitor later",
    archiveAction: "Archive",
    waitingOnYou: "Waiting on you",
    archived: "Archived",
    justNow: "Just now",
    hAgo: "h ago",
    dAgo: "d ago",
    flaggedReview: "I flagged this for your review.",
    alignmentPriorities: "Alignment with your current priorities based on recent activity.",
    waitingInstructions: "I am waiting on your instructions to proceed.",
    
    // MOCK DATA ENGINES
    mock1Role: "Senior Reporter",
    mock1Reason: "I'm writing a story on how AI is changing founder productivity. Would love to get your thoughts on the tools you use and how they have impacted your daily workflow for a piece publishing next week.",
    mock1Summary: "I flagged this media inquiry because it's publishing next week. David is looking for your workflow insights.",
    mock1Matters: "High-visibility PR opportunity for our recent AI product updates.",
    mock1Prepared: "I drafted a 2-3 sentence response based on your previous interviews.",
    mock1Next: "A short reply",
    mock1Qual: "High Fit",
    mock1Suggest: "Review and send my drafted response.",
    
    mock2Role: "VP of Engineering",
    mock2Reason: "We're launching a new API platform and looking for strategic launch partners. Given your work in the devtool space, we think there's a strong alignment for a co-marketing campaign and technical integration.",
    mock2Summary: "I screened this partnership request. Acme Corp is seeking a strategic launch partner for their new API platform.",
    mock2Matters: "Direct alignment with our Q3 distribution goals. Acme Corp offers scale to an audience we haven't reached yet.",
    mock2Prepared: "I prepared a calendar invitation link for a 15-minute intro call.",
    mock2Next: "An intro call",
    mock2Qual: "High Fit",
    mock2Suggest: "Approve the intro call.",
    
    mock3Role: "Founder",
    mock3Reason: "I am a second-time founder currently validating a new idea in the B2B SaaS space. We have some early traction and are looking to bring on experienced advisors. Would love to pick your brain on pricing strategies over a quick Zoom call.",
    mock3Summary: "I screened this advisory request. Michael is a second-time B2B SaaS founder seeking pricing strategies.",
    mock3Matters: "Low immediate strategic value, though potential for long-term network building if time permits.",
    mock3Prepared: "I drafted a polite reply asking for a pitch deck first.",
    mock3Next: "An intro call",
    mock3Qual: "Possible Fit",
    mock3Suggest: "Ask for a brief pitch deck via email before committing to a call.",
    
    mock4Role: "Event Coordinator",
    mock4Reason: "We are organizing the annual Global Tech Summit in London next month and would love to have you as a keynote speaker on the topic of AI Automation. All travel expenses will be covered.",
    mock4Summary: "I flagged this speaking invitation for the Global Tech Summit in London next month.",
    mock4Matters: "Excellent international branding opportunity, but requires 3 days of travel commitment.",
    mock4Prepared: "I cross-referenced your calendar. You are free during these dates.",
    mock4Next: "Confirm availability",
    mock4Qual: "High Fit",
    mock4Suggest: "Review calendar and request specific timing details.",
    
    mock5Role: "Enterprise Account Executive",
    mock5Reason: "I noticed your company has been scaling rapidly. Our enterprise data synchronization tool can reduce your database latency by up to 40%. Would you have 10 minutes next Tuesday to see a demo?",
    mock5Summary: "I categorized this as a low-priority sales pitch for an enterprise data synchronization tool.",
    mock5Matters: "Routine vendor pitch. We are not currently evaluating data sync providers.",
    mock5Prepared: "I archived this and can send a polite rejection template.",
    mock5Next: "A demo call",
    mock5Qual: "Low Fit",
    mock5Suggest: "Confirm archive."
  },
  zh: {
    liaisActionLog: "Liais 助理行动日志",
    screenedRequests: "从昨天起，我筛选了 18 个入站请求。",
    autoArchived: "我自动归档了 15 个低价值的推销邮件，今天为您节省了约 2.5 小时。",
    foundPriority: "我发现了 3 个今天需要您做决定的高优先级请求，并为您起草了一份媒体回复供您审阅。",
    whatIHandled: "我为您处理的内容",
    salesPitches: "15 个推销",
    archivedByAI: "AI已归档",
    techCrunchInq: "TechCrunch 问询",
    rankedUrgent: "标记为紧急",
    davidChensEmail: "David Chen 的邮件",
    draftPrepared: "草稿已准备",
    acmeCorpPartner: "Acme Corp 合作",
    introSuggested: "建议介绍会议",
    aiExecutiveQueue: "AI 高管收件箱",
    categorizedByIntent: "按意图和优先级分类",
    needsYourDecision: "需要您的决定",
    readyToSend: "准备发送",
    waitingOnThem: "等待对方跟进",
    monitorLater: "稍后关注",
    noItemsInQueue: "此队列中没有项目。",
    anonymous: "匿名",
    selectABrief: "选择一个简报以审阅",
    identity: "身份",
    noContactInfo: "未提供联系方式",
    unclear: "不明确",
    whyISurfaced: "为什么我现在展示这个",
    whyItMatters: "为什么这很重要",
    whatIPrepared: "我已经准备了什么",
    recommendedNextMove: "推荐的下一步动作",
    providedContext: "提供的上下文",
    aiDraftedMeeting: "AI 起草的会议邀请",
    aiDraftedFollowUp: "AI 起草的跟进邮件",
    aiDraftedReply: "AI 起草的回复",
    reviewAndEdit: "在通过 Liais 发送之前审阅并编辑",
    to: "发件至：",
    subject: "主题：",
    suggestedNextStep: "建议的下一步：",
    cancel: "取消",
    copy: "复制",
    copied: "✓ 已复制",
    sending: "发送中...",
    sendEmail: "发送邮件",
    emailSent: "✓ 邮件已发送",
    replyByEmail: "回复邮件",
    sendMeetingLink: "发送会议链接",
    askForMoreDetails: "询问更多详情",
    monitorLaterAction: "稍后关注",
    archiveAction: "归档",
    waitingOnYou: "等待您处理",
    archived: "已归档",
    justNow: "刚刚",
    hAgo: "小时前",
    dAgo: "天前",
    flaggedReview: "我标记了此项供您查看。",
    alignmentPriorities: "根据您近期的活动，符合您当前的优先级。",
    waitingInstructions: "我正在等待您的指示以进行下一步。",

    // MOCK DATA ENGINES
    mock1Role: "资深记者",
    mock1Reason: "我正在写一篇关于AI如何改变创始人生产力的文章。希望能了解您平时使用的工具以及它们如何影响您的日常工作流程。本文将于下周发布。",
    mock1Summary: "我标记了这个媒体询问，因为报道下周就要发布。David希望能了解您的工作方法。",
    mock1Matters: "这对我们最近的AI产品更新是一个高曝光的公关机会。",
    mock1Prepared: "我根据您之前的采访记录起草了2-3句话的回复。",
    mock1Next: "简短回复",
    mock1Qual: "高度契合",
    mock1Suggest: "审阅并发送我起草的回复。",
    
    mock2Role: "工程副总裁",
    mock2Reason: "我们正在推出一个新的 API 平台，正在寻找战略发布伙伴。鉴于您在开发者工具领域的工作背景，我们认为在联合营销和技术集成方面有很强的契合度。",
    mock2Summary: "我筛选了这个合作请求。Acme Corp 正在为他们的新 API 平台寻找战略发布合作。",
    mock2Matters: "与我们第三季度的分销目标直接吻合。Acme Corp 可以为我们提供尚未触及的受众规模。",
    mock2Prepared: "我已准备了一个包含 15 分钟介绍会议日程链接的邀请。",
    mock2Next: "介绍会议",
    mock2Qual: "高度契合",
    mock2Suggest: "批准介绍会议。",
    
    mock3Role: "创始人",
    mock3Reason: "我是一名连续创业者，目前正在验证 B2B SaaS 领域的新想法。我们取得了一些早期的进展，正寻找有经验的顾问。希望能通过简短的 Zoom 会议听听您对定价策略的建议。",
    mock3Summary: "我筛选了这一顾问请求。Michael 是一位二次 B2B SaaS 寻求定价策略建议的创业者。",
    mock3Matters: "眼前的战略价值较低，但如果有时间的话，有可能建立长期的网络关系。",
    mock3Prepared: "我草拟了一份礼貌的回复，要求他先发一份商业计划书。",
    mock3Next: "介绍会议",
    mock3Qual: "可能契合",
    mock3Suggest: "在安排会议前通过电子邮件要求发送商业计划书。",
    
    mock4Role: "活动协调员",
    mock4Reason: "下个月我们将在伦敦组织一年一度的全球技术峰会，非常希望能邀请您来就 AI 自动化为主题做主题演讲。所有差旅费用将全包。",
    mock4Summary: "我标记了下个月在伦敦举行的全球技术峰会的演讲邀请。",
    mock4Matters: "极好的国际品牌推广机会，但需要承诺出差 3 天。",
    mock4Prepared: "我核对了您的日历。您在这些日期有空。",
    mock4Next: "确认时间",
    mock4Qual: "高度契合",
    mock4Suggest: "检查日历并请求具体的时间安排。",
    
    mock5Role: "企业客户经理",
    mock5Reason: "我注意到贵公司扩展迅速。我们的企业数据同步工具可以将您的数据库延迟降低多达 40％。下周二您有时间观看 10 分钟的演示吗？",
    mock5Summary: "我将其归类为用于企业数据同步工具的低优先级推销信息。",
    mock5Matters: "常规供应商推销。我们目前不评估数据同步服务商。",
    mock5Prepared: "我将其归档，并可发送一封礼貌的拒绝模板邮件。",
    mock5Next: "演示会议",
    mock5Qual: "低契合度",
    mock5Suggest: "确认归档。"
  }
};

const getMockBriefs = (t: any) => [
  {
    id: "mock-1",
    visitorName: "David Chen",
    visitorCompany: "TechCrunch",
    visitorBackground: t.mock1Role,
    visitorIntentCategory: "Media",
    priorityLevel: 1,
    visitorReason: t.mock1Reason,
    summaryText: t.mock1Summary,
    whyItMatters: t.mock1Matters,
    whatAIPrepared: t.mock1Prepared,
    requestedNextStep: t.mock1Next,
    qualificationLevel: t.mock1Qual,
    suggestedAction: t.mock1Suggest,
    status: "Ready to send",
    email: "david.chen@techcrunch.example.com",
    whatsapp: "+15551234567",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "mock-2",
    visitorName: "Sarah Jenkins",
    visitorCompany: "Acme Corp",
    visitorBackground: t.mock2Role,
    visitorIntentCategory: "Partnership",
    priorityLevel: 2,
    visitorReason: t.mock2Reason,
    summaryText: t.mock2Summary,
    whyItMatters: t.mock2Matters,
    whatAIPrepared: t.mock2Prepared,
    requestedNextStep: t.mock2Next,
    qualificationLevel: t.mock2Qual,
    suggestedAction: t.mock2Suggest,
    status: "Waiting on you",
    email: "sarah.jenkins@acmecorp.example.com",
    linkedin: "linkedin.com/in/sarahjenkins",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "mock-3",
    visitorName: "Michael Rundell",
    visitorCompany: "Stealth Startup",
    visitorBackground: t.mock3Role,
    visitorIntentCategory: "Advisory",
    priorityLevel: 3,
    visitorReason: t.mock3Reason,
    summaryText: t.mock3Summary,
    whyItMatters: t.mock3Matters,
    whatAIPrepared: t.mock3Prepared,
    requestedNextStep: t.mock3Next,
    qualificationLevel: t.mock3Qual,
    suggestedAction: t.mock3Suggest,
    status: "Waiting on you",
    email: "michael@stealth-ai-product.com",
    linkedin: "linkedin.com/in/michaelrundell",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "mock-4",
    visitorName: "Elena Rostova",
    visitorCompany: "Global Tech Summit",
    visitorBackground: t.mock4Role,
    visitorIntentCategory: "Media",
    priorityLevel: 2,
    visitorReason: t.mock4Reason,
    summaryText: t.mock4Summary,
    whyItMatters: t.mock4Matters,
    whatAIPrepared: t.mock4Prepared,
    requestedNextStep: t.mock4Next,
    qualificationLevel: t.mock4Qual,
    suggestedAction: t.mock4Suggest,
    status: "Waiting on you",
    email: "elena@globaltechsummit.example.com",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "mock-5",
    visitorName: "James Harrison",
    visitorCompany: "DataSync Solutions",
    visitorBackground: t.mock5Role,
    visitorIntentCategory: "Sales",
    priorityLevel: 3,
    visitorReason: t.mock5Reason,
    summaryText: t.mock5Summary,
    whyItMatters: t.mock5Matters,
    whatAIPrepared: t.mock5Prepared,
    requestedNextStep: t.mock5Next,
    qualificationLevel: t.mock5Qual,
    suggestedAction: t.mock5Suggest,
    status: "Archived by AI",
    email: "jharrison@datasync.example.com",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export default function Inbox() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const translatedMockBriefs = getMockBriefs(t);

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queueTab, setQueueTab] = useState("decision"); // decision, ready, waiting, monitor, archived
  const [activeDraft, setActiveDraft] = useState<
    "reply" | "meeting" | "details" | null
  >(null);
  const [editableSubject, setEditableSubject] = useState("");
  const [editableBody, setEditableBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const diffHours = Math.floor(
        (new Date().getTime() - date.getTime()) / (1000 * 60 * 60),
      );
      if (diffHours < 24) return diffHours > 0 ? `${diffHours}${t.hAgo}` : t.justNow;
      return `${Math.floor(diffHours / 24)}${t.dAgo}`;
    } catch {
      return "";
    }
  };

  const formatDateFull = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Intl.DateTimeFormat(language === 'zh' ? "zh-CN" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(dateString));
    } catch {
      return "";
    }
  };

  useEffect(() => {
    setActiveDraft(null);
    setEmailSent(false);
    setCopied(false);
  }, [selectedId]);

  useEffect(() => {
    fetch("/api/inbox")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConversations(data.length > 0 ? data : translatedMockBriefs);
          if (data.length > 0) setSelectedId(data[0].id);
          else if (translatedMockBriefs.length > 0) setSelectedId(translatedMockBriefs[0].id);
        } else {
          setConversations(translatedMockBriefs);
          setSelectedId(translatedMockBriefs[0].id);
        }
      })
      .catch(() => {
        setConversations(translatedMockBriefs);
        setSelectedId(translatedMockBriefs[0].id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedId || selectedId.startsWith("mock-")) return;
    try {
      await fetch(`/api/inbox/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, status } : c)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Filter conversations based on new intent queues
  const filteredConversations = conversations
    .filter((c) => {
      // If it's explicitly marked 'later' or 'ignored', only show in 'archived' or 'monitor' tab based on your logic
      if (c.status === "ignored" || c.status === "Archived by AI") {
        return queueTab === "archived";
      }

      if (queueTab === "monitor")
        return c.status === "Monitor later" || c.status === "later";
      if (queueTab === "waiting") return c.status === "Waiting on them";
      if (queueTab === "ready") return c.status === "Ready to send";
      if (queueTab === "archived")
        return c.status === "Archived by AI" || c.status === "ignored";
      if (queueTab === "decision")
        return c.status === "Waiting on you" || c.status === "new" || !c.status;

      return true;
    })
    .sort((a, b) => {
      // Primary sort: Priority (1 is highest)
      const priA = a.priorityLevel || 4;
      const priB = b.priorityLevel || 4;
      if (priA !== priB) return priA - priB;
      // Secondary sort: Freshness
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const selectedBrief = conversations.find((c) => c.id === selectedId);

  const getDraftContent = (
    brief: any,
    type: "reply" | "meeting" | "details" | null,
  ) => {
    if (!brief || !type) return null;
    const name = brief.visitorName?.split(" ")[0] || "there";
    const intent = brief.visitorIntentCategory?.toLowerCase() || "";
    const company = brief.visitorCompany || "your company";

    if (type === "reply") {
      let body = `Hi ${name},\n\nThanks for reaching out. The work you're doing at ${company} aligns well with our current focus.\n\nI'll review the details you shared. Let's connect soon to discuss further.\n\nBest,\n[Your Name]`;

      if (intent === "partnership") {
        body = `Hi ${name},\n\nThanks for reaching out about a potential partnership with ${company}. I agree there's strong alignment for a co-marketing campaign and technical integration.\n\nI'll review the details on my end. Let's connect soon to discuss next steps.\n\nBest,\n[Your Name]`;
      } else if (intent === "media") {
        body = `Hi ${name},\n\nThanks for getting in touch. I'd be happy to share my thoughts on founder productivity and AI for your piece.\n\nLet me know what specific questions you have or if you prefer a brief call.\n\nBest,\n[Your Name]`;
      } else if (intent === "advisory") {
        body = `Hi ${name},\n\nThanks for sharing your progress. Validating a new idea in B2B SaaS is an exciting phase.\n\nWhile my bandwidth for formal advisory roles is limited right now, I'm happy to share some high-level thoughts on pricing.\n\nBest,\n[Your Name]`;
      }

      return {
        subject: `Re: Exploring an opportunity with ${company}`,
        body,
        suggestedNextStep:
          "Send this reply to acknowledge their request and keep the conversation moving.",
      };
    }
    if (type === "meeting") {
      return {
        subject: `Meeting: ${company} Context`,
        body: `Hi ${name},\n\nThanks for the detailed brief. I'd love to learn more and see if there's a strong fit.\n\nPlease grab 15 minutes on my calendar here: [Cal Link]\n\nLooking forward to speaking.\n\nBest,\n[Your Name]`,
        suggestedNextStep:
          "Send this invitation via email or LinkedIn based on their provided contact info.",
      };
    }
    if (type === "details") {
      return {
        subject: `Following up: ${company}`,
        body: `Hi ${name},\n\nThanks for sending this over. Before we jump on a call, could you share a bit more context or a brief deck?\n\nThis will help me ensure we use our time effectively.\n\nBest,\n[Your Name]`,
        suggestedNextStep:
          "Ask for more asynchronous context to qualify the request further.",
      };
    }
    return null;
  };

  const handleCopy = async () => {
    const text = `Subject: ${editableSubject}\n\n${editableBody}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const draftContent = getDraftContent(selectedBrief, activeDraft);

  return (
    <div className="flex flex-col pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-2 lg:px-0 mb-12">
      {/* AI Secretary Briefing Section */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                />
              </svg>
            </div>
            <h2 className="text-[13px] font-bold text-[#111] uppercase tracking-widest">
              {t.liaisActionLog}
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 space-y-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
              <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                {t.screenedRequests}
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
              <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                {t.autoArchived}
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 animate-pulse"></div>
              <p className="text-[15px] text-[#111] leading-relaxed font-bold">
                {t.foundPriority}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 pt-1 lg:pt-3">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {t.whatIHandled}
          </h2>
          <div className="flex flex-col gap-2.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
              <span className="text-[13px] font-bold text-slate-600 truncate pr-2">
                {t.salesPitches}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded shrink-0">
                {t.archivedByAI}
              </span>
            </div>
            <div className="bg-white border border-red-100 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
              <span className="text-[13px] font-bold text-slate-600 truncate pr-2">
                {t.techCrunchInq}
              </span>
              <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded shrink-0">
                {t.rankedUrgent}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
              <span className="text-[13px] font-bold text-slate-600 truncate pr-2">
                {t.davidChensEmail}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded shrink-0">
                {t.draftPrepared}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
              <span className="text-[13px] font-bold text-slate-600 truncate pr-2">
                {t.acmeCorpPartner}
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded shrink-0">
                {t.introSuggested}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#111] tracking-tight">
            {t.aiExecutiveQueue}
          </h1>
          <p className="text-slate-500 text-[13px] mt-2 uppercase tracking-widest font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            {t.categorizedByIntent}
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100/50 p-1 rounded-full border border-slate-200/60 overflow-x-auto scrollbar-hide">
          {[
            { id: "decision", label: t.needsYourDecision },
            { id: "ready", label: t.readyToSend },
            { id: "waiting", label: t.waitingOnThem },
            { id: "monitor", label: t.monitorLater },
            { id: "archived", label: t.archivedByAI },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQueueTab(tab.id)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${queueTab === tab.id ? "bg-[#111] text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 min-h-[600px]">
        {/* Left Column: List */}
        <div className="col-span-1 lg:col-span-4 h-[600px] lg:h-[800px] overflow-y-auto space-y-3 pb-8 scrollbar-hide pr-1 lg:pr-3">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-slate-400 font-medium tracking-wide">
                {t.noItemsInQueue}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer select-none relative overflow-hidden flex flex-col gap-3
                  ${
                    selectedId === conv.id
                      ? "bg-slate-50 border-[#111] shadow-[0_4px_20px_rgb(0,0,0,0.06)]"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
              >
                {conv.priorityLevel === 1 && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                )}

                <div className="flex items-start justify-between">
                  <div className="overflow-hidden pr-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-[15px] text-[#111] truncate max-w-[140px] sm:max-w-[200px]">
                        {conv.visitorName || t.anonymous}
                      </h3>
                      <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] uppercase font-bold tracking-wider">
                        {conv.visitorCompany}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-500 font-medium truncate w-full">
                      {conv.visitorBackground
                        ? `${conv.visitorBackground}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {formatTimeAgo(conv.createdAt)}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <div
                        className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md shrink-0 border
                        ${
                          (conv.status || "Waiting on you") === "Ready to send"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : (conv.status || "Waiting on you") ===
                                  "Waiting on you" || conv.status === "new"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : (conv.status || "Waiting on you") ===
                                    "Archived by AI" ||
                                  conv.status === "ignored" ||
                                  conv.status === "later"
                                ? "bg-slate-50 text-slate-500 border-slate-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {conv.status === "new"
                          ? t.waitingOnYou
                          : conv.status === "ignored" || conv.status === "later"
                            ? t.archived
                            : conv.status === "Archived by AI" ? t.archivedByAI
                            : conv.status === "Monitor later" ? t.monitorLater
                            : conv.status === "Waiting on them" ? t.waitingOnThem
                            : conv.status === "Ready to send" ? t.readyToSend
                            : conv.status === "Waiting on you" ? t.waitingOnYou
                            : conv.status || t.waitingOnYou}
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md shrink-0 border
                        ${
                          conv.priorityLevel === 1
                            ? "bg-red-50 text-red-700 border-red-100"
                            : conv.priorityLevel === 2
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span>P{conv.priorityLevel || 3}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-2 font-medium">
                  "{conv.summaryText || conv.visitorReason}"
                </p>

                <div className="mt-1 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#111] uppercase tracking-widest">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-400"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span className="truncate max-w-[150px]">
                      {conv.suggestedAction}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Detail View */}
        <div className="col-span-1 lg:col-span-8 h-[600px] lg:h-[800px] overflow-hidden bg-white border border-slate-200 rounded-[2rem] shadow-[0_2px_40px_rgb(0,0,0,0.02)] flex flex-col mb-8 relative">
          {!selectedBrief ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">
              {t.selectABrief}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                {/* Brief Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-8 mb-8">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      {t.identity}
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-[#111] tracking-tight">
                      {selectedBrief.visitorName || t.anonymous}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-[14px] mt-3">
                      {selectedBrief.visitorRole && (
                        <span className="font-medium text-slate-700">
                          {selectedBrief.visitorRole}
                        </span>
                      )}
                      {selectedBrief.visitorBackground && (
                        <span className="font-medium text-slate-700">
                          {selectedBrief.visitorBackground}
                        </span>
                      )}
                      {selectedBrief.visitorBackground &&
                        selectedBrief.visitorCompany && (
                          <span className="text-slate-300">•</span>
                        )}
                      {selectedBrief.visitorCompany && (
                        <span className="font-medium text-slate-500">
                          {selectedBrief.visitorCompany}
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-[#111]">
                        {selectedBrief.visitorIntentCategory}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedBrief.email && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 shadow-sm">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          {selectedBrief.email}
                        </div>
                      )}
                      {selectedBrief.linkedin && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 shadow-sm">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect width="4" height="12" x="2" y="9" />
                            <circle cx="4" cy="4" r="2" />
                          </svg>
                          {selectedBrief.linkedin}
                        </div>
                      )}
                      {selectedBrief.whatsapp && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 shadow-sm">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {selectedBrief.whatsapp}
                        </div>
                      )}
                      {selectedBrief.website && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 shadow-sm">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            <path d="M2 12h20" />
                          </svg>
                          {selectedBrief.website}
                        </div>
                      )}
                      {!selectedBrief.email &&
                        !selectedBrief.linkedin &&
                        !selectedBrief.whatsapp &&
                        !selectedBrief.website && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-medium text-slate-500">
                            {t.noContactInfo}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      {formatDateFull(selectedBrief.createdAt)}
                    </div>
                    <div
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest shadow-sm
                            ${
                              selectedBrief.qualificationLevel
                                ?.toLowerCase()
                                .includes("high")
                                ? "bg-[#111] text-[#D2E823]"
                                : selectedBrief.qualificationLevel
                                      ?.toLowerCase()
                                      .includes("possible")
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-white text-slate-500 border border-slate-200"
                            }`}
                    >
                      {selectedBrief.qualificationLevel || "Unclear"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-8 mb-8">
                  {/* AI Summary Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-[1rem]">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {t.whyISurfaced}
                      </h3>
                      <p className="text-[14px] text-slate-800 leading-relaxed font-semibold">
                        {selectedBrief.summaryText || t.flaggedReview}
                      </p>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-[1rem]">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {t.whyItMatters}
                      </h3>
                      <p className="text-[14px] text-slate-800 leading-relaxed font-medium">
                        {selectedBrief.whyItMatters || t.alignmentPriorities}
                      </p>
                    </div>

                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[1rem]">
                      <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>{" "}
                        {t.whatIPrepared}
                      </h3>
                      <p className="text-[14px] text-slate-800 leading-relaxed font-semibold">
                        {selectedBrief.whatAIPrepared || t.waitingInstructions}
                      </p>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-[1rem]">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {t.recommendedNextMove}
                      </h3>
                      <p className="text-[14px] text-slate-800 leading-relaxed font-medium">
                        {selectedBrief.suggestedAction ||
                          selectedBrief.requestedNextStep}
                      </p>
                    </div>
                  </div>

                  {/* Provided Context */}
                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      {t.providedContext}
                    </h3>
                    <p className="text-[14px] text-slate-500 leading-relaxed font-medium italic">
                      "{selectedBrief.visitorReason}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Sticky Actions Bar */}
              {activeDraft ? (
                <div className="shrink-0 z-10 bg-white border-t border-slate-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        {activeDraft === "meeting" ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="4"
                              rx="2"
                              ry="2"
                            />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                          </svg>
                        ) : activeDraft === "details" ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-[#111]">
                          {activeDraft === "meeting"
                            ? t.aiDraftedMeeting
                            : activeDraft === "details"
                              ? t.aiDraftedFollowUp
                              : t.aiDraftedReply}
                        </div>
                        <div className="text-[12px] text-slate-500 font-medium">
                          {t.reviewAndEdit}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4 focus-within:bg-white focus-within:border-slate-300 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px] font-bold text-slate-400 w-16">
                          {t.to}
                        </span>
                        <span className="flex-1 text-[13px] text-slate-600 font-medium">
                          {selectedBrief?.email ||
                            selectedBrief?.linkedin ||
                            t.noContactInfo}
                        </span>
                      </div>
                      <div className="h-px w-full bg-slate-200 mb-3"></div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px] font-bold text-slate-400 w-16">
                          {t.subject}
                        </span>
                        <input
                          value={editableSubject}
                          onChange={(e) => setEditableSubject(e.target.value)}
                          className="flex-1 bg-transparent border-none text-[14px] text-[#111] font-bold focus:ring-0 p-0 outline-none"
                        />
                      </div>
                      <div className="h-px w-full bg-slate-200 mb-3"></div>
                      <textarea
                        id="draft-body-textarea"
                        value={editableBody}
                        onChange={(e) => setEditableBody(e.target.value)}
                        className="w-full bg-transparent border-none text-[14px] text-slate-700 leading-relaxed font-medium resize-none focus:ring-0 p-0 outline-none min-h-[140px]"
                      />
                    </div>
                    <div className="text-[12px] text-slate-500 font-medium mb-6">
                      <span className="font-bold text-[#111]">
                        {t.suggestedNextStep}
                      </span>{" "}
                      {draftContent?.suggestedNextStep}
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        onClick={() => setActiveDraft(null)}
                        className="bg-transparent hover:bg-slate-50 text-slate-500 rounded-xl px-6 h-10 font-bold text-[14px]"
                        disabled={isSending || emailSent}
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        onClick={handleCopy}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 h-10 font-bold text-[14px] shadow-sm"
                        disabled={isSending || emailSent}
                      >
                        {copied ? t.copied : t.copy}
                      </Button>
                      {selectedBrief?.email && (
                        <Button
                          onClick={async () => {
                            setIsSending(true);
                            // Simulate email delivery
                            await new Promise((r) => setTimeout(r, 1200));
                            setIsSending(false);
                            setEmailSent(true);
                            setTimeout(() => {
                              setEmailSent(false);
                              setActiveDraft(null);
                              handleUpdateStatus("replied");
                            }, 1500);
                          }}
                          className={`${emailSent ? "bg-indigo-600 hover:bg-indigo-700" : "bg-[#111] hover:bg-slate-800"} text-white rounded-xl px-6 h-10 font-bold text-[14px] transition-all`}
                          disabled={isSending || emailSent}
                        >
                          {emailSent
                            ? t.emailSent
                            : isSending
                              ? t.sending
                              : t.sendEmail}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="shrink-0 z-10 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-6 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        const draft = getDraftContent(selectedBrief, "reply");
                        setEditableSubject(draft?.subject || "");
                        setEditableBody(draft?.body || "");
                        setActiveDraft("reply");
                      }}
                      className="bg-[#111] hover:bg-slate-800 text-white rounded-xl px-6 h-12 font-bold text-[14px]"
                    >
                      {t.replyByEmail}
                    </Button>
                    <Button
                      onClick={() => {
                        const draft = getDraftContent(selectedBrief, "meeting");
                        setEditableSubject(draft?.subject || "");
                        setEditableBody(draft?.body || "");
                        setActiveDraft("meeting");
                      }}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 h-12 font-bold text-[14px] shadow-sm"
                    >
                      {t.sendMeetingLink}
                    </Button>
                    <Button
                      onClick={() => {
                        const draft = getDraftContent(selectedBrief, "details");
                        setEditableSubject(draft?.subject || "");
                        setEditableBody(draft?.body || "");
                        setActiveDraft("details");
                      }}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 h-12 font-bold text-[14px] shadow-sm"
                    >
                      {t.askForMoreDetails}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateStatus("Monitor later")}
                      className="bg-transparent hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl px-5 h-12 font-bold text-[14px]"
                    >
                      {t.monitorLaterAction}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus("Archived by AI")}
                      className="bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl px-5 h-12 font-bold text-[14px]"
                    >
                      {t.archiveAction}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
