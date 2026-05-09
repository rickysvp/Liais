import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Shield, Zap, Clock, User, ArrowRight, CheckCircle2, MessageSquare, Mail, Calendar, Archive, EyeOff, Brain, TrendingUp } from "lucide-react";
import { authHeaders, jsonHeaders } from "../lib/api";

import { translations } from '../i18n/inbox';
import { getMockBriefs } from '../mocks/inboxMocks';

interface Conversation {
  id: string;
  visitorName: string | null;
  visitorCompany: string | null;
  visitorBackground: string | null;
  visitorReason: string | null;
  visitorIntentCategory: string | null;
  requestedNextStep: string | null;
  contactInfo?: string | null;
  summaryText: string | null;
  qualificationLevel: string | null;
  suggestedAction: string | null;
  status: string;
  priorityLevel?: number;
  visitorRole?: string;
  email?: string;
  linkedin?: string;
  whyItMatters?: string;
  whatAIPrepared?: string;
  createdAt: string;
}

export default function Inbox() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const translatedMockBriefs = getMockBriefs(t);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queueTab, setQueueTab] = useState("decision");

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const diffHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours < 24) return diffHours > 0 ? `${diffHours}${t.hAgo}` : t.justNow;
      return `${Math.floor(diffHours / 24)}${t.dAgo}`;
    } catch { return ""; }
  };

  const formatDateFull = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Intl.DateTimeFormat(language === 'zh' ? "zh-CN" : "en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "numeric",
      }).format(new Date(dateString));
    } catch { return ""; }
  };

  useEffect(() => {
    fetch("/api/inbox", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.data || []);
        if (items.length > 0) {
          setConversations(items);
          setSelectedId(items[0].id);
        } else {
          setConversations(translatedMockBriefs);
          setSelectedId(translatedMockBriefs[0].id);
        }
      })
      .catch(() => {
        setConversations(translatedMockBriefs);
        setSelectedId(translatedMockBriefs[0].id);
      });
  }, [language]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedId || selectedId.startsWith("mock-")) return;
    try {
      await fetch(`/api/inbox/${selectedId}/status`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify({ status }),
      });
      setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, status } : c)));
    } catch (e) { console.error(e); }
  };

  const filteredConversations = conversations
    .filter((c) => {
      if (c.status === "ignored" || c.status === "Archived by AI") return queueTab === "archived";
      if (queueTab === "monitor") return c.status === "Monitor later" || c.status === "later";
      if (queueTab === "waiting") return c.status === "Waiting on them";
      if (queueTab === "ready") return c.status === "Ready to send";
      if (queueTab === "archived") return c.status === "Archived by AI" || c.status === "ignored";
      if (queueTab === "decision") return c.status === "Waiting on you" || c.status === "new" || !c.status;
      return true;
    })
    .sort((a, b) => (a.priorityLevel || 4) - (b.priorityLevel || 4));

  const selectedBrief = conversations.find((c) => c.id === selectedId);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      
      {/* Inbox Header */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 z-30 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
             <MessageSquare className="w-6 h-6" />
           </div>
           <h1 className="text-4xl font-serif font-black text-[#111] tracking-tighter">{t.inbox}</h1>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[20px] border border-slate-200/60 overflow-x-auto scrollbar-hide">
          {[
            { id: "decision", label: t.needsYourDecision, icon: <Zap className="w-3.5 h-3.5" /> },
            { id: "ready", label: t.readyToSend, icon: <Clock className="w-3.5 h-3.5" /> },
            { id: "waiting", label: t.waitingOnThem, icon: <User className="w-3.5 h-3.5" /> },
            { id: "monitor", label: t.monitorLater, icon: <EyeOff className="w-3.5 h-3.5" /> },
            { id: "archived", label: t.archivedByAI, icon: <Archive className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQueueTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all ${queueTab === tab.id ? "bg-slate-900 text-white shadow-xl scale-105" : "text-slate-500 hover:text-slate-900 hover:bg-white"}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Responsive Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Scrollable List */}
        <div className="w-full md:w-[400px] lg:w-[460px] border-r border-slate-200 flex flex-col bg-white shrink-0">
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px]">
                <Shield className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  {t.noItemsInQueue}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-6 rounded-[32px] border transition-all text-left relative group
                    ${selectedId === conv.id ? "bg-slate-900 border-slate-900 shadow-2xl scale-[1.02] z-10" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-xl shadow-lg transition-colors ${selectedId === conv.id ? 'bg-[#D2E823] text-slate-900' : 'bg-slate-900 text-white'}`}>
                        {(conv.visitorName || "A")[0]}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[17px] font-black tracking-tight truncate ${selectedId === conv.id ? 'text-white' : 'text-slate-900'}`}>
                          {conv.visitorName || t.anonymous}
                        </div>
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] truncate ${selectedId === conv.id ? 'text-slate-400' : 'text-slate-400'}`}>
                          {conv.visitorCompany}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 mt-1 ${selectedId === conv.id ? 'text-slate-500' : 'text-slate-300'}`}>
                      {formatTimeAgo(conv.createdAt)}
                    </span>
                  </div>
                  
                  <p className={`text-[14px] leading-relaxed font-medium line-clamp-2 italic mb-6 ${selectedId === conv.id ? 'text-slate-300' : 'text-slate-600'}`}>
                    "{conv.summaryText || conv.visitorReason}"
                  </p>
                  
                  <div className={`flex items-center justify-between pt-5 border-t ${selectedId === conv.id ? 'border-white/10' : 'border-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <Zap className={`w-3.5 h-3.5 ${selectedId === conv.id ? 'text-[#D2E823]' : 'text-slate-300'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest truncate max-w-[150px] ${selectedId === conv.id ? 'text-white' : 'text-slate-900'}`}>
                        {conv.suggestedAction}
                      </span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
                      selectedId === conv.id 
                        ? 'bg-white/10 text-[#D2E823] border-white/10' 
                        : (conv.priorityLevel === 1 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100')
                    }`}>
                      P{conv.priorityLevel || 3}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: High-Precision Review Detail */}
        <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
          {!selectedBrief ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
               <Shield className="w-24 h-24 mb-6 opacity-20" />
               <p className="text-[12px] font-black uppercase tracking-[0.5em]">{t.selectABrief}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500">
              
              {/* Detail Content Area */}
              <div className="flex-1 overflow-y-auto p-12 lg:p-20 space-y-16">
                
                {/* Executive Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-100 pb-12 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <span className="px-4 py-1.5 bg-[#D2E823] text-slate-900 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                         {selectedBrief.visitorIntentCategory}
                       </span>
                       <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <Clock className="w-3.5 h-3.5" /> {formatDateFull(selectedBrief.createdAt)}
                       </div>
                    </div>
                    <h2 className="text-6xl font-serif font-black text-[#111] tracking-tighter leading-none">
                      {selectedBrief.visitorName || t.anonymous}
                    </h2>
                    <div className="flex items-center gap-6">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Affiliation</span>
                          <span className="text-[16px] font-bold text-slate-900">{selectedBrief.visitorCompany}</span>
                       </div>
                       <div className="w-px h-10 bg-slate-100" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</span>
                          <span className="text-[16px] font-bold text-slate-900">{selectedBrief.visitorRole}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col items-center gap-2 shadow-2xl min-w-[200px]">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Qualification</span>
                     <span className="text-2xl font-black text-[#D2E823] text-center leading-tight">
                       {selectedBrief.qualificationLevel || "Unclear"}
                     </span>
                  </div>
                </div>

                {/* Analysis Bento Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-50/50 border border-slate-200/60 rounded-[40px] p-10 flex flex-col gap-6 group hover:border-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                         <Brain className="w-4 h-4 text-slate-900" />
                       </div>
                       <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t.whyISurfaced}</h3>
                    </div>
                    <p className="text-[20px] font-serif font-medium leading-relaxed text-slate-800 italic">
                      "{selectedBrief.summaryText || t.flaggedReview}"
                    </p>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200/60 rounded-[40px] p-10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                         <TrendingUp className="w-4 h-4 text-slate-900" />
                       </div>
                       <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t.whyItMatters}</h3>
                    </div>
                    <p className="text-[16px] text-slate-600 font-medium leading-relaxed">
                      {selectedBrief.whyItMatters || t.alignmentPriorities}
                    </p>
                  </div>

                  <div className="bg-slate-900 rounded-[48px] p-12 lg:col-span-2 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D2E823]/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex-1 space-y-4">
                          <h3 className="text-[11px] font-black text-[#D2E823] uppercase tracking-[0.3em] flex items-center gap-3">
                            <Zap className="w-5 h-5 animate-pulse" /> {t.whatIPrepared}
                          </h3>
                          <p className="text-[24px] font-serif font-medium text-white leading-tight italic">
                            "{selectedBrief.whatAIPrepared || t.waitingInstructions}"
                          </p>
                       </div>
                       <div className="shrink-0 flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-[24px] bg-white/10 border border-white/10 flex items-center justify-center text-white">
                             <Mail className="w-8 h-8" />
                          </div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Draft Ready</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Raw Transcript Area */}
                <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row gap-12">
                   <div className="md:w-1/3">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Provided Context</h3>
                      <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
                        The original reasoning provided by the visitor during initial screening.
                      </p>
                   </div>
                   <div className="md:w-2/3 bg-slate-50/50 rounded-[32px] p-10 border border-slate-100 italic">
                      <p className="text-[16px] text-slate-500 leading-relaxed font-medium">"{selectedBrief.visitorReason}"</p>
                   </div>
                </div>

              </div>

              {/* Action Toolbar */}
              <div className="shrink-0 bg-white border-t border-slate-200 p-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-[0_-20px_60px_rgba(0,0,0,0.03)] z-20">
                <div className="flex gap-4 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none h-16 bg-slate-900 text-white rounded-[24px] px-12 font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                    {t.replyByEmail}
                    <ArrowRight className="w-4 h-4 text-[#D2E823]" />
                  </button>
                  <button className="flex-1 sm:flex-none h-16 bg-white border-2 border-slate-100 text-slate-900 rounded-[24px] px-8 font-black uppercase tracking-[0.2em] text-[13px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                    <Calendar className="w-4 h-4" /> {t.sendMeetingLink}
                  </button>
                </div>
                
                <div className="flex gap-10 items-center shrink-0">
                  <button onClick={() => handleUpdateStatus("Monitor later")} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors flex items-center gap-2 group">
                    <Clock className="w-4 h-4 group-hover:animate-spin-slow" /> {t.monitorLaterAction}
                  </button>
                  <button onClick={() => handleUpdateStatus("Archived by AI")} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-red-500 transition-colors flex items-center gap-2 group">
                    <Archive className="w-4 h-4" /> {t.archiveAction}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
