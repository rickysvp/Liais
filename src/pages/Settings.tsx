import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  en: {
    settingsSaved: "Settings saved!",
    errorPrefix: "Error: ",
    failedToSave: "Failed to save settings",
    loadingSettings: "Loading settings...",
    settingsTitle: "Settings",
    profileDetails: "Profile Details",
    displayName: "Display Name",
    headline: "Headline",
    aiSecretaryIntro: "AI Secretary Intro",
    welcomeMessage: "Welcome Message",
    secretaryWorkBoundaries: "Secretary Work Boundaries",
    boundariesDesc: "Define what your AI secretary should or should not discuss, and how they should share information.",
    categoryPlaceholder: "Category (e.g. Salary, Technical details)",
    ruleValuePlaceholder: "Rule value (e.g. Never discuss exact compensation figures...)",
    visibilityPublic: "Public",
    visibilityRestricted: "Restricted",
    visibilityHandoffTrigger: "Handoff Trigger",
    visibilityNeverShare: "Never Share",
    remove: "Remove",
    addBoundaryRule: "+ Add Boundary Rule",
    connectionPreferences: "Connection Preferences",
    primaryGoal: "Primary Goal",
    openContactScope: "Open Contact Scope",
    saving: "Saving...",
    saveSettings: "Save Settings",
  },
  zh: {
    settingsSaved: "设置已保存！",
    errorPrefix: "错误：",
    failedToSave: "保存设置失败",
    loadingSettings: "正在加载设置...",
    settingsTitle: "设置",
    profileDetails: "个人资料详情",
    displayName: "显示名称",
    headline: "简介信息",
    aiSecretaryIntro: "AI 秘书介绍",
    welcomeMessage: "欢迎消息",
    secretaryWorkBoundaries: "秘书工作边界",
    boundariesDesc: "定义您的 AI 秘书应该或不应该讨论的内容，以及他们应如何分享信息。",
    categoryPlaceholder: "类别（例如：薪资、技术细节）",
    ruleValuePlaceholder: "规则值（例如：从不讨论具体的薪酬数字...）",
    visibilityPublic: "公开",
    visibilityRestricted: "受限",
    visibilityHandoffTrigger: "触发人工转接",
    visibilityNeverShare: "从不分享",
    remove: "移除",
    addBoundaryRule: "+ 添加边界规则",
    connectionPreferences: "联系偏好",
    primaryGoal: "主要目标",
    openContactScope: "开放联系范围",
    saving: "保存中...",
    saveSettings: "保存设置",
  }
};

export default function Settings() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [profile, setProfile] = useState<any>(null);
  const [boundaries, setBoundaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        if (data.boundaries) {
          setBoundaries(data.boundaries);
        }
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...profile,
          boundaries
        })
      });
      if (res.ok) {
        alert(t.settingsSaved);
      } else {
        const err = await res.json();
        alert(t.errorPrefix + err.error);
      }
    } catch (e) {
      console.error(e);
      alert(t.failedToSave);
    } finally {
      setLoading(false);
    }
  };

  const addBoundary = () => {
    setBoundaries([...boundaries, { category: "", value: "", visibilityType: "public" }]);
  };

  const updateBoundary = (index: number, field: string, value: string) => {
    const newBoundaries = [...boundaries];
    newBoundaries[index][field] = value;
    setBoundaries(newBoundaries);
  };

  const removeBoundary = (index: number) => {
    setBoundaries(boundaries.filter((_, i) => i !== index));
  };

  if (!profile) return <div className="p-8 text-slate-500">{t.loadingSettings}</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">{t.settingsTitle}</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold">{t.profileDetails}</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.displayName}</label>
          <Input 
            value={profile.displayName || ""} 
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.headline}</label>
          <Input 
            value={profile.headline || ""} 
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.aiSecretaryIntro}</label>
          <Textarea 
            value={profile.generatedIntro || ""} 
            onChange={(e) => setProfile({ ...profile, generatedIntro: e.target.value })} 
            rows={3} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.welcomeMessage}</label>
          <Textarea 
            value={profile.generatedWelcomeMessage || ""} 
            onChange={(e) => setProfile({ ...profile, generatedWelcomeMessage: e.target.value })} 
            rows={2} 
          />
        </div>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold">{t.secretaryWorkBoundaries}</h2>
        <p className="text-sm text-slate-500">{t.boundariesDesc}</p>
        
        {boundaries.map((boundary, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start border p-4 rounded-lg bg-slate-50 border-slate-200">
            <div className="flex-1 space-y-3 w-full">
              <Input 
                placeholder={t.categoryPlaceholder} 
                value={boundary.category}
                onChange={(e) => updateBoundary(index, "category", e.target.value)}
              />
              <Textarea 
                placeholder={t.ruleValuePlaceholder} 
                value={boundary.value}
                onChange={(e) => updateBoundary(index, "value", e.target.value)}
                rows={2}
              />
            </div>
            <div className="w-full sm:w-48 space-y-3 shrink-0">
              <select 
                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={boundary.visibilityType}
                onChange={(e) => updateBoundary(index, "visibilityType", e.target.value)}
              >
                <option value="public">{t.visibilityPublic}</option>
                <option value="restricted">{t.visibilityRestricted}</option>
                <option value="handoff_trigger">{t.visibilityHandoffTrigger}</option>
                <option value="never_share">{t.visibilityNeverShare}</option>
              </select>
              <Button variant="destructive" size="sm" onClick={() => removeBoundary(index)} className="w-full">
                {t.remove}
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addBoundary}>{t.addBoundaryRule}</Button>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold">{t.connectionPreferences}</h2>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-700">{t.primaryGoal}</label>
           <Input 
             value={profile.primaryConnectionGoal || ""} 
             onChange={(e) => setProfile({ ...profile, primaryConnectionGoal: e.target.value })} 
           />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-700">{t.openContactScope}</label>
           <Textarea 
             value={profile.generatedContactScopeText || ""} 
             onChange={(e) => setProfile({ ...profile, generatedContactScopeText: e.target.value })} 
             rows={2} 
           />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-8">
        {loading ? t.saving : t.saveSettings}
      </Button>
    </div>
  );
}
