import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppProvider } from "@/context/AppContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Deforestation from "./pages/modules/Deforestation";
import WaterScarcity from "./pages/modules/WaterScarcity";
import CropStress from "./pages/modules/CropStress";
import FloodMonitoring from "./pages/modules/FloodMonitoring";
import UrbanHeat from "./pages/modules/UrbanHeat";
import IndustrialPollution from "./pages/modules/IndustrialPollution";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import HistoricalTrends from "./pages/HistoricalTrends";
import SettingsPage from "./pages/Settings";
import About from "./pages/About";
import Upload from "./pages/Upload";
import HowItWorks from "./pages/HowItWorks";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import AnalysisHistory from "./pages/AnalysisHistory";
import AdminPanel from "./pages/AdminPanel";
import SystemHealth from "./pages/SystemHealth";
import ActionCenter from "./pages/ActionCenter";
import CommunityPortal from "./pages/CommunityPortal";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected dashboard routes */}
              <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/modules/deforestation" element={<Deforestation />} />
                <Route path="/modules/water" element={<WaterScarcity />} />
                <Route path="/modules/crop" element={<CropStress />} />
                <Route path="/modules/flood" element={<FloodMonitoring />} />
                <Route path="/modules/heat" element={<UrbanHeat />} />
                <Route path="/modules/pollution" element={<IndustrialPollution />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/trends" element={<HistoricalTrends />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/history" element={<AnalysisHistory />} />
                <Route path="/action-center" element={<ActionCenter />} />
                <Route path="/community-portal" element={<CommunityPortal />} />
                <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
                <Route path="/system-health" element={<SystemHealth />} />
              </Route>

              {/* Admin only routes */}
              <Route element={<PrivateRoute allowedRoles={["admin"]}><DashboardLayout /></PrivateRoute>}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
