import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { EmergencyAlert, ApiResponse } from '@/types';

class EmergencyService {
  private collectionName = 'emergency_alerts';

  async createEmergencyAlert(alertData: Omit<EmergencyAlert, 'id' | 'createdAt'>): Promise<ApiResponse<EmergencyAlert>> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...alertData,
        createdAt: serverTimestamp()
      });

      const alert: EmergencyAlert = {
        ...alertData,
        id: docRef.id,
        createdAt: new Date()
      };

      return {
        success: true,
        data: alert,
        message: 'Alerta de emergência criado com sucesso'
      };
    } catch (error: any) {
      console.error('Error creating emergency alert:', error);
      return {
        success: false,
        error: 'Erro ao criar alerta de emergência: ' + error.message
      };
    }
  }

  async getActiveAlerts(): Promise<ApiResponse<EmergencyAlert[]>> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const alerts: EmergencyAlert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          severity: data.severity,
          isActive: data.isActive,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy
        });
      });

      return {
        success: true,
        data: alerts,
        message: 'Alertas ativos carregados com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting active alerts:', error);
      return {
        success: false,
        error: 'Erro ao carregar alertas ativos: ' + error.message
      };
    }
  }

  async getAllAlerts(limit?: number): Promise<ApiResponse<EmergencyAlert[]>> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (limit) {
        q = query(q, limitQuery(limit));
      }

      const querySnapshot = await getDocs(q);
      const alerts: EmergencyAlert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          severity: data.severity,
          isActive: data.isActive,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy
        });
      });

      return {
        success: true,
        data: alerts,
        message: 'Todos os alertas carregados com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting all alerts:', error);
      return {
        success: false,
        error: 'Erro ao carregar todos os alertas: ' + error.message
      };
    }
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, this.collectionName, alertId), {
        isActive: false,
        resolvedAt: serverTimestamp(),
        resolvedBy: resolvedBy
      });

      return {
        success: true,
        message: 'Alerta resolvido com sucesso'
      };
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      return {
        success: false,
        error: 'Erro ao resolver alerta: ' + error.message
      };
    }
  }

  async triggerPanicAlert(userId: string, userName?: string): Promise<ApiResponse<EmergencyAlert>> {
    try {
      // Get current location
      let locationString = 'Local não identificado';
      try {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const locationResult = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          locationString = `Lat: ${locationResult.coords.latitude.toFixed(6)}, Lng: ${locationResult.coords.longitude.toFixed(6)}`;
        }
      } catch (error) {
        console.warn('Could not get location for panic alert:', error);
      }

      const alertData: Omit<EmergencyAlert, 'id' | 'createdAt'> = {
        type: 'security',
        title: '🚨 BOTÃO DE PÂNICO ACIONADO',
        description: `Usuário ${userName || 'não identificado'} acionou o botão de pânico. Localização: ${locationString}`,
        location: locationString,
        severity: 'critical',
        isActive: true,
        createdBy: userId
      };

      const result = await this.createEmergencyAlert(alertData);
      
      // Trigger haptic feedback
      try {
        const Haptics = await import('expo-haptics');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (error) {
        console.warn('Could not trigger haptic feedback:', error);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error triggering panic alert:', error);
      return {
        success: false,
        error: 'Erro ao acionar alerta de pânico: ' + error.message
      };
    }
  }

  async getAlertById(alertId: string): Promise<ApiResponse<EmergencyAlert>> {
    try {
      const docRef = doc(db, this.collectionName, alertId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Alerta de emergência não encontrado'
        };
      }

      const data = docSnap.data();
      const alert: EmergencyAlert = {
        id: docSnap.id,
        type: data.type,
        title: data.title,
        description: data.description,
        location: data.location,
        severity: data.severity,
        isActive: data.isActive,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        resolvedAt: data.resolvedAt?.toDate(),
        resolvedBy: data.resolvedBy
      };

      return {
        success: true,
        data: alert,
        message: 'Alerta de emergência carregado com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting alert by ID:', error);
      return {
        success: false,
        error: 'Erro ao carregar alerta de emergência: ' + error.message
      };
    }
  }

  async deleteAlert(alertId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, this.collectionName, alertId));
      
      return {
        success: true,
        message: 'Alerta de emergência excluído com sucesso'
      };
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      return {
        success: false,
        error: 'Erro ao excluir alerta de emergência: ' + error.message
      };
    }
  }
}

export const emergencyService = new EmergencyService();