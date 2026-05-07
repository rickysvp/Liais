import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const [boundaries, setBoundaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        if (data.boundaries) {
          setBoundaries(data.boundaries);
        }
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...profile,
          boundaries
        })
      });
      if (res.ok) {
        alert("Settings saved!");
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const addBoundary = () => {
    setBoundaries([...boundaries, { category: "", value: "", visibilityType: "public" }]);
  };

  const updateBoundary = (index: number, field: string, value: string) => {
    const newBoundaries = [...boundaries];
    newBoundaries[index][field] = value;
    setBoundaries(newBoundaries);
  };

  const removeBoundary = (index: number) => {
    setBoundaries(boundaries.filter((_, i) => i !== index));
  };

  if (!profile) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold">Profile Details</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Display Name</label>
          <Input 
            value={profile.displayName || ""} 
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Headline</label>
          <Input 
            value={profile.headline || ""} 
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">AI Secretary Intro</label>
          <Textarea 
            value={profile.generatedIntro || ""} 
            onChange={(e) => setProfile({ ...profile, generatedIntro: e.target.value })} 
            rows={3} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Welcome Message</label>
          <Textarea 
            value={profile.generatedWelcomeMessage || ""} 
            onChange={(e) => setProfile({ ...profile, generatedWelcomeMessage: e.target.value })} 
            rows={2} 
          />
        </div>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold">Secretary Work Boundaries</h2>
        <p className="text-sm text-slate-500">Define what your AI secretary should or should not discuss, and how they should share information.</p>
        
        {boundaries.map((boundary, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start border p-4 rounded-lg bg-slate-50 border-slate-200">
            <div className="flex-1 space-y-3 w-full">
              <Input 
                placeholder="Category (e.g. Salary, Technical details)" 
                value={boundary.category}
                onChange={(e) => updateBoundary(index, "category", e.target.value)}
              />
              <Textarea 
                placeholder="Rule value (e.g. Never discuss exact compensation figures...)" 
                value={boundary.value}
                onChange={(e) => updateBoundary(index, "value", e.target.value)}
                rows={2}
              />
            </div>
            <div className="w-full sm:w-48 space-y-3 shrink-0">
              <select 
                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={boundary.visibilityType}
                onChange={(e) => updateBoundary(index, "visibilityType", e.target.value)}
              >
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="handoff_trigger">Handoff Trigger</option>
                <option value="never_share">Never Share</option>
              </select>
              <Button variant="destructive" size="sm" onClick={() => removeBoundary(index)} className="w-full">
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addBoundary}>+ Add Boundary Rule</Button>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold">Connection Preferences</h2>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-700">Primary Goal</label>
           <Input 
             value={profile.primaryConnectionGoal || ""} 
             onChange={(e) => setProfile({ ...profile, primaryConnectionGoal: e.target.value })} 
           />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-700">Open Contact Scope</label>
           <Textarea 
             value={profile.generatedContactScopeText || ""} 
             onChange={(e) => setProfile({ ...profile, generatedContactScopeText: e.target.value })} 
             rows={2} 
           />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-8">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
