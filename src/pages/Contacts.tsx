import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { ArrowRight, UserCheck, Users, Search, Filter, ShieldCheck, Mail, Globe } from "lucide-react";
import { authHeaders } from "../lib/api";

const translations = {
  en: {
    contactsTitle: "High-Signal Connections",
    contactsDesc: "Elite relationships vetted and managed by your AI secretary.",
    noContactsYet: "No verified connections in the current cycle.",
    anonymous: "Anonymous",
    contactInfoLabel: "Executive Intelligence Summary",
    totalConnections: "Active Intelligence Nodes"
  },
  zh: {
    contactsTitle: "高价值人脉",
    contactsDesc: "由您的 AI 秘书筛选并管理的精英商业关系。",
    noContactsYet: "本周期内暂无已验证的联系人。",
    anonymous: "匿名",
    contactInfoLabel: "执行官情报摘要",
    totalConnections: "活跃情报节点"
  }
};

export default function Contacts() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [contacts, setContacts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/inbox", { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : (data.data || []);
        setContacts(items.filter((c: any) => c.status === "accepted" || c.status === "replied" || c.status === "Ready to send"));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      
      {/* Executive Header */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10 shadow-sm">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-serif font-black text-[#111] tracking-tighter leading-none">{t.contactsTitle}</h1>
           </div>
           <p className="text-slate-400 text-[15px] font-medium max-w-xl italic">
             {t.contactsDesc}
           </p>
        </div>

        <div className="flex items-center gap-6 pb-2">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t.totalConnections}</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-2xl font-black text-slate-900">{contacts.length}</span>
              </div>
           </div>
           <div className="w-px h-10 bg-slate-100 mx-2" />
           <div className="flex items-center gap-2">
              <button className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                 <Search className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                 <Filter className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-10 py-12">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-24 bg-white border border-slate-200 rounded-[48px] border-dashed">
            <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8 text-slate-200">
              <UserCheck className="w-10 h-10" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[12px]">{t.noContactsYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {contacts.map(conv => (
              <button 
                key={conv.id} 
                className="flex flex-col bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group text-left relative overflow-hidden" 
                onClick={() => navigate(`/dashboard/inbox`)}
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2">
                  <ArrowRight className="w-6 h-6 text-slate-900" />
                </div>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:bg-[#D2E823] group-hover:text-black transition-all">
                    {(conv.visitorName || conv.name || "A")[0]}
                  </div>
                  <div className="min-w-0">
                     <h3 className="font-serif font-black text-2xl text-[#111] tracking-tight truncate leading-tight">
                       {conv.visitorName || conv.name || t.anonymous}
                     </h3>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">
                          {conv.visitorCompany || conv.company}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[11px] font-bold text-slate-500 italic">
                          {conv.visitorRole || "Executive"}
                        </span>
                     </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="bg-slate-50/80 p-6 rounded-[28px] border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
                     <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t.contactInfoLabel}</span>
                     </div>
                     <p className="text-[14px] text-slate-700 leading-relaxed font-medium italic line-clamp-3">
                       "{conv.summaryText || conv.visitorReason || "Active dialogue initiated by Liais Intelligence Engine."}"
                     </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-2.5">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Verified Intelligence Node</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                        <Globe className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                     </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
