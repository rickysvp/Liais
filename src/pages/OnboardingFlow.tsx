import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface OnboardingPayload {
  primaryConnectionGoal: string;
  personaType: string;
  displayName: string;
  headline: string;
  companyOrProject: string;
  city: string;
  whatYouDo: string;
  whoYouHelp: string;
  currentFocus: string;
  topicsYouLike: string;
  secretaryTone: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  greetingStyle?: string;
  screeningStyle?: string;
}

interface GeneratedContent {
  generatedIntro?: string;
  generatedWelcomeMessage?: string;
  generatedContactScopeText?: string;
}

const AIBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 mt-10 mb-4">
    <div className="flex items-center space-x-2.5 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#111] flex items-center justify-center shrink-0 shadow-sm ring-4 ring-white">
        <div className="w-2.5 h-2.5 rounded-full bg-[#D2E823] shadow-[0_0_8px_#D2E823] animate-pulse"></div>
      </div>
      <span className="font-bold text-[11px] uppercase tracking-widest text-[#111]/40">Liais Setup Guide</span>
    </div>
    <div className="flex flex-col gap-3 w-full [&>p:first-of-type]:text-[26px] [&>p:first-of-type]:sm:text-[34px] [&>p:first-of-type]:font-[family-name:var(--font-heading)] [&>p:first-of-type]:font-bold [&>p:first-of-type]:tracking-tight [&>p:first-of-type]:text-[#111] [&>p:first-of-type]:leading-[1.15] [&>p:nth-of-type(n+2)]:text-[18px] [&>p:nth-of-type(n+2)]:sm:text-[22px] [&>p:nth-of-type(n+2)]:text-[#6C6C68] [&>p:nth-of-type(n+2)]:leading-relaxed [&>p:nth-of-type(n+2)]:font-medium">
      {children}
    </div>
  </div>
);

const UserBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end items-start animate-in fade-in slide-in-from-bottom-2 mt-6 mb-6">
    <div className="bg-white border border-slate-100 px-6 py-4 rounded-[1.5rem] rounded-tr-md max-w-[85%] text-[#111] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[16px] font-medium leading-relaxed">
      {children}
    </div>
  </div>
);

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [linkedinMode, setLinkedinMode] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [importingLinkedin, setImportingLinkedin] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [payload, setPayload] = useState<OnboardingPayload>({
    primaryConnectionGoal: "",
    personaType: "",
    displayName: "",
    headline: "",
    companyOrProject: "",
    city: "",
    whatYouDo: "",
    whoYouHelp: "",
    currentFocus: "",
    topicsYouLike: "",
    secretaryTone: "Professional",
  });
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);

  const updatePayload = (key: keyof OnboardingPayload, value: string) => {
    setPayload((p) => ({ ...p, [key]: value }));
  };

  const handleLinkedinImport = () => {
    setImportingLinkedin(true);
    // Simulate LinkedIn Scraping and Parsing
    setTimeout(() => {
      let mockName = "Alex";
      if (linkedinUrl.includes("/in/")) {
        const parts = linkedinUrl.split("/in/");
        if (parts[1]) {
           const username = parts[1].replace("/", "").split("?")[0];
           mockName = username.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        }
      }
      
      setPayload((prev) => ({
        ...prev,
        linkedinUrl,
        displayName: mockName,
        headline: "Software Engineer & Builder",
        companyOrProject: "Tech Co.",
        city: "San Francisco, CA",
        whatYouDo: "I build responsive, modern web applications and AI-driven tools.",
        whoYouHelp: "Startups, enterprises, and ambitious founders.",
      }));
      
      setImportingLinkedin(false);
      setLinkedinMode(false);
      // Skip the what/who questions if we fill them here, go to step 5:
      setStep(5);
    }, 2500);
  };

  const handleNext = async () => {
    if (step < 7) {
      setStep(step + 1);
    } else if (step === 7) {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/generate-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
        const data = await res.json();
        setGenerated(data);
        setStep(8);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("liais_user_id") || crypto.randomUUID();
      localStorage.setItem("liais_user_id", userId);
      await fetch("/api/profile/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, payload, generated }),
      });
      navigate("/dashboard");
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, loading]);

  return (
    <div className="min-h-screen bg-[#F3F3F1] sm:py-8 px-0 sm:px-4 flex justify-center font-sans tracking-normal relative selection:bg-[#D2E823] selection:text-[#111]">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 z-0"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3 z-0"></div>

      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-3xl sm:border border-white sm:rounded-[2.5rem] flex flex-col relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden z-10 h-[100dvh] sm:h-auto sm:min-h-[800px]">
        <div className="absolute top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-xl border-b border-white z-10 flex items-center px-6 lg:px-8 justify-between">
          <div className="font-bold text-xl font-[family-name:var(--font-heading)] text-[#111] flex items-center gap-3">
            <div className="w-8 h-8 set-bg-dark rounded-xl flex items-center justify-center text-white text-sm shadow-sm bg-[#111]">L</div>
            <span className="tracking-tight">Liais</span>
            <span className="text-slate-400 font-medium text-sm hidden sm:inline ml-1 uppercase tracking-widest text-[10px]">Setup Agent</span>
          </div>
          <div className="hidden sm:flex space-x-1.5 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-28 pb-32 px-6 lg:px-12 space-y-2">
          
          <AIBubble>
            <p>Hi there. Let's get your Liais up and running.</p>
            <p>First, what's your primary goal for this link?</p>
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {["Business partnerships", "Consulting inquiries", "Media / podcast invites", "Hiring / talent", "Investor intros", "Other"].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { updatePayload("primaryConnectionGoal", opt); handleNext() }}
                    className="p-5 text-left rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-[#111] hover:ring-1 hover:ring-[#111] text-[#111] font-semibold text-[15px] transition-all active:scale-[0.98]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </AIBubble>

          {step > 1 && (
            <>
              <UserBubble>{payload.primaryConnectionGoal}</UserBubble>
              <AIBubble>
                <p>Amazing.</p>
                <p>And what best describes your role?</p>
                {step === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {["Founder", "Consultant", "BD / Sales", "Creator", "Operator", "Job seeker"].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => { updatePayload("personaType", opt); handleNext() }}
                        className="p-5 text-left rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-[#111] hover:ring-1 hover:ring-[#111] text-[#111] font-semibold text-[15px] transition-all active:scale-[0.98]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </AIBubble>
            </>
          )}

          {step > 2 && (
            <>
              <UserBubble>{payload.personaType}</UserBubble>
              <AIBubble>
                <p>Got it!</p>
                <p>I need a few basic details so I know exactly who I'll be representing.</p>
                {step === 3 && (
                  <div className="space-y-4 mt-6">
                    {!linkedinMode ? (
                      <>
                        <button onClick={() => setLinkedinMode(true)} className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl border border-[#0077b5]/20 bg-[#0077b5]/5 hover:bg-[#0077b5]/10 text-[#0077b5] font-bold text-[15px] transition-colors mb-2">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          Import from LinkedIn
                        </button>
                        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2"><div className="flex-1 h-px bg-slate-200"></div>OR FILL MANUALLY<div className="flex-1 h-px bg-slate-200"></div></div>
                        <Input placeholder="Display Name (e.g., Jane Doe)" value={payload.displayName} onChange={e => updatePayload("displayName", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm h-14 text-[16px] px-5 focus:ring-2 focus:ring-[#111]/10" />
                        <Input placeholder="Headline (e.g., CEO at Acme Corp)" value={payload.headline} onChange={e => updatePayload("headline", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm h-14 text-[16px] px-5 focus:ring-2 focus:ring-[#111]/10" />
                        <Input placeholder="Company or Project" value={payload.companyOrProject} onChange={e => updatePayload("companyOrProject", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm h-14 text-[16px] px-5 focus:ring-2 focus:ring-[#111]/10" />
                        <Input placeholder="City (Optional)" value={payload.city} onChange={e => updatePayload("city", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm h-14 text-[16px] px-5 focus:ring-2 focus:ring-[#111]/10" />
                        <Button onClick={handleNext} disabled={!payload.displayName || !payload.headline} className="w-full sm:w-auto px-8 rounded-2xl bg-[#D2E823] hover:bg-[#C2D812] text-[#111] shadow-lg shadow-[#D2E823]/20 h-14 font-bold text-[16px] transition-transform active:scale-95">Continue →</Button>
                      </>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        <div className="w-16 h-16 bg-[#0077b5]/5 rounded-full absolute -top-4 -right-4 -z-0"></div>
                        <p className="font-bold text-[#111] mb-2 text-[18px] relative z-10">Connect LinkedIn</p>
                        <p className="text-slate-500 text-[15px] mb-5 leading-relaxed relative z-10">Import your headline, experience, and background seamlessly via your public URL.</p>
                        <Input placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="bg-slate-50 border-slate-200 rounded-2xl h-14 text-[16px] px-5 mb-4 focus:bg-white focus:ring-2 focus:ring-[#0077b5]/20 relative z-10" />
                        <div className="flex gap-3 relative z-10">
                          <Button onClick={() => setLinkedinMode(false)} variant="outline" className="h-14 rounded-2xl px-6 font-bold text-[15px]">Cancel</Button>
                          <Button onClick={handleLinkedinImport} disabled={importingLinkedin || !linkedinUrl.includes('linkedin.com')} className="flex-1 h-14 rounded-2xl bg-[#0077b5] hover:bg-[#006097] text-white font-bold text-[15px] transition-transform active:scale-95 shadow-md">
                            {importingLinkedin ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"></div> Extracting...</> : "Import Data"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AIBubble>
            </>
          )}

          {step > 3 && (
            <>
              <UserBubble>
                {payload.displayName} • {payload.headline}
                <br/>{payload.companyOrProject} • {payload.city}
              </UserBubble>
              <AIBubble>
                <p>Thanks {payload.displayName.split(" ")[0]}!</p>
                <p>What's the main focus of your work, and who do you typically help out?</p>
                {step === 4 && (
                  <div className="space-y-4 mt-6">
                    <Textarea placeholder="E.g., I run a boutique design agency building brands for AI startups..." value={payload.whatYouDo} onChange={e => updatePayload("whatYouDo", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm min-h-[120px] text-[16px] p-5 focus:ring-2 focus:ring-[#111]/10 resize-none" />
                    <Input placeholder="E.g., Early stage founders, Marketing Directors" value={payload.whoYouHelp} onChange={e => updatePayload("whoYouHelp", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm h-14 text-[16px] px-5 focus:ring-2 focus:ring-[#111]/10" />
                    <Button onClick={handleNext} disabled={!payload.whatYouDo || !payload.whoYouHelp} className="w-full sm:w-auto px-8 rounded-2xl bg-[#D2E823] hover:bg-[#C2D812] text-[#111] shadow-lg shadow-[#D2E823]/20 h-14 font-bold text-[16px] transition-transform active:scale-95">Continue →</Button>
                  </div>
                )}
              </AIBubble>
            </>
          )}

          {step > 4 && (
            <>
              <UserBubble>I do {payload.whatYouDo || "..."} <br/>I help {payload.whoYouHelp || "..."}</UserBubble>
              <AIBubble>
                <p>What's on your plate right now?</p>
                <p>I'll use this to smartly filter and qualify anyone who reaches out.</p>
                {step === 5 && (
                  <div className="space-y-4 mt-6">
                    <Textarea placeholder="E.g., Raising seed round, exploring new startup ideas, actively seeking senior frontend roles..." value={payload.currentFocus} onChange={e => updatePayload("currentFocus", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm min-h-[120px] text-[16px] p-5 focus:ring-2 focus:ring-[#111]/10 resize-none" />
                    <Input placeholder="Topics you like to discuss (Optional)" value={payload.topicsYouLike} onChange={e => updatePayload("topicsYouLike", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm h-14 text-[16px] px-5 focus:ring-2 focus:ring-[#111]/10" />
                    <Button onClick={handleNext} disabled={!payload.currentFocus} className="w-full sm:w-auto px-8 rounded-2xl bg-[#D2E823] hover:bg-[#C2D812] text-[#111] shadow-lg shadow-[#D2E823]/20 h-14 font-bold text-[16px] transition-transform active:scale-95">Continue →</Button>
                  </div>
                )}
              </AIBubble>
            </>
          )}

          {step > 5 && (
            <>
              <UserBubble>Focus: {payload.currentFocus || "..."} <br/>Topics: {payload.topicsYouLike || "..."}</UserBubble>
              <AIBubble>
                <p>Almost there!</p>
                <p>How would you like me to sound when I'm chatting with your visitors?</p>
                {step === 6 && (
                  <div className="space-y-5 mt-6">
                    <div className="flex gap-3 flex-wrap">
                      {["Professional & Polite", "Direct & Concise", "Warm & Energetic", "Witty & Clever"].map(t => (
                        <button key={t} onClick={() => updatePayload("secretaryTone", t)} className={`px-5 py-3 rounded-2xl font-semibold text-[14px] transition-all border ${payload.secretaryTone === t ? "bg-[#111] text-white border-[#111] shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>{t}</button>
                      ))}
                    </div>
                    <Input placeholder="Or write custom tone..." value={payload.secretaryTone} onChange={e => updatePayload("secretaryTone", e.target.value)} className="bg-white border-slate-200 rounded-2xl shadow-sm h-14 text-[16px] px-5 focus:ring-2 focus:ring-[#111]/10" />
                    <Button onClick={handleNext} className="w-full sm:w-auto px-8 rounded-2xl bg-[#D2E823] hover:bg-[#C2D812] text-[#111] shadow-lg shadow-[#D2E823]/20 h-14 font-bold text-[16px] transition-transform active:scale-95">Continue →</Button>
                  </div>
                )}
              </AIBubble>
            </>
          )}

          {step > 6 && (
            <>
              <UserBubble>Tone: {payload.secretaryTone}</UserBubble>
              <AIBubble>
                <p>Perfect. I'm ready.</p>
                <p>Shall we bring your AI Secretary to life?</p>
                {step === 7 && (
                  <div className="mt-8">
                    <Button onClick={handleNext} disabled={loading} className="w-full sm:w-auto px-10 rounded-[1.5rem] bg-[#111] hover:bg-slate-800 text-white h-16 font-bold text-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-transform hover:scale-105 active:scale-95">
                      {loading ? (
                        <span className="flex items-center space-x-3"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div><span>Generating Models...</span></span>
                      ) : "Generate AI Secretary"}
                    </Button>
                  </div>
                )}
              </AIBubble>
            </>
          )}

          {step > 7 && (
            <>
              <UserBubble>Generate my secretary</UserBubble>
              <AIBubble>
                <p>Done!</p>
                <p>Here's a preview of your new AI Secretary:</p>
                
                <Card className="w-full mt-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 overflow-hidden bg-white p-0 relative">
                  <div className="h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#D2E823] to-transparent"></div>
                     <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  <CardContent className="p-6 sm:p-8 pt-0 relative">
                    <div className="flex justify-between items-end -mt-12 mb-5 relative z-10">
                      <div className="w-24 h-24 bg-white rounded-[1.5rem] p-1 shadow-xl shadow-slate-900/10">
                        <div className="w-full h-full bg-[#111] text-white rounded-[1.2rem] flex items-center justify-center text-4xl font-bold font-[family-name:var(--font-heading)] hover:scale-105 transition-transform duration-300">
                          {payload.displayName[0]}
                        </div>
                      </div>
                      <div className="mb-2 flex items-center space-x-1.5 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <span>Active Agent</span>
                      </div>
                    </div>

                    <div className="text-left mb-6">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                         <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] leading-tight text-[#111]">
                           {payload.displayName}
                         </h3>
                         <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">{payload.personaType || "Pro"}</span>
                      </div>
                      
                      <p className="text-slate-600 font-medium text-[15px] sm:text-[16px] max-w-full leading-snug">
                        {payload.headline}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                         {payload.companyOrProject && (
                           <div className="flex items-center text-[13px] font-medium text-slate-500">
                              <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              {payload.companyOrProject}
                           </div>
                         )}
                         {payload.city && (
                           <div className="flex items-center text-[13px] font-medium text-slate-500">
                              <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {payload.city}
                           </div>
                         )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                       <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-sm text-left">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Gatekeeper For</p>
                          <p className="text-[13px] font-bold text-slate-800 leading-tight">{payload.primaryConnectionGoal || "General Inquiries"}</p>
                       </div>
                       <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-sm text-left">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Agent Persona</p>
                          <p className="text-[13px] font-bold text-slate-800 leading-tight">{payload.secretaryTone || "Professional"}</p>
                       </div>
                    </div>
                    
                    {(payload.currentFocus || payload.topicsYouLike) && (
                       <div className="mb-6 flex flex-wrap gap-2 text-left">
                          {payload.currentFocus && <span className="bg-[#D2E823]/20 text-[#111] px-3 py-1 rounded-full text-xs font-bold border border-[#D2E823]/40">⚡ Currently: {payload.currentFocus.substring(0,40)}{payload.currentFocus.length > 40 ? '...' : ''}</span>}
                          {payload.topicsYouLike && <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 lg:hidden">Discussing: {payload.topicsYouLike.substring(0,25)}{payload.topicsYouLike.length > 25 ? '...' : ''}</span>}
                          {payload.topicsYouLike && <span className="hidden lg:inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">Talks about {payload.topicsYouLike}</span>}
                       </div>
                    )}

                    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-left mb-6 relative z-10 shadow-sm overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900 border-r border-slate-200"></div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 pl-2">Executive Brief</p>
                      <p className="text-[13px] sm:text-[14px] text-slate-700 leading-relaxed font-medium pl-2">{generated?.generatedIntro}</p>
                    </div>

                    <div className="w-full bg-[#111] text-white p-5 sm:p-6 rounded-[1.5rem] rounded-tl-sm text-[13px] sm:text-[14px] shadow-xl shadow-slate-900/10 relative overflow-hidden text-left mt-2 border border-slate-800 flex items-start gap-4">
                      <div className="absolute top-0 right-[-100px] w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>
                      <div className="w-8 h-8 rounded-full bg-white text-[#111] flex items-center justify-center text-xs font-bold shrink-0 shadow-sm z-10 ring-4 ring-slate-800">AI</div>
                      <div className="relative z-10 flex-1">
                         <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Preview Interaction</p>
                         <p className="leading-relaxed text-slate-100 font-medium whitespace-pre-line text-[14px] sm:text-[15px]">"{generated?.generatedWelcomeMessage}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <p className="mt-6 font-medium">To save these details and publish your page, set up your account email.</p>
                <div className="space-y-3 mt-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <Input placeholder="Email Address" type="email" className="bg-white rounded-xl shadow-sm h-12" />
                  <Button onClick={handlePublish} disabled={loading} className="w-full rounded-xl bg-slate-900 text-white h-12 font-medium shadow-sm transition-transform active:scale-95">
                    {loading ? "Publishing..." : "Publish Page & Access Dashboard"}
                  </Button>
                </div>
              </AIBubble>
            </>
          )}
          
          <div ref={chatEndRef} className="h-10" />
        </div>
      </div>
    </div>
  );
}

