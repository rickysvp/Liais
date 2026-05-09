import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  en: {
    pricing: "Pricing",
    logIn: "Log in",
    signUpFree: "Sign up free",
    yourAISecretary: "Your AI business secretary.",
    heroTitle: "Let inbound business requests meet your AI first.",
    heroSubtitle: "Introduce who you are, screen incoming intent, and review a clear brief before deciding whether to continue the connection.",
    userNamePlaceholder: "yourname",
    createLiais: "Create your Liais",
    freeText: "It's free, and takes less than a minute.",
    watchDemo: "Watch the intake flow",
    founderCEO: "Founder & CEO",
    aiGreeting: "Hi, I'm Alex's AI secretary. I handle all incoming requests. Who are you?",
    userGreeting: "I'm Ricky. I'd love to reach out about a partnership.",
    aiResponse: "Sounds great. Please provide a bit of context so I can qualify the request.",
    typeMessagePlaceholder: "Type a professional message...",
    intentCaptured: "Intent Captured",
    readyToReview: "Ready to review",
    meetingBooked: "Meeting Booked",
    syncedCalendar: "Synced to Calendar",
  },
  zh: {
    pricing: "定价",
    logIn: "登录",
    signUpFree: "免费注册",
    yourAISecretary: "您的 AI 商务秘书。",
    heroTitle: "让您的入站商业请求先由 AI 处理。",
    heroSubtitle: "介绍自己、筛选来访意图，并在决定是否继续联系之前审阅一份清晰的简报。",
    userNamePlaceholder: "yourname",
    createLiais: "创建您的 Liais",
    freeText: "免费使用，而且只需不到一分钟即可完成。",
    watchDemo: "观看接入流程展示",
    founderCEO: "创始人兼 CEO",
    aiGreeting: "您好，我是 Alex 的 AI 秘书。我负责处理所有收件请求。请问您怎么称呼？",
    userGreeting: "我是 Ricky。我希望能和您探讨一下合作的事宜。",
    aiResponse: "听起来不错。请提供一些背景信息，以便我确认您的请求资格。",
    typeMessagePlaceholder: "输入一条专业的信息...",
    intentCaptured: "已捕捉到意图",
    readyToReview: "随时可查阅",
    meetingBooked: "会议已预订",
    syncedCalendar: "已同步到日历",
  }
};

export default function LandingPage() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-[#F3F3F1] font-sans text-[#111] overflow-hidden relative flex flex-col selection:bg-[#E8EECC] selection:text-[#111]">
      {/* Decorative calm background elements */}
      <div className="fixed top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
      
      {/* Soft color bursts for depth */}
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#D2E823]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="w-full flex items-center justify-between p-6 lg:px-12 max-w-[1400px] mx-auto z-50">
        <img src="/img/logo.png" alt="Liais" className="h-11 w-auto rounded-xl" />
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/pricing" className="text-[#4A4A46] font-semibold hover:text-[#111] transition-colors hidden sm:block">{t.pricing}</Link>
          <Link to="/onboarding" className="text-[#4A4A46] font-semibold hover:text-[#111] transition-colors hidden sm:block">{t.logIn}</Link>
          <Link 
            to="/onboarding" 
            className="rounded-full bg-[#111] text-white px-6 py-3.5 font-bold hover:bg-slate-800 transition-transform hover:scale-[1.02] active:scale-95 text-sm lg:text-base shadow-sm"
          >
            {t.signUpFree}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 py-10 lg:py-0 gap-16 relative z-10">
        
        {/* Left Column - Copy & CTA */}
        <div className="space-y-6 lg:space-y-8 max-w-[640px] text-center lg:text-left pt-10 lg:pt-0 flex flex-col items-center lg:items-start">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-[#111] font-bold text-sm border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
             <span className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D2E823] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b5c71b]"></span>
             </span>
             {t.yourAISecretary}
          </div>
          <h1 className="text-[3.8rem] sm:text-[4.5rem] lg:text-[5rem] font-bold tracking-tight leading-[1.05] font-[family-name:var(--font-heading)] text-[#111]">
            {t.heroTitle}
          </h1>
          <p className="text-xl sm:text-[1.25rem] text-[#4A4A46] font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
            {t.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 w-full max-w-xl mx-auto lg:mx-0">
             <div className="relative flex-1 flex items-center bg-white rounded-2xl sm:rounded-full p-2 border border-slate-200 focus-within:border-[#111] focus-within:ring-2 focus-within:ring-[#111]/20 transition-all shadow-sm">
                <span className="pl-5 text-slate-400 font-semibold text-lg shrink-0">liais.ai/</span>
                <input 
                  type="text" 
                  placeholder={t.userNamePlaceholder} 
                  className="flex-1 bg-transparent outline-none text-[#111] font-semibold text-lg min-w-0 placeholder:text-slate-300 ml-1 py-3" 
                />
             </div>
             <Link 
                to="/onboarding"
                className="h-[4.5rem] sm:h-auto py-4 px-8 sm:px-10 rounded-2xl sm:rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center font-bold text-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-md whitespace-nowrap"
             >
                {t.createLiais}
             </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-2">
            <div className="text-[#6C6C68] font-semibold text-[15px]">
              {t.freeText}
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <Link to="/pricing" className="text-[#111] font-bold text-[15px] underline underline-offset-4 decoration-slate-300 hover:decoration-[#111] transition-colors flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {t.watchDemo}
            </Link>
          </div>
        </div>
        
        {/* Right Column - Visuals */}
        <div className="relative w-full max-w-[500px] lg:max-w-none lg:w-[45vw] flex justify-center items-center mt-8 lg:mt-0 lg:h-[800px] pointer-events-none select-none pb-12 lg:pb-0">
           
           {/* Mobile Application Mockup */}
           <div className="w-[320px] sm:w-[380px] h-[680px] sm:h-[760px] bg-white rounded-[3.5rem] p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative border border-slate-100 flex flex-col z-10 transform lg:rotate-[2deg] hover:rotate-0 transition-transform duration-700">
             
             {/* Notch */}
             <div className="absolute top-3 inset-x-0 h-7 flex justify-center z-30">
               <div className="w-24 sm:w-28 h-6 sm:h-7 bg-[#111] rounded-full"></div>
             </div>

             {/* Screen Area */}
             <div className="w-full h-full bg-[#F3F3F1] rounded-[3rem] overflow-hidden flex flex-col relative relative border-[4px] border-white">
                
                {/* Visual Graphic Header */}
                <div className="absolute top-0 inset-x-0 h-[220px] bg-gradient-to-b from-[#E8EECC] to-[#F3F3F1] z-0"></div>
                
                {/* Profile Block */}
                <div className="w-full pt-16 pb-6 flex flex-col items-center relative z-10">
                   <div className="w-24 h-24 bg-[#111] rounded-[2rem] flex items-center justify-center text-4xl text-white font-[family-name:var(--font-heading)] font-bold shadow-xl shadow-slate-900/10 mb-4">
                     A
                   </div>
                   <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[#111] tracking-tight">Alex Innovator</h3>
                   <p className="text-slate-500 font-medium text-[15px] mt-1">{t.founderCEO}</p>
                </div>

                {/* AI Chat Area */}
                <div className="flex-1 w-full px-5 flex flex-col gap-4 relative z-10">
                   {/* Agent Bubble */}
                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111] text-[10px] font-bold shrink-0 mt-1 shadow-sm ring-4 ring-[#F3F3F1]">AI</div>
                     <div className="bg-white p-5 rounded-[1.5rem] rounded-tl-sm shadow-sm shadow-slate-200/50 border border-slate-100 text-[14px] font-medium text-slate-700 leading-relaxed max-w-[90%]">
                        {t.aiGreeting}
                     </div>
                   </div>

                   {/* User Bubble */}
                   <div className="flex justify-end gap-3 mt-1">
                     <div className="bg-[#111] text-white p-5 rounded-[1.5rem] rounded-tr-sm shadow-md shadow-slate-900/10 text-[14px] font-medium leading-relaxed max-w-[85%] self-end">
                       {t.userGreeting}
                     </div>
                   </div>

                   {/* Agent Bubble (Typing indicator look) */}
                   <div className="flex items-start gap-3 mt-1">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111] text-[10px] font-bold shrink-0 mt-1 shadow-sm ring-4 ring-[#F3F3F1]">AI</div>
                     <div className="bg-white p-5 rounded-[1.5rem] rounded-tl-sm shadow-sm shadow-slate-200/50 border border-slate-100 text-[14px] font-medium text-slate-700 leading-relaxed max-w-[90%] flex flex-col gap-4">
                       <p>{t.aiResponse}</p>
                       <div className="h-10 bg-slate-50 border border-slate-200 rounded-xl w-full flex items-center px-4">
                          <div className="w-1.5 h-4 bg-[#D2E823] animate-pulse rounded-full shadow-[0_0_8px_#D2E823]"></div>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Bottom Input Field */}
                <div className="relative z-20 w-full p-6 pt-12 bg-gradient-to-t from-[#F3F3F1] via-[#F3F3F1] to-transparent mt-auto backdrop-blur-sm">
                   <div className="w-full bg-white h-14 rounded-full border border-slate-200 shadow-sm flex items-center px-5">
                      <span className="text-slate-400 font-medium text-[14px]">{t.typeMessagePlaceholder}</span>
                      <div className="ml-auto w-8 h-8 rounded-full bg-[#111] flex items-center justify-center -mr-1">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                   </div>
                </div>
             </div>
           </div>
           
           {/* Floating Badges */}
           <div className="hidden sm:flex absolute top-[22%] -left-16 bg-white px-6 py-4 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] items-center gap-4 animate-bounce z-20 border border-slate-50" style={{ animationDuration: '4s' }}>
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-[#111]">{t.intentCaptured}</div>
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t.readyToReview}</div>
              </div>
           </div>
           
           <div className="hidden sm:flex absolute bottom-[28%] -right-12 bg-[#111] text-white px-6 py-4 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(17,17,17,0.4)] items-center gap-4 flex -rotate-3 animate-bounce z-20" style={{ animationDuration: '4.5s', animationDelay: '1s' }}>
               <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
               </div>
               <div>
                 <div className="font-bold text-sm tracking-tight">{t.meetingBooked}</div>
                 <div className="text-white/60 text-xs font-medium uppercase tracking-wider">{t.syncedCalendar}</div>
               </div>
           </div>
           
        </div>
      </main>
    </div>
  );
}
