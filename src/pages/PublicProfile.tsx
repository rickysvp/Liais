import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [visitor, setVisitor] = useState<any>({
    visitorName: "",
    visitorCompany: "",
    visitorBackground: "",
    visitorIntentCategory: "",
    visitorReason: "",
    requestedNextStep: "",
    email: "",
    linkedin: "",
    whatsapp: "",
    website: "",
    consentToContact: false
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/p/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setProfile(d);
        } else {
          setError(d.error);
        }
      })
      .catch(() => setError("Failed to load profile"));
  }, [slug]);

  useEffect(() => {
    if (isChatOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isChatOpen]);

  if (error) return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-12 text-center text-slate-500 font-medium">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[#111] mb-2">Profile Not Found</h2>
      <p className="max-w-md">{error}</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-12 text-center text-slate-500 font-medium">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <p>Loading Profile...</p>
      </div>
    </div>
  );

  const updateV = (k: string, v: any) => setVisitor((prev: any) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Collect the actual payload
      const payload = {
        ...visitor,
        contactInfo: visitor.email || visitor.linkedin || visitor.whatsapp || visitor.website || "No contact info provided"
      };
      
      await fetch(`/api/intake/${profile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] py-10 px-4 sm:px-8 lg:px-12 flex justify-center font-sans tracking-normal relative selection:bg-[#E8EECC] selection:text-[#111]">
      {/* Abstract background blur for premium depth */}
      <div className="fixed top-[10%] left-[10%] w-[600px] h-[600px] bg-[#D2E823]/5 rounded-full blur-[100px] pointer-events-none -z-0"></div>
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[500px] bg-slate-300/10 rounded-full blur-[120px] pointer-events-none -z-0"></div>

      <div className="w-full max-w-[540px] mx-auto z-10 relative pt-4 lg:pt-12 pb-12">
        
        <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative border border-slate-100">
          
          {/* Profile Header */}
          <div className="w-full bg-white relative z-30 shrink-0 flex flex-col pb-8">
             {/* Decorative Background Header */}
             <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#D2E823]/30 to-transparent pointer-events-none"></div>

             <div className="px-6 pt-8 pb-4">
               <div className="flex flex-col items-center relative">
                 <div className="relative">
                   <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#111] text-white flex items-center justify-center text-4xl sm:text-5xl font-[family-name:var(--font-heading)] font-bold shadow-lg border-[4px] border-white z-10 relative object-cover ring-1 ring-slate-100">
                     {profile.displayName[0]}
                   </div>
                   <div className="absolute bottom-2 right-2 w-[18px] h-[18px] bg-[#D2E823] rounded-full border-[3px] border-white z-20 shadow-sm ring-1 ring-slate-100"></div>
                 </div>

                 <h1 className="text-[26px] sm:text-[30px] font-[family-name:var(--font-heading)] font-extrabold tracking-tight text-[#111] text-center leading-tight mt-4">
                   {profile.displayName}
                 </h1>
                 <p className="text-[#6C6C68] font-medium text-[15px] sm:text-[16px] text-center mt-2 max-w-[380px] leading-relaxed">
                   {profile.headline}
                 </p>

                 {/* Social Links Panel */}
                 {(profile.linkedinUrl || profile.twitterUrl || profile.websiteUrl) && (
                   <div className="flex items-center justify-center gap-2 mt-5 w-full">
                     {profile.linkedinUrl && (
                       <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex-1 max-w-[90px] flex items-center justify-center py-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#0077b5] text-slate-600 hover:text-white hover:border-[#0077b5] transition-all group shadow-sm">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                       </a>
                     )}
                     {profile.twitterUrl && (
                       <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex-1 max-w-[90px] flex items-center justify-center py-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1DA1F2] text-slate-600 hover:text-white hover:border-[#1DA1F2] transition-all group shadow-sm">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                       </a>
                     )}
                     {profile.websiteUrl && (
                       <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1 max-w-[90px] flex items-center justify-center py-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-800 text-slate-600 hover:text-white hover:border-slate-800 transition-all group shadow-sm">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                       </a>
                     )}
                   </div>
                 )}

               </div>

               {/* Bento Cards / Content Blocks */}
               <div className="flex flex-col gap-3 mt-8">
                 {/* About Intro Card */}
                 <div className="bg-[#F2F2F0] rounded-[1.5rem] p-5 sm:p-6 cursor-default relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                   <div className="flex items-center gap-1.5 mb-3 relative z-10">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">About</span>
                   </div>
                   <p className="text-[#111] font-medium text-[15px] leading-relaxed relative z-10">
                     {profile.generatedIntro}
                   </p>
                 </div>
                 
                 {/* Business Intake / Guardrails */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
                   {/* Best reasons to reach out */}
                   <div className="bg-white border border-slate-200 rounded-[1.25rem] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                     <div className="flex items-center gap-2.5 mb-4">
                       <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                       </div>
                       <h3 className="font-bold text-[#111] text-[14px]">Best reasons to reach out</h3>
                     </div>
                     <ul className="space-y-3">
                       {["Strategic partnerships", "Media conversations", "Advisory requests", "Product collaboration", "Warm introductions"].map((reason, i) => (
                         <li key={i} className="flex items-start gap-2.5 text-[13px] font-medium text-slate-600 leading-tight">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                           {reason}
                         </li>
                       ))}
                     </ul>
                   </div>
                   
                   {/* Not a fit for */}
                   <div className="bg-[#FAF9F7] border border-slate-200 rounded-[1.25rem] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                     <div className="flex items-center gap-2.5 mb-4">
                       <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                       </div>
                       <h3 className="font-bold text-[#111] text-[14px]">Not a fit for</h3>
                     </div>
                     <ul className="space-y-3">
                       {["Cold sales outreach", "Generic recruiting spam", "Unrelated service pitches", "Mass outreach without context"].map((reason, i) => (
                         <li key={i} className="flex items-start gap-2.5 text-[13px] font-medium text-slate-500 leading-tight">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                           {reason}
                         </li>
                       ))}
                     </ul>
                   </div>
                 </div>

                 {/* Intake Entry Area */}
                 <div className="mt-8 w-full border border-slate-200 p-6 sm:p-8 rounded-[1.5rem] bg-white shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                   <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between mb-6 relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center shadow-md">
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-[#111] text-[16px] tracking-tight">Business Intake</h3>
                          <p className="text-slate-500 text-[13px] font-medium">Structured Request</p>
                        </div>
                     </div>
                   </div>
                   
                   <p className="text-[#111] font-medium text-[16px] sm:text-[18px] mb-6 leading-relaxed relative z-10 max-w-[400px]">
                     Select the primary purpose of your inquiry to begin the intake process.
                   </p>

                   <div className="flex flex-wrap gap-2.5 relative z-10">
                     {["Partnership", "Media", "Hiring", "Advisory", "Other"].map((intent, i) => (
                       <button
                         key={i}
                         onClick={() => {
                           updateV("visitorIntentCategory", intent);
                           setStep(2);
                           setIsChatOpen(true);
                         }}
                         className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 !text-slate-800 font-bold text-[13px] rounded-full transition-colors shadow-sm ring-1 ring-slate-200/50"
                       >
                         {intent}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Intake Modal / Overlay */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 lg:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitted && setIsChatOpen(false)}></div>
            
            {/* Modal Content */}
            <div className="w-full sm:max-w-[500px] bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative z-10 border border-slate-100 h-[85vh] sm:h-[680px] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 zoom-in-95 duration-300">
              
               {/* Header */}
               <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between z-20 shrink-0">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center shadow-md">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                   </div>
                   <div>
                      <div className="text-[#111] font-bold text-[15px] tracking-tight">Business Intake</div>
                      <div className="text-slate-500 text-[13px] font-medium">For {profile.displayName.split(" ")[0]}</div>
                   </div>
                 </div>
                 {!submitted && (
                   <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                   </button>
                 )}
               </div>

               {/* Progress Bar */}
               {!submitted && (
                   <div className="w-full bg-slate-100 h-1 shrink-0">
                     <div className="bg-[#111] h-1 transition-all duration-300" style={{ width: `${(Math.max(1, step) / 6) * 100}%` }}></div>
                   </div>
               )}

               {/* Content Area */}
               <div className="flex-1 p-6 sm:p-8 overflow-y-auto w-full relative content-start flex flex-col items-stretch">
                   
                   {submitted ? (
                     <div className="flex flex-col items-center justify-center text-center py-10 my-auto animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6 ring-8 ring-green-50/50">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                        <h3 className="font-bold text-[#111] text-[22px] mb-3">Request Received</h3>
                        <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">
                          Your introduction has been structured and securely passed to {profile.displayName.split(" ")[0]}. You may now close this window.
                        </p>
                        <Button variant="outline" onClick={() => setIsChatOpen(false)} className="mt-8 px-6 rounded-xl font-bold h-12 border-slate-200">
                          Close Window
                        </Button>
                     </div>
                   ) : (
                     <>
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                               <h3 className="text-lg font-bold text-[#111] mb-2">Reason for reaching out</h3>
                               <p className="text-sm text-slate-500 mb-6">Select the primary purpose of your inquiry.</p>
                               <div className="flex flex-col gap-3">
                                   {["Partnership", "Media", "Hiring", "Advisory", "Other"].map(intent => (
                                       <button 
                                          key={intent} 
                                          onClick={() => { updateV("visitorIntentCategory", intent); setStep(2); }}
                                          className={`text-left px-5 py-4 rounded-xl border ${visitor.visitorIntentCategory === intent ? "border-[#111] bg-slate-50 ring-1 ring-[#111]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"} font-medium text-[15px] transition-all`}
                                       >
                                           {intent}
                                       </button>
                                   ))}
                               </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full flex-1">
                               <h3 className="text-lg font-bold text-[#111] mb-2">Who you are</h3>
                               <p className="text-sm text-slate-500 mb-6">Basic details to help {profile.displayName.split(" ")[0]} understand your background.</p>
                               <div className="space-y-4">
                                  <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
                                     <Input autoFocus value={visitor.visitorName} onChange={e => updateV("visitorName", e.target.value)} className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-[15px] focus:bg-white" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Role</label>
                                         <Input value={visitor.visitorBackground} onChange={e => updateV("visitorBackground", e.target.value)} className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-[15px] focus:bg-white" />
                                      </div>
                                      <div>
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Company</label>
                                         <Input value={visitor.visitorCompany} onChange={e => updateV("visitorCompany", e.target.value)} className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-[15px] focus:bg-white" />
                                      </div>
                                  </div>
                               </div>
                               <div className="mt-auto pt-8">
                                  <Button onClick={() => setStep(3)} disabled={!visitor.visitorName} className="w-full h-12 rounded-xl bg-[#111] hover:bg-slate-800 text-white font-bold text-[15px]">Continue</Button>
                                  <button onClick={() => setStep(1)} className="w-full text-center mt-4 text-sm font-medium text-slate-500 hover:text-slate-800">Back</button>
                               </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full flex-1">
                               <h3 className="text-lg font-bold text-[#111] mb-2">Why this is relevant</h3>
                               <p className="text-sm text-slate-500 mb-6">Briefly explain the context and why this matters specifically to {profile.displayName.split(" ")[0]}.</p>
                               <div className="flex-1 min-h-[150px]">
                                  <Textarea autoFocus value={visitor.visitorReason} onChange={e => updateV("visitorReason", e.target.value)} placeholder="Provide 2-3 sentences of context..." className="w-full h-full min-h-[150px] bg-slate-50 border-slate-200 rounded-xl p-4 text-[15px] focus:bg-white resize-none" />
                               </div>
                               <div className="mt-8 pt-4">
                                  <Button onClick={() => setStep(4)} disabled={!visitor.visitorReason} className="w-full h-12 rounded-xl bg-[#111] hover:bg-slate-800 text-white font-bold text-[15px]">Continue</Button>
                                  <button onClick={() => setStep(2)} className="w-full text-center mt-4 text-sm font-medium text-slate-500 hover:text-slate-800">Back</button>
                               </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full flex-1">
                               <h3 className="text-lg font-bold text-[#111] mb-2">What you're hoping for next</h3>
                               <p className="text-sm text-slate-500 mb-6">What is the immediate action or outcome you are seeking?</p>
                               <div className="flex flex-col gap-3">
                                   {["A short reply", "An intro call", "Feedback", "Partnership discussion", "Send materials"].map(outcome => (
                                       <button 
                                          key={outcome} 
                                          onClick={() => { updateV("requestedNextStep", outcome); setStep(5); }}
                                          className={`text-left px-5 py-4 rounded-xl border ${visitor.requestedNextStep === outcome ? "border-[#111] bg-slate-50 ring-1 ring-[#111]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"} font-medium text-[15px] transition-all`}
                                       >
                                           {outcome}
                                       </button>
                                   ))}
                               </div>
                               <div className="mt-auto pt-8">
                                  <button onClick={() => setStep(3)} className="w-full text-center mt-4 text-sm font-medium text-slate-500 hover:text-slate-800">Back</button>
                               </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full flex-1">
                               <h3 className="text-lg font-bold text-[#111] mb-2">Contact for follow-up</h3>
                               <p className="text-sm text-slate-500 mb-6">How can {profile.displayName.split(" ")[0]} reach you regarding this request?</p>
                               <div className="space-y-4">
                                  <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email <span className="text-slate-400 lowercase normal-case ml-1">(preferred)</span></label>
                                     <Input type="email" autoFocus value={visitor.email} onChange={e => updateV("email", e.target.value)} className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-[15px] focus:bg-white" placeholder="you@company.com" />
                                  </div>
                                  <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">LinkedIn Profile <span className="text-slate-400 lowercase normal-case ml-1">(optional)</span></label>
                                     <Input value={visitor.linkedin} onChange={e => updateV("linkedin", e.target.value)} className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-[15px] focus:bg-white" placeholder="linkedin.com/in/..." />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">WhatsApp/Telegram <span className="text-slate-400 lowercase normal-case ml-1">(optional)</span></label>
                                       <Input value={visitor.whatsapp} onChange={e => updateV("whatsapp", e.target.value)} className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-[15px] focus:bg-white" placeholder="+1..." />
                                    </div>
                                    <div>
                                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Company Website <span className="text-slate-400 lowercase normal-case ml-1">(optional)</span></label>
                                       <Input value={visitor.website} onChange={e => updateV("website", e.target.value)} className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4 text-[15px] focus:bg-white" placeholder="acme.com" />
                                    </div>
                                  </div>
                                  
                                  <div className="pt-2 flex items-start gap-3 mt-4">
                                     <button 
                                        onClick={() => updateV("consentToContact", !visitor.consentToContact)} 
                                        className={`w-5 h-5 shrink-0 rounded border mt-0.5 flex items-center justify-center transition-colors ${visitor.consentToContact ? 'bg-[#111] border-[#111] text-white' : 'bg-white border-slate-300'}`}
                                     >
                                        {visitor.consentToContact && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                     </button>
                                     <div className="text-[13px] text-slate-600 font-medium leading-snug">
                                        I'm okay being contacted regarding this request. This information is only used for follow-up on this inquiry.
                                     </div>
                                  </div>
                               </div>

                               <div className="mt-auto pt-8">
                                  <Button onClick={() => setStep(6)} disabled={!(visitor.email || visitor.linkedin || visitor.whatsapp || visitor.website) || !visitor.consentToContact} className="w-full h-12 rounded-xl bg-[#111] hover:bg-slate-800 text-white font-bold text-[15px]">Continue</Button>
                                  <button onClick={() => setStep(4)} className="w-full text-center mt-4 text-sm font-medium text-slate-500 hover:text-slate-800">Back</button>
                               </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full flex-1">
                               <h3 className="text-lg font-bold text-[#111] mb-2">Review Summary</h3>
                               <p className="text-sm text-slate-500 mb-6">Here is how your request will be introduced.</p>
                               
                               <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-5 overflow-y-auto space-y-4 shadow-inner">
                                  <div>
                                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">From</div>
                                     <div className="text-[14px] text-[#111] font-medium">{visitor.visitorName} {visitor.visitorBackground && `· ${visitor.visitorBackground}`} {visitor.visitorCompany && `· ${visitor.visitorCompany}`}</div>
                                     <div className="text-[13px] text-slate-500 mt-1">
                                        {[visitor.email, visitor.linkedin, visitor.whatsapp, visitor.website].filter(Boolean).join(" · ")}
                                     </div>
                                  </div>
                                  <div className="h-px w-full bg-slate-200"></div>
                                  <div>
                                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Intent</div>
                                     <div className="text-[14px] text-[#111] font-medium">{visitor.visitorIntentCategory}</div>
                                  </div>
                                  <div className="h-px w-full bg-slate-200"></div>
                                  <div>
                                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Context</div>
                                     <div className="text-[14px] text-[#111] leading-relaxed whitespace-pre-wrap">{visitor.visitorReason}</div>
                                  </div>
                                  <div className="h-px w-full bg-slate-200"></div>
                                  <div>
                                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Desired Next Step</div>
                                     <div className="text-[14px] text-[#111] font-medium">{visitor.requestedNextStep}</div>
                                  </div>
                               </div>

                               <div className="mt-6 pt-2 shrink-0">
                                  <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-xl bg-[#111] hover:bg-slate-800 text-white font-bold text-[15px]">
                                     {loading ? "Submitting..." : "Confirm & Submit"}
                                  </Button>
                                  <button onClick={() => setStep(5)} className="w-full text-center mt-4 text-sm font-medium text-slate-500 hover:text-slate-800">Edit Details</button>
                               </div>
                            </div>
                        )}
                     </>
                   )}
               </div>
            </div>
          </div>
        )}

        {/* Footer Brand */}
        <div className="mt-8 mb-10 text-center relative z-10 w-full flex justify-center pb-8">
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-white hover:bg-white transition-colors shadow-sm">
               <span className="text-slate-400 font-medium text-[12px]">Powered by</span>
               <div className="font-bold text-[14px] tracking-tight flex items-center gap-1.5 font-[family-name:var(--font-heading)] text-[#111]">
                 <div className="w-4 h-4 bg-[#111] rounded-full flex items-center justify-center text-white text-[8px]">L</div>
                 Liais
               </div>
            </a>
        </div>
      </div>
    </div>
  );
}

