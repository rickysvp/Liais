import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Zap, Shield, Globe, Clock, CheckCircle2, ArrowRight, TrendingUp, HelpCircle, CreditCard, Receipt, ExternalLink, RefreshCw, ShoppingCart, Coins } from "lucide-react";
import { authHeaders, jsonHeaders } from "../lib/api";

const translations = {
  en: {
    title: "Billing & Subscriptions",
    subtitle: "Manage your executive intelligence resources, settlement history, and operational tiers.",
    billingTitle: "Billing Ledger",
    billingStatus: "Account Status",
    billingActive: "Operational / Active",
    billingNext: "Next Synchronization",
    billingMethod: "Settlement Method",
    creditTitle: "Intelligence Credits",
    creditDesc: "Immediate reload for high-volume screening periods.",
    reloadButton: "Purchase Credits",
    tiersTitle: "Intelligence Tiers",
    free: "Free Engine",
    freeDesc: "Core screening for personal use",
    premium: "Premium",
    premiumDesc: "Advanced automation for elite founders",
    business: "Business",
    bizDesc: "High-precision logic for executive teams",
    perMonth: "/ month",
    upgradePremium: "Elevate to Premium",
    contactSales: "Deploy Business",
    usage: "Resource Consumption",
    faqTitle: "Intelligence FAQ",
  },
  zh: {
    title: "账单与订阅",
    subtitle: "管理您的执行官情报资源、结算历史和运行等级。",
    billingTitle: "账务清单",
    billingStatus: "账户状态",
    billingActive: "运行中 / 已激活",
    billingNext: "下一次同步",
    billingMethod: "结算方式",
    creditTitle: "情报积分充值",
    creditDesc: "为高流量筛选时期提供即时资源补充。",
    reloadButton: "购买积分",
    tiersTitle: "运行等级切换",
    free: "免费引擎",
    freeDesc: "个人使用的核心筛选功能",
    premium: "高级版",
    premiumDesc: "为精英创始人提供的进阶自动化",
    business: "企业版",
    bizDesc: "为高管团队提供的高精度逻辑",
    perMonth: "/ 每月",
    upgradePremium: "升级至高级版",
    contactSales: "部署企业版",
    usage: "资源消耗情况",
    faqTitle: "情报常见问题",
  },
};

const FAQ_ITEMS = {
  en: [
    { q: "How does the AI credit system work?", a: "Each credit represents one complete analysis of an inbound visitor, including intent detection and summary generation." },
    { q: "Can I change plans mid-cycle?", a: "Yes, upgrades are processed immediately with pro-rated adjustments applied to your next settlement." },
    { q: "What happens if I exceed my limit?", a: "Your secretary will transition to a basic 'Queue Mode' until the next cycle or a tier upgrade is initiated." }
  ],
  zh: [
    { q: "AI 积分系统是如何运作的？", a: "每一个积分代表对一名访客的完整分析，包括意图识别和摘要生成。" },
    { q: "我可以在周期中更换计划吗？", a: "可以，升级会立即生效，差额将按比例在下一次结算中调整。" },
    { q: "如果超过限额会发生什么？", a: "您的秘书将转入基础的“排队模式”，直到下一个周期开始或进行等级升级。" }
  ]
};

export default function Upgrade() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'zh';
  const t = translations[lang] || translations.en;
  const faqs = FAQ_ITEMS[lang] || FAQ_ITEMS.en;
  const [billing, setBilling] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/summary", { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then(setBilling)
      .catch(() => setBilling(null));
  }, []);

  const creditTotal = (billing?.monthlyCredits || 0) + (billing?.purchasedCredits || 0);
  const availableCredits = billing?.availableCredits || 0;
  const usedCredits = Math.max(0, creditTotal - availableCredits);
  const usagePercent = creditTotal > 0 ? Math.min(100, Math.round((usedCredits / creditTotal) * 100)) : 0;
  const renewalDate = billing?.currentPeriodEnd
    ? new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(billing.currentPeriodEnd))
    : "Not scheduled";

  const startCheckout = async (priceLookupKey: string) => {
    setLoadingAction(priceLookupKey);
    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ priceLookupKey }),
      });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
    } finally {
      setLoadingAction(null);
    }
  };

  const openPortal = async () => {
    setLoadingAction("portal");
    try {
      const res = await fetch("/api/billing/portal-session", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
    } finally {
      setLoadingAction(null);
    }
  };

  const Metric = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-xl font-black text-slate-900">{value}</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      
      {/* Executive Header */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10 shadow-sm">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Receipt className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-serif font-black text-[#111] tracking-tighter leading-none">{t.title}</h1>
           </div>
           <p className="text-slate-500 text-[15px] font-medium max-w-xl italic">
             {t.subtitle}
           </p>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-6 flex flex-col gap-4 shadow-sm min-w-[320px]">
           <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">{t.usage}</span>
              <span className="px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                 {billing?.status || "Inactive"}
              </span>
           </div>
           <div className="grid grid-cols-2 gap-8">
              <Metric label="Current Plan" value={billing?.planName || "Free"} />
              <Metric label="AI Credits" value={`${availableCredits}`} />
           </div>
           <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <span>{usedCredits} / {creditTotal || 0} Credits</span>
                 <span>{usagePercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                 <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${usagePercent}%` }} />
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-10 py-12 space-y-16">
        
        {/* 1. Billing Ledger (PRIORITY) */}
        <section className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm space-y-10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                   <CreditCard className="w-4 h-4 text-slate-900" />
                 </div>
                 <h2 className="text-2xl font-serif font-black text-[#111]">{t.billingTitle}</h2>
              </div>
              <button onClick={openPortal} disabled={loadingAction === "portal"} className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all group disabled:opacity-50">
                 Billing Portal <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.billingStatus}</span>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[16px] font-bold text-slate-900">{billing?.status || "inactive"}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.billingNext}</span>
                 <span className="text-[16px] font-bold text-slate-900">{renewalDate}</span>
              </div>
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.billingMethod}</span>
                 <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-[16px] font-bold text-slate-900">Managed in Stripe</span>
                 </div>
              </div>
           </div>
        </section>

        {/* 2. Credit Reload (NEW) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-4 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D2E823]/10 rounded-full blur-[60px] -mr-10 -mt-10"></div>
              <div>
                 <div className="flex items-center gap-3 mb-6">
                    <Coins className="w-6 h-6 text-[#D2E823]" />
                    <h2 className="text-2xl font-serif font-black">{t.creditTitle}</h2>
                 </div>
                 <p className="text-slate-400 text-[14px] font-medium leading-relaxed">
                   {t.creditDesc}
                 </p>
              </div>
              <button onClick={() => startCheckout("credit_pack_small")} disabled={loadingAction === "credit_pack_small"} className="mt-10 w-full h-14 bg-[#D2E823] text-slate-900 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-60">
                 {loadingAction === "credit_pack_small" ? "Opening Stripe..." : t.reloadButton}
              </button>
           </div>

           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { amount: "25", price: "$19", color: "bg-slate-100", key: "credit_pack_small" },
                { amount: "100", price: "$79", color: "bg-slate-100 border-2 border-slate-900", key: "credit_pack_medium" },
              ].map((pack, i) => (
                <button key={i} onClick={() => startCheckout(pack.key)} disabled={loadingAction === pack.key} className={`p-8 rounded-[32px] flex flex-col items-center justify-center gap-2 group hover:bg-white hover:shadow-xl transition-all cursor-pointer disabled:opacity-60 ${pack.color}`}>
                   <span className="text-3xl font-black text-slate-900">{pack.amount}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Credits</span>
                   <div className="text-xl font-bold text-slate-900">{pack.price}</div>
                </button>
              ))}
           </div>
        </section>

        {/* 3. Subscription Tiers */}
        <div className="space-y-8">
           <h2 className="text-2xl font-serif font-black text-[#111] px-2">{t.tiersTitle}</h2>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Free Tier */}
             <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm flex flex-col group hover:border-slate-400 transition-all">
               <div className="mb-8">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Base</h3>
                 <h2 className="text-3xl font-serif font-black text-[#111] mb-2">{t.free}</h2>
                 <p className="text-[13px] text-slate-500 font-medium">{t.freeDesc}</p>
               </div>
               <div className="text-4xl font-black text-[#111] mb-8">$0</div>
               <button className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl font-black text-[12px] uppercase tracking-widest cursor-default mt-auto">
                 Current Tier
               </button>
             </div>

             {/* Premium Tier */}
             <div className="bg-white border-2 border-slate-900 rounded-[40px] p-8 shadow-xl flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all">
               <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#D2E823] text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">Recommended</div>
               <div className="mb-8">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Growth</h3>
                 <h2 className="text-3xl font-serif font-black text-[#111] mb-2">{t.premium}</h2>
                 <p className="text-[13px] text-slate-500 font-medium">{t.premiumDesc}</p>
               </div>
               <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-4xl font-black text-[#111]">$29</span>
                 <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{t.perMonth}</span>
               </div>
               <button onClick={() => startCheckout("starter_monthly")} disabled={loadingAction === "starter_monthly"} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg mt-auto disabled:opacity-60">
                 {t.upgradePremium} <Zap className="w-3.5 h-3.5 text-[#D2E823]" />
               </button>
             </div>

             {/* Business Tier */}
             <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -mr-10 -mt-10"></div>
               <div className="relative z-10 flex flex-col h-full">
                 <div className="mb-8">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Scale</h3>
                   <h2 className="text-3xl font-serif font-black text-white mb-2">{t.business}</h2>
                   <p className="text-[13px] text-slate-400 font-medium">{t.bizDesc}</p>
                 </div>
                 <div className="flex items-baseline gap-1 mb-8">
                   <span className="text-4xl font-black text-[#D2E823]">$99</span>
                   <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">{t.perMonth}</span>
                 </div>
                 <button onClick={() => startCheckout("pro_monthly")} disabled={loadingAction === "pro_monthly"} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-lg mt-auto disabled:opacity-60">
                   {t.contactSales} <ArrowRight className="w-3.5 h-3.5" />
                 </button>
               </div>
             </div>
           </div>
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 border-t border-slate-100">
          <div className="lg:col-span-4">
             <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-6 h-6 text-slate-900" />
                <h2 className="text-2xl font-serif font-black text-[#111]">{t.faqTitle}</h2>
             </div>
             <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
               Common inquiries regarding our intelligence engine and subscription model.
             </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
             {faqs.map((faq, i) => (
               <div key={i} className="space-y-3">
                  <h4 className="text-[15px] font-black text-[#111] tracking-tight">{faq.q}</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{faq.a}</p>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
