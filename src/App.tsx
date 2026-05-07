import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import OnboardingFlow from "./pages/OnboardingFlow";
import DashboardRoutes from "./pages/DashboardRoutes";
import PublicProfile from "./pages/PublicProfile";
import PricingPage from "./pages/PricingPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        <Route path="/u/:slug" element={<PublicProfile />} />
      </Routes>
    </Router>
  );
}
