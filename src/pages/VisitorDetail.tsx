import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function VisitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conv, setConv] = useState<any>(null);

  useEffect(() => {
    // Need an endpoint to fetch a single conversation, or fetch all and find
    fetch("/api/inbox")
      .then(r => r.json())
      .then((data: any[]) => {
        const found = data.find(d => d.id === id);
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

  if (!conv) return <div className="p-12 text-slate-500">Loading details...</div>;

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center space-x-4 mb-2">
        <Button variant="ghost" onClick={() => navigate("/dashboard/inbox")} className="-ml-4 text-slate-500 hover:text-slate-900 rounded-xl transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Inbox
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-slate-900">{conv.visitorName || "Anonymous"}</h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">{conv.visitorCompany || "Unknown Company"}</p>
        </div>
        <Badge className={`px-4 py-1.5 text-sm font-medium rounded-full ${conv.qualificationLevel === 'high fit' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 shadow-sm'}`} variant={conv.qualificationLevel === 'high fit' ? "default" : "outline"}>
          {conv.qualificationLevel.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
          <h3 className="font-semibold text-slate-400 uppercase tracking-wider text-sm">Visitor Identity</h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Company</span>
              <span className="text-slate-900 font-medium text-lg">{conv.visitorCompany || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Intent Category</span>
              <span className="text-slate-900 font-medium text-lg">{conv.visitorIntentCategory || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Contact Info</span>
              <span className="text-slate-900 font-medium text-lg px-3 py-1 bg-slate-100 rounded-lg inline-block border border-slate-200">{conv.contactInfo || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col">
          <h3 className="font-semibold text-slate-400 uppercase tracking-wider text-sm">Reason for Contact</h3>
          <p className="text-slate-700 leading-relaxed text-lg border-l-4 border-slate-200 pl-4 py-1 italic">"{conv.visitorReason}"</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden text-white mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center space-x-3 mb-6 relative z-10">
          <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center text-xs font-bold shadow-inner">AI</div>
          <h3 className="font-semibold text-lg font-[family-name:var(--font-heading)] tracking-wide">Executive Brief</h3>
        </div>
        
        <p className="text-slate-200 leading-relaxed text-lg relative z-10">{conv.summaryText}</p>
        
        <div className="pt-6 mt-6 border-t border-slate-700 relative z-10">
           <h4 className="font-semibold text-slate-400 text-sm uppercase tracking-wider mb-2">Suggested Next Action</h4>
           <p className="text-white text-lg font-medium">{conv.suggestedAction}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 pt-6 relative z-10">
           {(!conv.status || conv.status === "new") && (
             <>
               <Button 
                onClick={() => updateStatus("accepted")}
                className="bg-[#D2E823] hover:bg-[#C2D812] text-slate-900 rounded-xl px-6 py-6 font-bold shadow-lg hover:shadow-xl transition-all"
               >
                 Accept Connection
               </Button>
               <Button 
                variant="outline"
                onClick={() => updateStatus("archived")}
                className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl px-6 py-6 font-medium transition-all"
               >
                 Ignore
               </Button>
             </>
           )}
           {conv.status === "accepted" && (
             <Button className="bg-white hover:bg-slate-100 text-slate-900 rounded-xl px-6 py-6 font-medium shadow-lg hover:shadow-xl transition-all">Generate Reply Draft (1 credit)</Button>
           )}
           {conv.status === "archived" && (
             <div className="px-6 py-4 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 font-medium">This request has been archived.</div>
           )}
        </div>
      </div>
    </div>
  );
}
