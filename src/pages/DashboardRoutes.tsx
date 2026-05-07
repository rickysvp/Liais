import { Link, Routes, Route, useLocation } from "react-router-dom";
import Inbox from "./Inbox";
import Contacts from "./Contacts";
import VisitorDetail from "./VisitorDetail";
import SettingsPage from "./Settings";
import { Copy, InboxIcon, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";

function DashboardHome() {
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState({ credits: 0, plan: "Free" });

  useEffect(() => {
    fetch("/api/me/profile")
      .then(r => r.json())
      .then(setProfile);
    
    fetch("/api/me/credits")
      .then(r => r.json())
      .then(setBilling);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-slate-900">Dashboard</h1>
      
      {profile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Your Business Entrance</p>
            <div className="flex items-center space-x-4 mt-2">
              <a href={`/u/${profile.slug}`} target="_blank" className="text-slate-900 hover:text-blue-600 transition-colors font-bold text-2xl font-[family-name:var(--font-heading)]">
                liais.ai/u/{profile.slug}
              </a>
            </div>
          </div>
          <button className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium flex items-center space-x-2 text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-slate-900/10">
            <Copy className="w-4 h-4" /> <span>Copy Link</span>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
         <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
           <div className="relative z-10">
             <h3 className="font-semibold text-slate-500 text-sm tracking-wider uppercase">Credits Remaining</h3>
             <div className="flex items-end space-x-3 mt-4">
               <p className="text-5xl font-bold font-[family-name:var(--font-heading)] text-slate-900">{billing.credits}</p>
             </div>
             <p className="text-sm text-slate-500 font-medium mt-2">{billing.plan} Plan</p>
           </div>
         </div>
         <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
           <div className="relative z-10">
             <h3 className="font-semibold text-slate-500 text-sm tracking-wider uppercase">Inbox Items</h3>
             <div className="flex items-end space-x-3 mt-4">
               <p className="text-5xl font-bold font-[family-name:var(--font-heading)] text-slate-900">2</p>
             </div>
             <p className="text-sm text-slate-500 font-medium mt-2">Require your review</p>
           </div>
         </div>
      </div>
    </div>
  );
}

export default function DashboardRoutes() {
  const location = useLocation();

  const navItemClass = (path: string) => `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
    location.pathname === path ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
  }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col space-y-2">
        <div className="px-2 py-6 mb-4 font-bold text-2xl text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">Liais.AI</div>
        <Link to="/dashboard" className={navItemClass("/dashboard")}>
          <User className="w-5 h-5" /> <span>Overview</span>
        </Link>
        <Link to="/dashboard/inbox" className={navItemClass("/dashboard/inbox")}>
          <InboxIcon className="w-5 h-5" /> <span>Inbox</span>
        </Link>
        <Link to="/dashboard/contacts" className={navItemClass("/dashboard/contacts")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> <span>Contacts</span>
        </Link>
        <Link to="/pricing" className={navItemClass("/pricing")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> <span>Upgrade</span>
        </Link>
        <Link to="/dashboard/settings" className={navItemClass("/dashboard/settings")}>
          <Settings className="w-5 h-5" /> <span>Settings</span>
        </Link>
      </div>
      <div className="flex-1 p-12 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:id" element={<VisitorDetail />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}
