import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EmergencyButton } from "@/components/EmergencyButton";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import VisitorsPage from "@/pages/VisitorsPage";
import CampaignsPage from "@/pages/CampaignsPage";
import ChecklistPage from "@/pages/ChecklistPage";
import DrillsPage from "@/pages/DrillsPage";
import EmergencyPage from "@/pages/EmergencyPage";
import SchoolMapPage from "@/pages/SchoolMapPage";
import SurveillancePage from "@/pages/SurveillancePage";
import NoticesPage from "@/pages/NoticesPage";
import NotFound from "@/pages/not-found";
// Demo users removed for security - admin must create users manually

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <EmergencyButton />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )} />
      
      <Route path="/reports" component={() => (
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/users" component={() => (
        <ProtectedRoute>
          <UsersPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/visitors" component={() => (
        <ProtectedRoute>
          <VisitorsPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/campaigns" component={() => (
        <ProtectedRoute>
          <CampaignsPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/checklist" component={() => (
        <ProtectedRoute>
          <ChecklistPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/drills" component={() => (
        <ProtectedRoute>
          <DrillsPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/emergency" component={() => (
        <ProtectedRoute>
          <EmergencyPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/map" component={() => (
        <ProtectedRoute>
          <SchoolMapPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/surveillance" component={() => (
        <ProtectedRoute>
          <SurveillancePage />
        </ProtectedRoute>
      )} />
      
      <Route path="/notices" component={() => (
        <ProtectedRoute>
          <NoticesPage />
        </ProtectedRoute>
      )} />
      
      {/* Aliases for common routes */}
      <Route path="/bullying" component={() => (
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/occurrences" component={() => (
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/evacuation" component={() => (
        <ProtectedRoute>
          <SchoolMapPage />
        </ProtectedRoute>
      )} />
      
      <Route path="/contacts" component={() => (
        <ProtectedRoute>
          <EmergencyPage />
        </ProtectedRoute>
      )} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Demo user initialization removed for security
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
