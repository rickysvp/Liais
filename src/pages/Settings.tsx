import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";
import { Shield, User, Zap, Lock, Trash2, Plus, Brain, Globe, Eye, Settings as SettingsIcon } from "lucide-react";
import type { Profile, ProfileBoundary } from "@prisma/client";
import { authHeaders, jsonHeaders } from "../lib/api";

const translations = {
  en: {
    settingsSaved: "Intelligence configuration updated.",
    errorPrefix: "Error: ",
    failedToSave: "System synchronization failed.",
    loadingSettings: "Syncing configuration...",
    settingsTitle: "Intelligence Configuration",
    profileDetails: "Executive Identity",
    displayName: "Display Name",
    headline: "Professional Headline",
    aiSecretaryIntro: "Liais Personality Base",
    welcomeMessage: "Active Greeting Template",
    secretaryWorkBoundaries: "Operational Boundaries",
    boundariesDesc: "Define the high-precision constraints for Liais' autonomous decision making.",
    categoryPlaceholder: "Constraint Category",
    ruleValuePlaceholder: "Specific logic (e.g. Never disclose financial projections...)",
    visibilityPublic: "Unrestricted",
    visibilityRestricted: "Restricted Access",
    visibilityHandoffTrigger: "Human Escalation",
    visibilityNeverShare: "Strict Confidential",
    remove: "Remove",
    addBoundaryRule: "Add Operational Constraint",
    connectionPreferences: "Networking Objectives",
    primaryGoal: "Primary Executive Goal",
    openContactScope: "Allowed Interaction Scope",
    saving: "Synchronizing...",
    saveSettings: "Push Updates to Liais",
  },
  zh: {
    settingsSaved: "情报配置已更新。",
    errorPrefix: "错误：",
    failedToSave: "系统同步失败。",
    loadingSettings: "正在同步配置...",
    settingsTitle: "情报配置",
    profileDetails: "执行官身份",
    displayName: "显示名称",
    headline: "专业头衔",
    aiSecretaryIntro: "Liais 人格底座",
    welcomeMessage: "主动欢迎模版",
    secretaryWorkBoundaries: "业务运行边界",
    boundariesDesc: "为 Liais 的自主决策定义高精度的约束条件。",
    categoryPlaceholder: "约束类别",
    ruleValuePlaceholder: "具体逻辑（例如：从不透露财务预测...）",
    visibilityPublic: "无限制",
    visibilityRestricted: "受限访问",
    visibilityHandoffTrigger: "人工介入",
    visibilityNeverShare: "严格保密",
    remove: "移除",
    addBoundaryRule: "添加业务约束",
    connectionPreferences: "社交目标",
    primaryGoal: "核心执行目标",
    openContactScope: "允许的互动范围",
    saving: "同步中...",
    saveSettings: "向 Liais 推送更新",
  }
};

export default function Settings() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [boundaries, setBoundaries] = useState<ProfileBoundary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me/profile", { headers: authHeaders() })
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
        headers: jsonHeaders(),
        body: JSON.stringify({ ...profile, boundaries })
      });
      if (res.ok) {
        toast.success(t.settingsSaved);
      } else {
        const err = await res.json();
        toast.error(t.errorPrefix + err.error);
      }
    } catch (e) {
      console.error(e);
      toast.error(t.failedToSave);
    } finally {
      setLoading(false);
    }
  };

  const addBoundary = () => {
    setBoundaries([...boundaries, { category: "", value: "", visibilityType: "public", id: "", profileId: profile?.id || "" } as any]);
  };

  const updateBoundary = (index: number, field: string, value: string) => {
    const newBoundaries = [...boundaries];
    (newBoundaries[index] as any)[field] = value;
    setBoundaries(newBoundaries);
  };

  const removeBoundary = (index: number) => {
    setBoundaries(boundaries.filter((_, i) => i !== index));
  };

  if (!profile) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#D2E823] rounded-full animate-spin"></div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.loadingSettings}</p>
      </div>
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">{children}</label>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-8 py-10 space-y-12 overflow-y-auto">
      
      {/* Executive Header Area */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10 shadow-sm">
        <div>
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-serif font-black text-[#111] tracking-tighter leading-none">{t.settingsTitle}</h1>
           </div>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-slate-200">
                System V2.1
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-400 text-[9px] font-black rounded-full uppercase tracking-widest">
                <Shield className="w-3 h-3" /> Secure Sync
             </div>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 h-14 font-black text-[14px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 mb-2"
        >
          {loading ? t.saving : t.saveSettings}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Identity & Intelligence Strategy */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Identity Block */}
          <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                 <User className="w-5 h-5 text-slate-900" />
               </div>
               <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">{t.profileDetails}</h2>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label>{t.displayName}</Label>
                  <input 
                    value={profile.displayName || ""} 
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl h-14 px-5 focus:bg-white focus:border-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.headline}</Label>
                  <input 
                    value={profile.headline || ""} 
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl h-14 px-5 focus:bg-white focus:border-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.aiSecretaryIntro}</Label>
                <textarea 
                  value={profile.generatedIntro || ""} 
                  onChange={(e) => setProfile({ ...profile, generatedIntro: e.target.value })} 
                  rows={4} 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[24px] p-6 focus:bg-white focus:border-slate-900 transition-all font-medium leading-relaxed text-slate-700 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Strategy Block */}
          <section className="bg-slate-50 border border-slate-200 rounded-[32px] p-8">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                 <Brain className="w-5 h-5 text-slate-900" />
               </div>
               <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">{t.connectionPreferences}</h2>
            </div>
            <div className="space-y-8">
               <div className="space-y-2">
                  <Label>{t.primaryGoal}</Label>
                  <input 
                    value={profile.primaryConnectionGoal || ""} 
                    onChange={(e) => setProfile({ ...profile, primaryConnectionGoal: e.target.value })} 
                    className="w-full bg-white border-2 border-white rounded-xl h-14 px-5 focus:border-slate-900 transition-all font-bold text-slate-900 shadow-sm"
                  />
               </div>
               <div className="space-y-2">
                  <Label>{t.openContactScope}</Label>
                  <textarea 
                    value={profile.generatedContactScopeText || ""} 
                    onChange={(e) => setProfile({ ...profile, generatedContactScopeText: e.target.value })} 
                    rows={3} 
                    className="w-full bg-white border-2 border-white rounded-[24px] p-6 focus:border-slate-900 transition-all font-medium leading-relaxed text-slate-700 shadow-sm resize-none"
                  />
               </div>
            </div>
          </section>
        </div>

        {/* Right Column: High-Precision Boundaries */}
        <div className="lg:col-span-5">
           <section className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 w-48 h-48 bg-[#D2E823]/10 rounded-full blur-[80px] -mr-16 -mt-16"></div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
                   <Lock className="w-6 h-6 text-[#D2E823]" />
                 </div>
                 <h2 className="text-[14px] font-black text-white uppercase tracking-widest">{t.secretaryWorkBoundaries}</h2>
               </div>
               <p className="text-[15px] text-slate-400 font-medium leading-relaxed mb-10">
                 {t.boundariesDesc}
               </p>

               <div className="space-y-6">
                 {boundaries.map((boundary, index) => (
                   <div key={index} className="bg-white/5 border border-white/10 rounded-[28px] p-8 space-y-6 relative group hover:border-[#D2E823]/30 transition-colors">
                     <button onClick={() => removeBoundary(index)} className="absolute top-6 right-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                       <Trash2 className="w-4 h-4" />
                     </button>
                     
                     <div className="space-y-4">
                       <div className="space-y-1">
                         <input 
                           placeholder={t.categoryPlaceholder} 
                           value={boundary.category}
                           onChange={(e) => updateBoundary(index, "category", e.target.value)}
                           className="w-full bg-transparent border-none text-[16px] font-black text-[#D2E823] focus:ring-0 p-0 placeholder:text-slate-800"
                         />
                       </div>
                       <textarea 
                         placeholder={t.ruleValuePlaceholder} 
                         value={boundary.value}
                         onChange={(e) => updateBoundary(index, "value", e.target.value)}
                         rows={2}
                         className="w-full bg-transparent border-none text-[14px] text-slate-300 font-medium leading-relaxed focus:ring-0 p-0 placeholder:text-slate-800 resize-none"
                       />
                       <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3 text-slate-500" />
                            <select 
                              className="bg-transparent border-none text-[10px] font-black text-slate-500 uppercase tracking-widest focus:ring-0 p-0 appearance-none cursor-pointer hover:text-white transition-colors"
                              value={boundary.visibilityType}
                              onChange={(e) => updateBoundary(index, "visibilityType", e.target.value)}
                            >
                              <option value="public" className="bg-slate-900">{t.visibilityPublic}</option>
                              <option value="restricted" className="bg-slate-900">{t.visibilityRestricted}</option>
                              <option value="handoff_trigger" className="bg-slate-900">{t.visibilityHandoffTrigger}</option>
                              <option value="never_share" className="bg-slate-900">{t.visibilityNeverShare}</option>
                            </select>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-[#D2E823]/50 shadow-[0_0_10px_rgba(210,232,35,0.5)]"></div>
                       </div>
                     </div>
                   </div>
                 ))}
                 
                 <button onClick={addBoundary} className="w-full py-5 rounded-[24px] border-2 border-dashed border-white/5 text-slate-600 hover:border-[#D2E823]/30 hover:text-white transition-all font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 group">
                   <Plus className="w-5 h-5 group-hover:scale-125 transition-transform text-[#D2E823]" />
                   {t.addBoundaryRule}
                 </button>
               </div>
             </div>
           </section>
        </div>

      </div>
    </div>
  );
}
