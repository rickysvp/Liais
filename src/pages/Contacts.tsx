import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/inbox")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContacts(data.filter(c => c.status === "accepted"));
        } else {
          console.error("Failed to fetch contacts", data);
        }
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] text-slate-900 tracking-tight">Contacts</h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">Your accepted business connections.</p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center p-16 bg-white border border-slate-200 rounded-3xl border-dashed">
          <p className="text-slate-500 font-medium">No accepted contacts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map(conv => (
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
                   <div className="w-6 h-6 rounded-full bg-[#D2E823] text-slate-900 flex items-center justify-center font-bold shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></div>
                   <div>
                     <span className="font-semibold text-slate-900 block mb-1">Contact Info</span>
                     <span className="leading-relaxed text-slate-600">{conv.contactInfo || "N/A"}</span>
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
