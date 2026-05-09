import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, isSupabaseClientConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AuthPage() {
  const navigate = useNavigate();
  const params = useQueryParams();
  const next = params.get("next") || "/onboarding";
  const intent = params.get("intent") || "";
  const { isAuthenticated } = useAuth();

  const [email, setEmail] = useState(params.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`${next}${next.includes("?") ? "&" : "?"}authed=1${intent ? `&intent=${intent}` : ""}`, { replace: true });
      return;
    }
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      localStorage.setItem("liais_access_token", token);
      navigate(`${next}${next.includes("?") ? "&" : "?"}authed=1${intent ? `&intent=${intent}` : ""}`, { replace: true });
    });
  }, [navigate, next, intent, isAuthenticated]);

  const redirectTo = `${window.location.origin}/auth?next=${encodeURIComponent(next)}${intent ? `&intent=${encodeURIComponent(intent)}` : ""}`;

  const signInWithGoogle = async () => {
    setError(null);
    if (!supabase) {
      setError("Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  const signInWithEmail = async () => {
    setError(null);
    setNotice(null);
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!supabase) {
      setError("Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setNotice("Check your email to continue.");
  };

  return (
    <div className="min-h-screen bg-[#F3F3F1] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Create your account</h1>
        <p className="text-sm text-slate-600">Finish account setup to publish your profile and unlock inbox workflows.</p>
        {!isSupabaseClientConfigured && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Missing auth config: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
          </div>
        )}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</div>}
        <Button onClick={signInWithGoogle} disabled={loading} className="w-full h-11 bg-slate-900 text-white rounded-xl">
          Continue with Google
        </Button>
        <div className="text-xs text-slate-400 uppercase tracking-widest text-center">or</div>
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl"
        />
        <Button onClick={signInWithEmail} disabled={loading} className="w-full h-11 rounded-xl">
          Continue with Email
        </Button>
      </div>
    </div>
  );
}
