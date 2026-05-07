import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function VisitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conv, setConv] = useState<any>(null);

  useEffect(() => {
    fetch("/api/inbox")
      .then(r => r.json())
      .then((data: any[]) => {
        const found = data.find((d: any) => d.id === id);
        setConv(found);
      });
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/inbox/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setConv({ ...conv, status });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!conv) return (
    <div className="flex justify-center py-24">
       <div className="w-6 h-6 border-2 border-slate-200 border-t-[#111] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <button 
          onClick={() => navigate("/dashboard/inbox")} 
          className="inline-flex items-center text-[13px] font-bold text-slate-400 hover:text-[#111] uppercase tracking-widest transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to List
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        
        {/* Header Section */}
        <div className="px-8 sm:px-12 py-10 border-b border-slate-100 flex flex-col md:flex-row gap-8 justify-between items-start md:items-end bg-slate-50/50">
           <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Target Profile</div>
              <h1 className="text-4xl font-bold font-serif text-[#111] tracking-tight">{conv.visitorName || "Anonymous Visitor"}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                 {conv.visitorCompany && (
                   <span className="text-[14px] text-slate-600 font-medium">{conv.visitorCompany}</span>
                 )}
                 {conv.visitorCompany && conv.visitorBackground && <span className="text-slate-300">•</span>}
                 {conv.visitorBackground && (
                   <span className="text-[14px] text-slate-600 font-medium">{conv.visitorBackground}</span>
                 )}
                 <span className="text-slate-300">•</span>
                 <span className="text-[14px] text-[#111] font-semibold">{conv.visitorIntentCategory || "Inquiry"}</span>
              </div>
           </div>

           <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
             <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">AI Qualification</div>
             <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest
                ${conv.qualificationLevel?.toLowerCase().includes('high') ? 'bg-[#111] text-white shadow-md' : 
                  conv.qualificationLevel?.toLowerCase().includes('possible') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 
                  'bg-white text-slate-500 border border-slate-200'}`}
             >
               {conv.qualificationLevel || "Unclear"}
             </div>
           </div>
        </div>

        <div className="p-8 sm:p-12">
           <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 sm:gap-16">
              
              {/* Main Content Area */}
              <div className="space-y-12">
                 
                 {/* AI Summary Block */}
                 <div className="relative">
                    <div className="absolute -left-6 top-1.5 w-1.5 h-6 bg-[#111] rounded-r-md"></div>
                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#111] animate-pulse"></div>
                      Executive Summary
                    </h3>
                    <p className="text-[16px] text-slate-800 leading-relaxed font-medium">
                      {conv.summaryText || "The AI was unable to generate a summary for this request."}
                    </p>
                 </div>

                 {/* Original Context */}
                 <div>
                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Provided Context</h3>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[1.5rem]">
                       <p className="text-[15px] text-slate-600 leading-relaxed italic">
                         "{conv.visitorReason || "No context provided."}"
                       </p>
                    </div>
                 </div>
                 
                 {/* Action Panel within Brief */}
                 <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Decision Needed</h3>
                    
                    {(!conv.status || conv.status === "new") && (
                       <div className="flex flex-wrap gap-3">
                          <Button 
                           onClick={() => updateStatus("accepted")}
                           className="bg-[#111] hover:bg-slate-800 text-white rounded-xl h-12 px-8 font-bold text-[14px]"
                          >
                            Accept & Setup Next Step
                          </Button>
                          <Button 
                           variant="outline"
                           onClick={() => updateStatus("archived")}
                           className="bg-white hover:bg-slate-50 text-slate-600 rounded-xl h-12 px-8 font-bold text-[14px] border-slate-200"
                          >
                            Archive
                          </Button>
                       </div>
                    )}

                    {conv.status === "accepted" && (
                       <div className="bg-green-50 border border-green-100 p-5 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3 text-green-800 font-bold">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                             Request Accepted
                          </div>
                          <Button className="bg-white hover:bg-slate-50 text-[#111] rounded-xl h-10 px-5 font-bold text-[13px] border border-slate-200 shadow-sm transition-all focus:ring-2 focus:ring-[#111]">
                             Generate Intro Draft
                          </Button>
                       </div>
                    )}

                    {conv.status === "archived" && (
                       <div className="px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[14px] flex items-center gap-2">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          Request Archived
                       </div>
                    )}
                 </div>

              </div>
              
              {/* Sidebar Info Area */}
              <div className="space-y-8 lg:pl-10 lg:border-l border-slate-100">
                 <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Details</h3>
                    <div className="text-[14px] text-[#111] font-semibold break-all">
                       {conv.contactInfo || "Not provided"}
                    </div>
                 </div>

                 {conv.requestedNextStep && (
                   <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Desired Next Step</h3>
                      <div className="text-[14px] text-slate-700 font-medium leading-snug">
                         {conv.requestedNextStep}
                      </div>
                   </div>
                 )}

                 {conv.suggestedAction && (
                   <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Recommendation</h3>
                      <div className="text-[14px] text-slate-700 font-medium leading-snug">
                         {conv.suggestedAction}
                      </div>
                   </div>
                 )}
                 
                 <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Request Received</h3>
                    <div className="text-[13px] text-slate-600 font-medium">
                       {new Date(conv.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                       })}
                    </div>
                 </div>
              </div>
              
           </div>
        </div>

      </div>
    </div>
  );
}
