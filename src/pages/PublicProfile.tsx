import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AIBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-end gap-3 mt-6 animate-in fade-in slide-in-from-bottom-2">
    <div className="w-9 h-9 rounded-full bg-[#111] text-[#D2E823] flex items-center justify-center shrink-0 mb-1 z-10 shadow-md relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#D2E823]/20 to-transparent"></div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    </div>
    <div className="bg-white border border-slate-200 px-5 py-3.5 rounded-[1.5rem] rounded-bl-sm text-[#111] shadow-[0_2px_15px_rgb(0,0,0,0.03)] text-[15px] font-medium leading-relaxed max-w-[85%]">
      {children}
    </div>
  </div>
);

const UserBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-end justify-end mt-6 animate-in fade-in slide-in-from-bottom-2 gap-3">
    <div className="bg-[#111] px-5 py-3.5 rounded-[1.5rem] rounded-br-[0.25rem] text-white shadow-lg shadow-slate-900/10 text-[15px] font-medium leading-relaxed max-w-[82%]">
      {children}
    </div>
    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-500 border border-slate-200 shadow-sm flex items-center justify-center shrink-0 mb-1 z-10 overflow-hidden">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
  </div>
);

export default function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [visitor, setVisitor] = useState<any>({
    visitorName: "",
    visitorCompany: "",
    visitorIntentCategory: "",
    visitorReason: "",
    contactInfo: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, submitted, loading]);

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

  const updateV = (k: string, v: string) => setVisitor((prev: any) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch(`/api/intake/${profile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitor),
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
                 
                 {/* Focus / Goals */}
                 {(profile.currentFocus || profile.topicsYouLike) && (
                   <div className="flex flex-col sm:flex-row gap-3 w-full">
                     {profile.currentFocus && (
                       <div className="flex-1 bg-[#111] rounded-[1.5rem] p-5 flex flex-col hover:bg-black transition-colors cursor-default relative overflow-hidden text-white">
                         <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 blur-xl rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
                         <div className="flex items-center gap-1.5 mb-3 relative z-10">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                           <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Focus</span>
                         </div>
                         <p className="font-semibold text-[14px] leading-relaxed relative z-10">
                           {profile.currentFocus}
                         </p>
                       </div>
                     )}
                     {profile.topicsYouLike && (
                       <div className="flex-1 bg-[#D2E823]/20 border border-[#D2E823]/30 rounded-[1.5rem] p-5 flex flex-col cursor-default relative overflow-hidden text-[#111]">
                         <div className="absolute top-0 left-0 w-24 h-24 bg-white/60 blur-xl rounded-full -translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                         <div className="flex items-center gap-1.5 mb-3 relative z-10">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#111]/30"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
                           <span className="text-[11px] font-bold text-[#111]/50 uppercase tracking-widest">Discusses</span>
                         </div>
                         <p className="font-bold text-[14px] leading-relaxed relative z-10">
                           {profile.topicsYouLike}
                         </p>
                       </div>
                     )}
                   </div>
                 )}

                 {/* Call to action connecting to chat */}
                 <div className="mt-8 w-full">
                   <Button onClick={() => setIsChatOpen(true)} className="w-full flex items-center justify-between rounded-[1.25rem] px-6 py-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-[#111] hover:bg-slate-800 text-white font-bold text-[16px] transition-transform active:scale-95 group">
                     <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#D2E823]/20 text-[#D2E823] flex items-center justify-center">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        </div>
                        <span>Chat with Assistant</span>
                     </div>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                   </Button>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Chat Modal / Overlay */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 lg:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsChatOpen(false)}></div>
            
            {/* Modal Content */}
            <div className="w-full sm:max-w-[460px] bg-[#F2F2F0] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative z-10 border border-white/20 h-[85vh] sm:h-[680px] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 zoom-in-95 duration-300">
              
               {/* Chat Header */}
               <div className="bg-white/90 backdrop-blur-xl border-b border-black/5 px-6 py-4 flex items-center justify-between z-20 shrink-0">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#111] text-[#D2E823] flex items-center justify-center text-[11px] font-bold shadow-md tracking-wider">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                   </div>
                   <div>
                      <div className="text-[#111] font-bold text-[15px] tracking-tight">AI Secretary</div>
                      <div className="text-[#6C6C68] text-[13px] font-medium">Connect with {profile.displayName.split(" ")[0]}</div>
                   </div>
                 </div>
                 <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
               </div>

               {/* Chat Content */}
               <div className="flex-1 p-5 sm:p-6 pb-[200px] overflow-y-auto">
                 <AIBubble>
                   {profile.generatedWelcomeMessage}
                 </AIBubble>

                 {step >= 1 && (
                   <>
                     <UserBubble>I'd like to reach out.</UserBubble>
                     <AIBubble>
                       <p className="text-[#111] font-medium">Great. Who am I speaking with?</p>
                     </AIBubble>
                   </>
                 )}

                 {step >= 2 && (
                   <>
                     <UserBubble>
                       {visitor.visitorName} {visitor.visitorCompany ? `(${visitor.visitorCompany})` : ""}
                     </UserBubble>
                     <AIBubble>
                       <p className="text-[#111] font-medium">Got it. What's the main reason for your request?</p>
                     </AIBubble>
                   </>
                 )}

                 {step >= 3 && (
                   <>
                     <UserBubble>
                       <strong className="block mb-1">{visitor.visitorIntentCategory}</strong>
                       {visitor.visitorReason}
                     </UserBubble>
                     
                     {!submitted ? (
                       <AIBubble>
                         <p className="text-[#111] font-medium">Thanks. Where can {profile.displayName.split(" ")[0]} follow up with you?</p>
                       </AIBubble>
                     ) : (
                       <>
                         <UserBubble>{visitor.contactInfo}</UserBubble>
                         <AIBubble>
                           <div className="flex flex-col items-center justify-center text-center p-4">
                             <div className="w-12 h-12 rounded-[1rem] bg-green-100 text-green-600 flex items-center justify-center mb-4 shadow-inner">
                               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                             </div>
                             <h3 className="font-bold text-[#111] text-[18px] mb-2">Request sent securely.</h3>
                             <p className="text-[14px] text-[#6C6C68] font-medium">Your request has been passed to {profile.displayName.split(" ")[0]}. They will reach out directly.</p>
                           </div>
                         </AIBubble>
                       </>
                     )}
                   </>
                 )}

                 <div ref={chatEndRef} className="h-4 shrink-0" />
               </div>

               {/* Docked Input Area */}
               <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-white/90 backdrop-blur-xl border-t border-black/5 z-20">
                  
                  {step === 0 && (
                    <div className="relative animate-in slide-in-from-bottom-2">
                       <Input 
                         readOnly
                         onClick={() => setStep(1)}
                         placeholder="Type a message to start..." 
                         className="w-full bg-[#F2F2F0] border-transparent rounded-[1.5rem] h-14 pl-5 pr-14 text-[15px] cursor-text focus:ring-2 focus:ring-[#111]/10 focus:border-transparent transition-all shadow-inner font-medium placeholder:font-normal"
                       />
                       <div className="absolute right-2 top-2 w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center cursor-pointer pointer-events-none">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                       </div>
                    </div>
                  )}

                  {step === 1 && (
                     <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                        <div className="flex gap-2">
                          <Input placeholder="Your Full Name" value={visitor.visitorName} onChange={e => updateV("visitorName", e.target.value)} className="flex-1 bg-[#F2F2F0] border-transparent rounded-[1.25rem] h-12 text-[15px] px-5 focus:bg-white focus:ring-2 focus:ring-[#111]/10 shadow-inner" autoFocus />
                          <Input placeholder="Company (Opt)" value={visitor.visitorCompany} onChange={e => updateV("visitorCompany", e.target.value)} className="w-[120px] bg-[#F2F2F0] border-transparent rounded-[1.25rem] h-12 text-[15px] px-4 focus:bg-white focus:ring-2 focus:ring-[#111]/10 shadow-inner" />
                          <Button onClick={() => setStep(2)} className="rounded-[1.25rem] bg-[#111] hover:bg-slate-800 text-white h-12 w-14 shadow-md transition-transform active:scale-95 flex items-center justify-center" disabled={!visitor.visitorName}>
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                          </Button>
                        </div>
                     </div>
                  )}

                  {step === 2 && (
                     <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                       <select 
                         className="w-full px-5 h-12 rounded-[1.25rem] border-transparent bg-[#F2F2F0] shadow-inner outline-none focus:bg-white focus:ring-2 focus:ring-[#111]/10 text-[15px] font-medium text-slate-700 appearance-none"
                         value={visitor.visitorIntentCategory}
                         onChange={e => updateV("visitorIntentCategory", e.target.value)}
                         style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=`http://www.w3.org/2000/svg` viewBox=`0 0 24 24` fill=`none` stroke=`%23666` stroke-width=`2` stroke-linecap=`round` stroke-linejoin=`round`%3e%3cpolyline points=`6 9 12 15 18 9`%3e%3c/polyline%3e%3c/svg%3e')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                       >
                         <option value="" disabled>Select reason...</option>
                         <option value="Partnership">Partnership</option>
                         <option value="Consulting">Consulting / Advice</option>
                         <option value="Interview/Media">Interview / Media</option>
                         <option value="Investing">Investing</option>
                         <option value="Other">Other</option>
                       </select>
                       <div className="relative">
                         <Textarea placeholder="Briefly describe your request..." value={visitor.visitorReason} onChange={e => updateV("visitorReason", e.target.value)} className="bg-[#F2F2F0] border-transparent rounded-[1.25rem] p-4 pr-16 text-[15px] shadow-inner min-h-[60px] max-h-[120px] focus:bg-white focus:ring-2 focus:ring-[#111]/10 resize-none font-medium placeholder:font-normal" />
                         <div className="absolute bottom-2 right-2">
                            <Button onClick={() => setStep(3)} className="rounded-[1rem] bg-[#111] hover:bg-slate-800 text-white w-10 h-10 p-0 flex items-center justify-center shadow-sm transition-transform active:scale-95" disabled={!visitor.visitorIntentCategory || !visitor.visitorReason}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                            </Button>
                         </div>
                       </div>
                     </div>
                  )}

                  {step === 3 && !submitted && (
                     <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                       <div className="relative">
                         <Input placeholder="Email or Phone Number" value={visitor.contactInfo} onChange={e => updateV("contactInfo", e.target.value)} className="w-full bg-[#F2F2F0] border-transparent rounded-[1.25rem] h-14 pl-5 pr-[110px] text-[15px] focus:bg-white focus:ring-2 focus:ring-[#111]/10 shadow-inner" />
                         <div className="absolute bottom-2 right-2">
                           <Button onClick={handleSubmit} className="rounded-[1rem] bg-[#D2E823] hover:bg-[#C2D812] text-[#111] h-10 px-5 font-bold text-[14px] shadow-sm transition-transform active:scale-95" disabled={loading || !visitor.contactInfo}>
                             {loading ? <div className="w-4 h-4 border-2 border-[#111]/30 border-t-[#111] rounded-full animate-spin"></div> : "Submit"}
                           </Button>
                         </div>
                       </div>
                     </div>
                  )}

                  {submitted && (
                     <div className="w-full flex items-center justify-center py-2 animate-in slide-in-from-bottom-2">
                        <span className="text-[#6C6C68] font-semibold text-[14px]">Chat ended. You may close this window.</span>
                     </div>
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

