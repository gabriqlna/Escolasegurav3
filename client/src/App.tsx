import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  
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