import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EmergencyButton } from "@/components/EmergencyButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import AuthPage from "@/pages/AuthPage";

// Lazy loading das páginas para melhor performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const VisitorsPage = lazy(() => import("@/pages/VisitorsPage"));
const CampaignsPage = lazy(() => import("@/pages/CampaignsPage"));
const ChecklistPage = lazy(() => import("@/pages/ChecklistPage"));
const DrillsPage = lazy(() => import("@/pages/DrillsPage"));
const EmergencyPage = lazy(() => import("@/pages/EmergencyPage"));
const SchoolMapPage = lazy(() => import("@/pages/SchoolMapPage"));
const SurveillancePage = lazy(() => import("@/pages/SurveillancePage"));
const NoticesPage = lazy(() => import("@/pages/NoticesPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner 
          size="lg" 
          message="Carregando sistema de segurança..." 
          className="animate-in fade-in-0 duration-500"
        />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  return (
    <div className="animate-in fade-in-0 duration-300">
      <DashboardLayout>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-32">
            <LoadingSpinner message="Carregando página..." />
          </div>
        }>
          {children}
        </Suspense>
      </DashboardLayout>
      <EmergencyButton />
    </div>
  );
}

function AppRouter() {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/" render={() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/reports" render={() => (
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/users" render={() => (
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/visitors" render={() => (
          <ProtectedRoute>
            <VisitorsPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/campaigns" render={() => (
          <ProtectedRoute>
            <CampaignsPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/checklist" render={() => (
          <ProtectedRoute>
            <ChecklistPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/drills" render={() => (
          <ProtectedRoute>
            <DrillsPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/emergency" render={() => (
          <ProtectedRoute>
            <EmergencyPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/map" render={() => (
          <ProtectedRoute>
            <SchoolMapPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/surveillance" render={() => (
          <ProtectedRoute>
            <SurveillancePage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/notices" render={() => (
          <ProtectedRoute>
            <NoticesPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/bullying" render={() => (
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/occurrences" render={() => (
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/evacuation" render={() => (
          <ProtectedRoute>
            <SchoolMapPage />
          </ProtectedRoute>
        )} />
      
        <Route exact path="/contacts" render={() => (
          <ProtectedRoute>
            <EmergencyPage />
          </ProtectedRoute>
        )} />
      
        <Route render={() => <NotFound />} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
}

function App() {
  return (
    <IonApp>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AppRouter />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </IonApp>
  );
}

export default App;