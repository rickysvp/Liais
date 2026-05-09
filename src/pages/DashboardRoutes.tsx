import { Link, Routes, Route, useLocation } from "react-router-dom";
import Inbox from "./Inbox";
import Contacts from "./Contacts";
import VisitorDetail from "./VisitorDetail";
import SettingsPage from "./Settings";
import Upgrade from "./Upgrade";
import { Copy, InboxIcon, Settings, User, Globe, Send, Loader2, TrendingUp, Users, MessageSquare, Clock, Calendar, Zap, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Brain, Receipt } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from '../i18n/dashboard';

interface Profile {
  displayName: string;
  headline?: string;
  slug: string;
}

interface InboundCard {
  id: string;
  name: string;
  company: string;
  role: string;
  relevance: string;
  summary: string;
  recommendation: string;
  status?: string;
  time?: string;
}



const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d - min) / range) * height
  }));
  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${pathData} L ${width},${height} L 0,${height} Z`} fill={`url(#gradient-${color})`} fillOpacity="0.1" />
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* --- THE LIAIS STANDARD COMPONENTS --- */

const StandardMetric = ({ label, value, trend, color, isMini }: { label: string, value: string, trend?: string, color: string, isMini?: boolean }) => {
  const colorMap: any = {
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
  };
  
  if (isMini) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-black text-slate-900">{value}</span>
          {trend && <span className={`text-[9px] font-bold ${colorMap[color]}`}>{trend}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl transition-all hover:border-slate-200">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-slate-900">{value}</span>
        {trend && <span className={`text-[10px] font-bold ${colorMap[color]}`}>{trend}</span>}
      </div>
    </div>
  );
};

const StandardLeadItem = ({ card, onSelect, isMini }: { card: InboundCard, onSelect: (card: InboundCard) => void, isMini?: boolean }) => {
  if (isMini) {
    return (
      <button 
        onClick={() => onSelect(card)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
            {card.name[0]}
          </div>
          <div className="text-left truncate">
            <div className="text-[13px] font-bold text-slate-900 truncate">{card.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{card.company}</div>
          </div>
        </div>
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter shrink-0 ${
          (card.relevance === 'HIGH' || card.relevance === 'High Fit') ? 'bg-[#111] text-[#D2E823]' : 'bg-slate-100 text-slate-400'
        }`}>{card.relevance}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={() => onSelect(card)}
      className="flex-none w-[280px] flex flex-col gap-4 p-5 bg-white border border-slate-200/60 hover:border-[#D2E823] rounded-[24px] transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-[#D2E823] transition-colors overflow-hidden shadow-lg">
           <span className="text-white group-hover:text-black font-bold text-xl">{card.name[0]}</span>
        </div>
        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-[0.1em] ${
          (card.relevance === 'HIGH' || card.relevance === 'High Fit') ? 'bg-[#111] text-[#D2E823]' : 'bg-slate-100 text-slate-500'
        }`}>{card.relevance}</span>
      </div>
      <div className="text-left">
        <div className="font-bold text-slate-900 text-[16px] truncate mb-0.5">{card.name}</div>
        <p className="text-[12px] text-slate-500 truncate font-medium">{card.role} • {card.company}</p>
      </div>
      <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
        <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-slate-900 transition-colors">View Details</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform group-hover:text-slate-900" />
      </div>
    </button>
  );
};

function MessageContent({ content, onSelectCard }: { content: string, onSelectCard?: (card: InboundCard) => void }) {
  try {
    const data = JSON.parse(content);
    if (data.type === 'briefing') {
      return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-700">
          {/* Header Area */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                 <Brain className="w-6 h-6 text-[#D2E823]" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Intelligence Report</span>
                <span className="text-[15px] font-serif font-black text-slate-900 tracking-tight">Daily Briefing & Summary</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" /> Active Screening
              </span>
            </div>
          </div>

          {/* 0. Executive Summary (NEW Prominent Section) */}
          <div className="bg-white p-2 rounded-[32px]">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Executive Summary</h3>
             <p className="text-[20px] font-serif font-medium leading-relaxed text-slate-800 tracking-tight pl-2 border-l-4 border-[#D2E823]">
               {data.text}
             </p>
          </div>

          {/* Bento Grid Container */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* 1. Value Proposition / Performance (Large Block) */}
            <div className="col-span-12 lg:col-span-8 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="px-2 py-0.5 bg-emerald-500 text-slate-900 text-[9px] font-black rounded uppercase tracking-widest">Performance Insight</div>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                  <span className="text-[#D2E823]">{data.timeSaved || '45m'}</span> saved today.
                </h3>
                <p className="text-[14px] font-medium leading-relaxed tracking-tight text-slate-400">
                  Through autonomous screening and priority routing.
                </p>
                
                <div className="mt-8 grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Screened</div>
                    <div className="text-2xl font-black text-white">1,240</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Distractions Filtered</div>
                    <div className="text-2xl font-black text-emerald-400">{data.filteredCount || 28}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">High-Signal Opportunities</div>
                    <div className="text-2xl font-black text-[#D2E823]">{data.cards?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Activity Trend (Compact Block) */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inbound Velocity</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900">High</span>
                  <span className="text-[12px] font-bold text-emerald-500">+12.5%</span>
                </div>
              </div>
              <div className="mt-6 mb-2">
                <Sparkline data={[20, 35, 22, 50, 45, 70, 65]} color="#10b981" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-2">
                <span>08:00</span>
                <span>12:00</span>
                <span>Now</span>
              </div>
            </div>

            {/* 4. Logic-Driven Insights (Wide Block) */}
            <div className="col-span-12 lg:col-span-7 space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Logic-Driven Intelligence
              </h4>
              <div className="space-y-4">
                {data.insights?.map((insight: any, i: number) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        {insight.type === 'opportunity' ? <Zap className="w-4 h-4 text-emerald-500" /> : <TrendingUp className="w-4 h-4 text-blue-500" />}
                      </div>
                      <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wide">{insight.type} Detected</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3">
                         <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5"></div>
                         <p className="text-[13px] text-slate-600 font-medium leading-tight"><span className="text-slate-400 font-bold uppercase text-[9px] mr-2">Obs</span>{insight.observation}</p>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 mt-2">
                         <p className="text-[13px] text-slate-900 font-black leading-tight flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {insight.action}
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Schedule / Flow (Narrower Block) */}
            <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Today's Flow
              </h4>
              <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                {data.schedule?.map((item: any, i: number) => (
                  <div key={i} className="relative pl-8 group">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-slate-200 group-hover:bg-[#D2E823] group-hover:border-[#D2E823] transition-all shadow-sm"></div>
                    <div className="text-[11px] font-bold text-slate-400 mb-1">{item.time}</div>
                    <div className="text-[14px] font-bold text-slate-900 leading-tight">{item.title}</div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 inline-block px-1.5 py-0.5 bg-slate-50 rounded">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Action Queue (Horizontal Slide) */}
            <div className="col-span-12 bg-slate-50 border border-slate-200/50 rounded-[32px] p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-2">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Users className="w-4 h-4" /> Opportunities for Review
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                    {data.cards?.length || 0} Filtered Results
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide snap-x">
                {data.cards?.map((card: any, i: number) => (
                  <div key={i} className="snap-start">
                    <StandardLeadItem card={card} onSelect={onSelectCard!} />
                  </div>
                ))}
                <div className="shrink-0 w-4"></div>
              </div>
            </div>
          </div>

          {/* Action Confirmation */}
          <div className="flex items-center justify-between pt-4 text-slate-400">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-slate-300" /> Latency: 42ms
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Zap className="w-3.5 h-3.5 text-slate-300" /> Models: Gemini 2.0 Pro
                </div>
             </div>
             <button className="px-8 py-3 bg-slate-900 text-white text-[13px] font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 group shadow-xl">
               Confirm & Archive Briefing
               <CheckCircle2 className="w-4 h-4 text-[#D2E823] group-hover:scale-125 transition-transform" />
             </button>
          </div>
        </div>
      );
    }
  } catch (e) {}
  return <>{content}</>;
}

function DashboardHome() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCard, setSelectedCard] = useState<InboundCard | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me/profile")
      .then(r => r.ok ? r.json() : null)
      .then(setProfile)
      .catch(() => setProfile(null));

    fetch("/api/chat")
      .then(res => res.json())
      .then(data => {
        const msgs = Array.isArray(data) ? data : (data.data || []);
        setMessages(msgs);
        
        // If no briefing is found in history, generate one automatically
        const hasBriefing = msgs.some(m => m.content.includes('"type":"briefing"'));
        if (!hasBriefing) {
          setLoading(true);
          fetch("/api/chat/greeting", { method: "POST" })
            .then(r => r.json())
            .then(msg => {
              setMessages(prev => [...prev, msg]);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { id: Date.now().toString(), role: "user" as const, content: input, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data]);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };



  const briefingMsg = messages.find(m => {
    try {
      const data = JSON.parse(m.content);
      return data.type === 'briefing';
    } catch { return false; }
  });

  const parsedBriefing = briefingMsg ? JSON.parse(briefingMsg.content) : null;
  const inbounds: InboundCard[] = parsedBriefing?.cards || [];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-full bg-white relative overflow-hidden">
      
      {/* Left Pane - Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <img src="/img/logo.png" alt="Liais" className="w-10 h-10 rounded-xl shadow-lg object-contain bg-slate-900" />
             <div>
               <h2 className="text-[16px] font-serif font-black text-[#111] tracking-tight">Liais Intelligence</h2>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active & Monitoring</span>
               </div>
             </div>
          </div>
          <button 
            onClick={() => {
              setLoading(true);
              fetch("/api/chat/greeting", { method: "POST" })
                .then(r => r.json())
                .then(msg => {
                  setMessages(prev => [...prev, msg]);
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#111] hover:bg-slate-50 rounded-xl px-4 py-2 flex items-center gap-2 group transition-all"
          >
            <Zap className="w-3.5 h-3.5 group-hover:text-emerald-500 transition-colors" />
            Refresh Briefing
          </button>
        </div>
        


        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center shadow-xl">
                <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Initializing Intelligence Hub...</p>
            </div>
          ) : (
            <>
              {messages.map((m, idx) => {
                const isBriefing = m.content.includes('"type":"briefing"');
                
                return (
                  <div key={m.id || idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                    {m.role !== 'user' && !isBriefing && (
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs mr-4 shrink-0 shadow-lg">
                        L
                      </div>
                    )}
                    <div className={`${isBriefing ? 'w-full max-w-none' : 'max-w-[85%] sm:max-w-[440px]'} space-y-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`w-full px-6 py-5 text-[15px] leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-[24px] rounded-br-sm shadow-xl font-medium' 
                          : (isBriefing
                              ? 'bg-white border border-slate-200/60 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-10 my-4 overflow-visible'
                              : 'bg-white border border-slate-200/60 text-slate-800 rounded-[24px] rounded-bl-sm shadow-md font-medium')
                      }`}>
                        <div className="flex flex-col gap-2">
                          {m.role === 'assistant' && !isBriefing && (
                            <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#D2E823]"></div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Secretary Insight</span>
                            </div>
                          )}
                          <div className={m.role === 'assistant' && !isBriefing ? "font-serif font-medium text-[16px] leading-relaxed text-slate-800" : ""}>
                            <MessageContent content={m.content} onSelectCard={setSelectedCard} />
                          </div>
                        </div>
                      </div>
                      {m.createdAt && !isBriefing && <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-2">{formatTime(m.createdAt)}</span>}
                    </div>
                  </div>
                );
              })}
              
              {loading && (
                <div className="flex items-center gap-4 animate-in fade-in">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-lg">L</div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-4 rounded-[24px] rounded-bl-sm shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-10 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Quick Actions / Suggestions */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { label: "Summarize Traffic", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                { label: "Update My Bio", icon: <User className="w-3.5 h-3.5" /> },
                { label: "Screen Recruiters", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { label: "Schedule Policy", icon: <Clock className="w-3.5 h-3.5" /> }
              ].map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setInput(s.label);
                    // Optionally auto-send if desired
                  }}
                  className="shrink-0 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-2 group"
                >
                  <span className="text-slate-400 group-hover:text-[#D2E823]">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message Liais Intelligence..."
                className="w-full bg-white border-2 border-slate-100 rounded-[24px] px-8 py-5 pr-20 text-[15px] focus:outline-none focus:border-slate-900 transition-all shadow-sm group-hover:shadow-md font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-3 top-3 bottom-3 px-6 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center shadow-lg active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Standardized Intelligence Panel */}
      <div className="w-[320px] lg:w-[360px] bg-white border-l border-slate-200 flex flex-col shrink-0 relative z-20">
        {!selectedCard ? (
          /* State A: Mini Shortcut Sidebar */
          <div className="flex-1 flex flex-col animate-in fade-in duration-500">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#D2E823]"></div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Intelligence Shortcuts</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mini Stats Section */}
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Metrics</h3>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-2">
                  <StandardMetric label="Visitors" value="1.2k" trend="+12%" color="emerald" isMini />
                  <StandardMetric label="Actionable" value={inbounds.length.toString()} color="emerald" isMini />
                </div>
              </div>

              {/* Mini Queue Section */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Action Queue</h3>
                <div className="space-y-1">
                  {inbounds.map(card => (
                    <StandardLeadItem key={card.id} card={card} onSelect={setSelectedCard} isMini />
                  ))}
                </div>
              </div>

              {/* Mini Schedule Section */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Schedule</h3>
                <div className="space-y-2">
                  {parsedBriefing?.schedule?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="text-[9px] font-bold text-slate-400 w-12 shrink-0">{item.time}</div>
                      <div className="flex-1 text-[12px] font-bold text-slate-900 truncate">{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* State B: Inbound Review Detail Panel (Analysis Mode) */
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <button 
                onClick={() => setSelectedCard(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              <div className="px-3 py-1 bg-[#111] text-[#D2E823] text-[9px] font-black rounded-full uppercase tracking-wider">
                Analysis
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="text-center pb-8 border-b border-slate-100">
                 <div className="w-20 h-20 bg-slate-900 rounded-[28px] mx-auto flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-xl">
                   {selectedCard.name[0]}
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedCard.name}</h3>
                 <p className="text-[15px] text-slate-500 mt-2 font-medium">{selectedCard.role} • {selectedCard.company}</p>
               </div>

               <div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Executive Summary</h4>
                 <p className="text-[14px] text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-5 rounded-2xl italic">
                   "{selectedCard.summary}"
                 </p>
               </div>

               <div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Secretary Recommendation</h4>
                 <div className="flex items-start gap-4 bg-emerald-50/50 border border-emerald-100/50 p-5 rounded-2xl">
                   <div className="mt-1 text-emerald-500 shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                   <p className="text-[14px] text-emerald-900 font-bold leading-relaxed">
                     {selectedCard.recommendation}
                   </p>
                 </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white space-y-3">
               <button className="w-full py-4 bg-slate-900 text-white text-[14px] font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]">
                 Draft Response
               </button>
               <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 text-[14px] font-bold rounded-2xl hover:bg-slate-50 transition-all">
                 Archive (Ignore)
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardRoutes() {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const navItemClass = (path: string) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-gradient-to-r from-[#D2E823] to-[#C2D812] text-[#111] shadow-lg"
        : "text-slate-500 hover:text-[#111] hover:bg-[#E8EECC]"
    }`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="w-[260px] shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col h-screen">
        <div className="px-3 py-6 mb-4">
          <div className="flex items-center gap-3">
            <img src="/img/logo.png" alt="Liais" className="w-10 h-10 rounded-xl shadow-lg object-contain bg-slate-900" />
            <span className="text-[#111] text-xl font-bold tracking-tight">Liais</span>
          </div>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          <Link to="/dashboard" className={navItemClass("/dashboard")}>
            <User className="w-5 h-5" /> 
            <span>{t.overview}</span>
          </Link>
          <Link to="/dashboard/inbox" className={navItemClass("/dashboard/inbox")}>
            <InboxIcon className="w-5 h-5" /> 
            <span>{t.inbox}</span>
          </Link>
          <Link to="/dashboard/contacts" className={navItemClass("/dashboard/contacts")}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t.contacts}</span>
          </Link>
          <Link to="/dashboard/upgrade" className={navItemClass("/dashboard/upgrade")}>
            <Receipt className="w-5 h-5" /> 
            <span>{t.upgrade}</span>
          </Link>
          <Link to="/dashboard/settings" className={navItemClass("/dashboard/settings")}>
            <Settings className="w-5 h-5" /> 
            <span>{t.settings}</span>
          </Link>
        </nav>

        <div className="pt-4 border-t border-slate-200 space-y-1">
          <button
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 w-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm">{language === "en" ? "中文" : "English"}</span>
          </button>
          <div className="px-4 py-2 text-[11px] text-slate-300 tracking-wider">
            v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}
          </div>
        </div>
      </div>
      
      {/* Main Content - scrollable */}
      <div className="flex-1 overflow-hidden">
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
