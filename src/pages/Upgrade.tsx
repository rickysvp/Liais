import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  en: {
    title: "Upgrade your Liaison",
    subtitle:
      "Unlock more AI capabilities, increased limits, and deep calendar integration to fully automate your inbound screening.",
    professional: "Professional",
    proDesc: "For independent creators and founders",
    perMonth: "per month",
    proFeature1: "200 AI Screenings per month",
    proFeature2: "Auto-drafted replies and calendar invites",
    proFeature3: "Custom secretary tone and instructions",
    proFeature4: "Premium domain link (liais.ai/you)",
    upgradePro: "Upgrade to Professional",
    business: "Business",
    bizDesc: "For high-volume teams and executives",
    bizFeature1: "1,000 AI Screenings per month",
    bizFeature2: "Automated Webhook Hand-off (Zapier, Make)",
    bizFeature3: "Custom branding and whitelabeling",
    bizFeature4: "Priority concierge support",
    contactSales: "Contact Sales",
    currentPlan: "Your current plan is",
    free: "Free",
    creditsRemaining: "You have 8 credits remaining this month.",
  },
  zh: {
    title: "升级您的 Liaison",
    subtitle:
      "解锁更多 AI 能力、提高额度限制并深度集成日历，全面自动化您的收件箱筛选。",
    professional: "专业版",
    proDesc: "适合独立创作者和创始人",
    perMonth: "每月",
    proFeature1: "每月 200 次 AI 筛选",
    proFeature2: "自动起草回复和日历邀请",
    proFeature3: "自定义秘书语气和指令",
    proFeature4: "高级域名链接 (liais.ai/you)",
    upgradePro: "升级至专业版",
    business: "企业版",
    bizDesc: "适合高容量团队和高管",
    bizFeature1: "每月 1,000 次 AI 筛选",
    bizFeature2: "自动化 Webhook 移交 (Zapier, Make)",
    bizFeature3: "自定义品牌和白标",
    bizFeature4: "优先专属客服支持",
    contactSales: "联系销售",
    currentPlan: "您当前的计划是",
    free: "免费版",
    creditsRemaining: "本月还剩 8 个可用积分。",
  },
};

export default function Upgrade() {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="flex flex-col pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto mb-12">
      <div className="mb-10 lg:mb-16">
        <h1 className="text-3xl font-bold font-serif text-[#111] tracking-tight">
          {t.title}
        </h1>
        <p className="text-slate-500 text-[15px] mt-3 max-w-2xl leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Pro Plan */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-[0_2px_40px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden group hover:border-[#111] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#111]"></div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#111] mb-2 tracking-tight">
                {t.professional}
              </h2>
              <p className="text-[13px] text-slate-500 font-medium">
                {t.proDesc}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-[#111]">$29</span>
              <span className="text-[13px] text-slate-400 font-medium block">
                {t.perMonth}
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.proFeature1}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.proFeature2}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.proFeature3}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.proFeature4}
              </span>
            </li>
          </ul>

          <Button className="w-full bg-[#111] hover:bg-slate-800 text-white rounded-xl h-12 text-[14px] font-bold shadow-md transition-transform group-hover:scale-[1.02]">
            {t.upgradePro}
          </Button>
        </div>

        {/* Business Plan */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-[0_2px_40px_rgb(0,0,0,0.02)] flex flex-col relative overflow-hidden group hover:border-[#111] hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#111] mb-2 tracking-tight">
                {t.business}
              </h2>
              <p className="text-[13px] text-slate-500 font-medium">
                {t.bizDesc}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-[#111]">$99</span>
              <span className="text-[13px] text-slate-400 font-medium block">
                {t.perMonth}
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.bizFeature1}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.bizFeature2}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.bizFeature3}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-slate-700 font-medium">
                {t.bizFeature4}
              </span>
            </li>
          </ul>

          <Button className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl h-12 text-[14px] font-bold shadow-sm transition-transform group-hover:scale-[1.02]">
            {t.contactSales}
          </Button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[13px] text-slate-400 font-medium">
          {t.currentPlan}{" "}
          <span className="text-slate-700 font-bold">{t.free}</span>.{" "}
          {t.creditsRemaining}
        </p>
      </div>
    </div>
  );
}
