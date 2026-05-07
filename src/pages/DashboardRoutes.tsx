import { Link, Routes, Route, useLocation } from "react-router-dom";
import Inbox from "./Inbox";
import Contacts from "./Contacts";
import VisitorDetail from "./VisitorDetail";
import SettingsPage from "./Settings";
import Upgrade from "./Upgrade";
import { Copy, InboxIcon, Settings, User, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  en: {
    dashboard: "Dashboard",
    overview: "Overview",
    inbox: "Inbox",
    contacts: "Contacts",
    upgrade: "Upgrade",
    settings: "Settings",
    yourBusinessEntrance: "Your Business Entrance",
    copyLink: "Copy Link",
    creditsRemaining: "Credits Remaining",
    plan: "Plan",
    inboxItems: "Inbox Items",
    requireReview: "Require your review",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    hereIsWhatCameIn: "Here is what came in while you were away.",
    totalToday: "Total today",
    worthAttention: "Worth your attention",
    canBeIgnored: "Can be ignored",
    handleToday: "Handle today",
    handleThisWeek: "Handle this week",
    show: "Show",
    reason: "Reason",
    theOneThing: "The one thing worth doing today",
    reviewAndApprove: "Review and approve David Chen's media response.",
    techCrunchReason: "This TechCrunch piece is publishing next week. Since it aligns with your broader PR goals for Q3, I prioritized it. The drafted reponse requires exactly two clicks from you.",
    reviewDraft: "Review Draft",
    askForDetails: "Ask for Details",
    scheduleIntro: "Schedule Intro",
    standardOutreaches: (count: number) => `${count} standard outreaches deprioritized`,

    // Mock data elements
    roleJournalist: "Journalist",
    roleFounder: "Founder",
    roleProductLead: "Product Lead",
    roleSDR: "SDR",
    roleRecruiter: "Recruiter",
    companyTechCrunch: "TechCrunch",
    companyAcme: "Acme Corp (VC-backed)",
    companyDataSync: "DataSync Solutions",
    companyLeadGen: "LeadGenPro",
    companyTechTalent: "TechTalent",
    summaryTechCrunch: "Writing a piece on AI workflows, publishing next week.",
    summaryAcme: "Seeking a strategic launch partner for their new API platform.",
    summaryDataSync: "Interested in integrating our AI features into their product.",
    summaryLeadGen: "Pitching outbound lead generation services.",
    summaryTechTalent: "Sourcing for a senior engineering role.",
    relevanceHighSignal: "High Signal",
    relevanceStrategicSense: "Strategic Context",
    relevancePotentialInt: "Potential Integration",
    timePubNextWeek: "Publishing Next Week",
    timeLaunchImminent: "Launch Imminent",
    timeNoDeadline: "No immediate deadline",
    recTechCrunch: "I drafted a response using your previous quotes on founder productivity. Ready to review.",
    recAcme: "High alignment with your Q3 distribution goals. I suggest accepting a 15-minute intro.",
    recDataSync: "A bit vague. I recommend asking for technical documentation before committing to a meeting.",
    deprioritizeLeadGen: "Cold sales pitch. We are not evaluating this right now.",
    deprioritizeTechTalent: "Generic mass outreach."
  },
  zh: {
    dashboard: "仪表盘",
    overview: "概览",
    inbox: "收件箱",
    contacts: "联系人",
    upgrade: "升级",
    settings: "设置",
    yourBusinessEntrance: "企业入口",
    copyLink: "复制链接",
    creditsRemaining: "剩余积分",
    plan: "计划",
    inboxItems: "待办事项",
    requireReview: "需要您审阅",
    goodMorning: "早上好",
    goodAfternoon: "下午好",
    goodEvening: "晚上好",
    hereIsWhatCameIn: "这是您不在时收到的内容。",
    totalToday: "今日总计",
    worthAttention: "值得关注",
    canBeIgnored: "可忽略",
    handleToday: "今日处理",
    handleThisWeek: "本周处理",
    show: "显示",
    reason: "原因",
    theOneThing: "今天最值得做的一件事",
    reviewAndApprove: "审阅并批准 David Chen 的媒体回复。",
    techCrunchReason: "这篇 TechCrunch 报道将于下周发布。因为它符合您第三季度的更广泛公关目标，所以我将它优先处理了。草拟的回复只需您点击两次即可。",
    reviewDraft: "审阅草稿",
    askForDetails: "询问详情",
    scheduleIntro: "安排介绍会议",
    standardOutreaches: (count: number) => `${count} 个标准跟发已被降级优先处理`,

    // Mock data elements
    roleJournalist: "记者",
    roleFounder: "创始人",
    roleProductLead: "产品负责人",
    roleSDR: "销售代表",
    roleRecruiter: "招聘专员",
    companyTechCrunch: "TechCrunch",
    companyAcme: "Acme Corp（有风投支持）",
    companyDataSync: "DataSync Solutions",
    companyLeadGen: "LeadGenPro",
    companyTechTalent: "TechTalent",
    summaryTechCrunch: "正在撰写一篇关于AI工作流的文章，预计下周发布。",
    summaryAcme: "正在寻找其新API平台的战略合作伙伴。",
    summaryDataSync: "有意向在他们的产品中集成我们的AI功能。",
    summaryLeadGen: "主动推销客户挖掘开发服务。",
    summaryTechTalent: "正在为高级工程职位寻找人才。",
    relevanceHighSignal: "高价值信号",
    relevanceStrategicSense: "战略背景",
    relevancePotentialInt: "潜在集成",
    timePubNextWeek: "下周发布",
    timeLaunchImminent: "即将发布",
    timeNoDeadline: "无紧急日期",
    recTechCrunch: "我使用了您之前关于创始人效率的名言草拟了回复，现可供审阅。",
    recAcme: "非常符合您第三季度的分销目标。我建议接受一个15分钟的介绍会议。",
    recDataSync: "描述稍显模糊。我建议在同意会议之前要求提供技术文档。",
    deprioritizeLeadGen: "冷推销邮件。我们目前并未评估此类服务。",
    deprioritizeTechTalent: "群发型的招聘触达。"
  },
};

function DashboardHome() {
  const [profile, setProfile] = useState<any>(null);
  const { language } = useLanguage();
  const [showIgnored, setShowIgnored] = useState(false);
  const t =
    translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  const name = profile?.name?.split(" ")[0] || "Ricky";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;
    return t.goodEvening;
  };

  const highPriority = [
    {
      id: "1",
      name: "David Chen",
      role: t.roleJournalist,
      company: t.companyTechCrunch,
      summary: t.summaryTechCrunch,
      relevance: t.relevanceHighSignal,
      timeSensitivity: t.timePubNextWeek,
      recommendation: t.recTechCrunch,
      hasDraft: true,
    },
    {
      id: "2",
      name: "Sarah Jenkins",
      role: t.roleFounder,
      company: t.companyAcme,
      summary: t.summaryAcme,
      relevance: t.relevanceStrategicSense,
      timeSensitivity: t.timeLaunchImminent,
      recommendation: t.recAcme,
      hasDraft: false,
      suggestedAction: t.scheduleIntro,
    },
  ];

  const mediumPriority = [
    {
      id: "3",
      name: "Mark T.",
      role: t.roleProductLead,
      company: t.companyDataSync,
      summary: t.summaryDataSync,
      relevance: t.relevancePotentialInt,
      timeSensitivity: t.timeNoDeadline,
      recommendation: t.recDataSync,
      suggestedAction: t.askForDetails,
    },
  ];

  const lowPriority = [
    {
      id: "4",
      name: "James Harrison",
      role: t.roleSDR,
      company: t.companyLeadGen,
      summary: t.summaryLeadGen,
      deprioritizeReason: t.deprioritizeLeadGen,
    },
    {
      id: "5",
      name: "Emma W.",
      role: t.roleRecruiter,
      company: t.companyTechTalent,
      summary: t.summaryTechTalent,
      deprioritizeReason: t.deprioritizeTechTalent,
    },
  ];

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-2 pb-20">
      {/* Top Section - Greeting & Summary */}
      <div className="space-y-6">
        <h1 className="text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 tracking-tight">
          {getGreeting()}, {name}. <br />
          <span className="text-slate-500 font-medium text-[24px]">
            {t.hereIsWhatCameIn}
          </span>
        </h1>

        <div className="flex items-center gap-6 text-[14px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">5</span>
            <span className="text-slate-500 font-medium">{t.totalToday}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-600">3</span>
            <span className="text-indigo-600/80 font-medium">
              {t.worthAttention}
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">2</span>
            <span className="text-slate-400 font-medium">{t.canBeIgnored}</span>
          </div>
        </div>
      </div>

      {/* Priority Layers */}
      <div className="space-y-10">
        {/* Layer 1: Handle today */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">
              {t.handleToday}
            </h2>
          </div>
          <div className="space-y-4">
            {highPriority.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                <div className="flex-1 space-y-2 pl-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-slate-900">
                      {item.name}
                    </span>
                    <span className="text-[13px] text-slate-500 font-medium">
                      {item.role}, {item.company}
                    </span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.timeSensitivity}
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-700 font-medium">
                    {item.summary}
                  </p>
                  <p className="text-[13px] text-indigo-700/80 font-medium flex items-start gap-2 pt-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0 mt-0.5"
                    >
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    {item.recommendation}
                  </p>
                </div>
                <div className="shrink-0 flex items-center justify-end w-full md:w-auto mt-2 md:mt-0">
                  {item.hasDraft ? (
                    <Link
                      to="/dashboard/inbox"
                      className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-10 text-[13px] font-bold shadow-sm transition-colors"
                    >
                      {t.reviewDraft}
                      <span className="ml-2 text-[9px] font-bold uppercase tracking-wider bg-indigo-500 text-indigo-50 px-1.5 py-0.5 rounded">
                        Pro
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/inbox"
                      className="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-5 h-10 text-[13px] font-bold shadow-sm transition-colors"
                    >
                      {item.suggestedAction}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 2: Handle this week */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">
              {t.handleThisWeek}
            </h2>
          </div>
          <div className="space-y-4">
            {mediumPriority.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-amber-100/50 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-300"></div>
                <div className="flex-1 space-y-2 pl-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-slate-900">
                      {item.name}
                    </span>
                    <span className="text-[13px] text-slate-500 font-medium">
                      {item.role}, {item.company}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-100">
                      {item.relevance}
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-700 font-medium">
                    {item.summary}
                  </p>
                  <p className="text-[13px] text-slate-500 font-medium flex items-start gap-2 pt-1 border-t border-slate-100 mt-2">
                    <span className="shrink-0 mt-0.5">↳</span>
                    {item.recommendation}
                  </p>
                </div>
                <div className="shrink-0">
                  <Link
                    to="/dashboard/inbox"
                    className="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-5 h-10 text-[13px] font-bold transition-colors"
                  >
                    Ask for Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 3: Can be ignored */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
              {t.canBeIgnored}
            </h2>
          </div>

          {!showIgnored ? (
            <button
              onClick={() => setShowIgnored(true)}
              className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-2xl p-4 flex items-center justify-between transition-colors"
            >
              <span className="text-[14px] text-slate-500 font-medium">
                {typeof t.standardOutreaches === 'function' ? t.standardOutreaches(2) : "2 standard outreaches deprioritized"}
              </span>
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                {t.show}
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              {lowPriority.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[14px] font-semibold text-slate-600">
                      {item.name}
                    </span>
                    <span className="text-[13px] text-slate-400">
                      {item.role}, {item.company}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 mb-2">
                    {item.summary}
                  </p>
                  <p className="text-[12px] font-medium text-slate-400">
                    {t.reason}: {item.deprioritizeReason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Secretary Recommendation */}
      <div className="pt-8">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          {t.theOneThing}
        </h2>
        <div className="bg-[#111] rounded-[2rem] p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {t.reviewAndApprove}
            </h3>
            <p className="text-[14px] text-slate-400 font-medium max-w-xl">
              {t.techCrunchReason}
            </p>
          </div>
          <Link
            to="/dashboard/inbox"
            className="shrink-0 inline-flex items-center justify-center bg-[#D2E823] hover:bg-[#c1d61e] text-[#111] rounded-xl px-6 h-12 text-[14px] font-bold shadow-sm transition-colors w-full md:w-auto"
          >
            {t.reviewDraft}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardRoutes() {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const t =
    translations[language as keyof typeof translations] || translations.en;

  const navItemClass = (path: string) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
      location.pathname === path
        ? "bg-slate-900 text-white shadow-md"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="px-2 py-6 mb-4 font-bold text-2xl text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
          Liais.AI
        </div>
        <div className="space-y-2 flex-1">
          <Link to="/dashboard" className={navItemClass("/dashboard")}>
            <User className="w-5 h-5" /> <span>{t.overview}</span>
          </Link>
          <Link
            to="/dashboard/inbox"
            className={navItemClass("/dashboard/inbox")}
          >
            <InboxIcon className="w-5 h-5" /> <span>{t.inbox}</span>
          </Link>
          <Link
            to="/dashboard/contacts"
            className={navItemClass("/dashboard/contacts")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>{" "}
            <span>{t.contacts}</span>
          </Link>
          <Link
            to="/dashboard/upgrade"
            className={navItemClass("/dashboard/upgrade")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>{" "}
            <span>{t.upgrade}</span>
          </Link>
          <Link
            to="/dashboard/settings"
            className={navItemClass("/dashboard/settings")}
          >
            <Settings className="w-5 h-5" /> <span>{t.settings}</span>
          </Link>
        </div>
        <div className="pt-4 border-t border-slate-200 mt-auto">
          <button
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-slate-500 hover:bg-slate-100"
          >
            <Globe className="w-5 h-5" />
            <span>{language === "en" ? "中文" : "English"}</span>
          </button>
        </div>
      </div>
      <div className="flex-1 p-12 max-w-6xl mx-auto overflow-y-auto h-screen">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:id" element={<VisitorDetail />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}
