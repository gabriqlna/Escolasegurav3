import React from 'react';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonPage
} from '@ionic/react';
import { Route } from 'react-router-dom';
import { 
  home, 
  alertCircle, 
  warning, 
  settings, 
  person 
} from 'ionicons/icons';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@shared/schema';

// Import pages (these will be created later)
import Dashboard from '@/pages/Dashboard';
import ReportsPage from '@/pages/ReportsPage';
import EmergencyPage from '@/pages/EmergencyPage';
import UsersPage from '@/pages/UsersPage';

export const IonicTabs: React.FC = () => {
  const { hasPermission } = useAuth();
  
  // Check if user has staff or admin permissions
  const isStaffOrAdmin = hasPermission([USER_ROLES.FUNCIONARIO, USER_ROLES.DIRECAO]);

  return (
    <IonPage>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/emergency" component={EmergencyPage} />
          {isStaffOrAdmin && (
            <Route path="/management" component={UsersPage} />
          )}
          <Route path="/profile" component={() => <div>Profile Page</div>} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="dashboard" href="/dashboard">
            <IonIcon icon={home} />
            <IonLabel>Início</IonLabel>
          </IonTabButton>

          <IonTabButton tab="reports" href="/reports">
            <IonIcon icon={alertCircle} />
            <IonLabel>Denúncias</IonLabel>
          </IonTabButton>

          <IonTabButton tab="emergency" href="/emergency">
            <IonIcon icon={warning} />
            <IonLabel>Emergência</IonLabel>
          </IonTabButton>

          {isStaffOrAdmin && (
            <IonTabButton tab="management" href="/management">
              <IonIcon icon={settings} />
              <IonLabel>Gestão</IonLabel>
            </IonTabButton>
          )}

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={person} />
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};