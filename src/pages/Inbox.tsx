import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [conversations, setConversations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/inbox")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          console.error("Failed to fetch inbox:", data);
        }
      });
  }, []);

  const requests = Array.isArray(conversations) ? conversations.filter(c => c.status === "new" || !c.status) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-slate-900 tracking-tight">Inbox</h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">Review your inbound AI-qualified connections.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center p-16 bg-white border border-slate-200 rounded-3xl border-dashed">
          <p className="text-slate-500 font-medium">
            No inbound connections yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(conv => (
            <Card key={conv.id} className="cursor-pointer group hover:border-slate-400 hover:shadow-md transition-all rounded-2xl border-slate-200 shadow-sm" onClick={() => navigate(`/dashboard/inbox/${conv.id}`)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl font-[family-name:var(--font-heading)] text-slate-900 group-hover:text-slate-700 transition-colors">{conv.visitorName || "Anonymous"}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{conv.visitorCompany} • {conv.visitorIntentCategory}</p>
                  </div>
                  <Badge className={`px-3 py-1 text-sm font-medium rounded-full ${conv.qualificationLevel === 'high fit' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`} variant="outline">
                    {conv.qualificationLevel}
                  </Badge>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 border border-slate-100 flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">AI</div>
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">AI Executive Brief</span>
                    <span className="leading-relaxed text-slate-600">{conv.summaryText}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
