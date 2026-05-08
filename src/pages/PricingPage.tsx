import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  en: {
    pricingTitle: "Simple, predictable pricing",
    pricingSubtitle: "Invest in your inbound workflow. No hidden fees.",
    freeLabel: "Free",
    freeDesc: "Perfect to test the waters",
    perMonth: "/month",
    freeFeature1: "10 Credits / month",
    freeFeature2: "Basic AI Visitor Intake",
    freeFeature3: "AI Structured Summaries",
    freeFeature4: "Standard Profile",
    currentPlan: "Current Plan",
    proLabel: "Pro",
    proDesc: "For growing professionals",
    proFeature1: "200 Credits / month",
    proFeature2: "Everything in Free",
    proFeature3: "Reply Generation",
    proFeature4: "Deep Qualification analysis",
    proFeature5: "Custom AI Secretary Tone",
    upgradeToPro: "Upgrade to Pro",
    bizLabel: "Business",
    bizDesc: "For intense inbound volume",
    bizFeature1: "1000 Credits / month",
    bizFeature2: "Everything in Pro",
    bizFeature3: "Advanced Executive Briefs",
    bizFeature4: "Webhook Hand-off",
    bizFeature5: "Priority Support",
    upgradeToBiz: "Upgrade to Business",
  },
  zh: {
    pricingTitle: "简单可预测的定价",
    pricingSubtitle: "投资您的收站工作流。没有隐藏费用。",
    freeLabel: "免费版",
    freeDesc: "完美体验水温的入门之选",
    perMonth: "/月",
    freeFeature1: "每月 10 个积分",
    freeFeature2: "基础 AI 访客接入",
    freeFeature3: "AI 结构化摘要",
    freeFeature4: "标准个人档案",
    currentPlan: "当前计划",
    proLabel: "专业版",
    proDesc: "针对成长中的专业人士",
    proFeature1: "每月 200 个积分",
    proFeature2: "包含所有免费版功能",
    proFeature3: "代写回复",
    proFeature4: "深度资格评估",
    proFeature5: "自定义 AI 秘书语气",
    upgradeToPro: "升级至专业版",
    bizLabel: "企业版",
    bizDesc: "针对密集的咨询流量",
    bizFeature1: "每月 1000 个积分",
    bizFeature2: "包含所有专业版功能",
    bizFeature3: "高级高管简报",
    bizFeature4: "Webhook 转接人工/外部工具",
    bizFeature5: "优先支持",
    upgradeToBiz: "升级至企业版",
  }
};

export default function PricingPage() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t.pricingTitle}</h1>
        <p className="text-xl text-slate-600">{t.pricingSubtitle}</p>
      </div>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">{t.freeLabel}</CardTitle>
            <CardDescription>{t.freeDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-slate-500">{t.perMonth}</span>
            </div>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>{t.freeFeature1}</li>
              <li>{t.freeFeature2}</li>
              <li>{t.freeFeature3}</li>
              <li>{t.freeFeature4}</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">{t.currentPlan}</Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col border-blue-200 shadow-blue-100 shadow-xl relative scale-105">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-xl"></div>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">{t.proLabel}</CardTitle>
            <CardDescription>{t.proDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-slate-500">{t.perMonth}</span>
            </div>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>{t.proFeature1}</li>
              <li>{t.proFeature2}</li>
              <li>{t.proFeature3}</li>
              <li>{t.proFeature4}</li>
              <li>{t.proFeature5}</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">{t.upgradeToPro}</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">{t.bizLabel}</CardTitle>
            <CardDescription>{t.bizDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-slate-500">{t.perMonth}</span>
            </div>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>{t.bizFeature1}</li>
              <li>{t.bizFeature2}</li>
              <li>{t.bizFeature3}</li>
              <li>{t.bizFeature4}</li>
              <li>{t.bizFeature5}</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">{t.upgradeToBiz}</Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
