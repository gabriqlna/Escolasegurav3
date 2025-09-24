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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmergencyAlert, ApiResponse, EmergencyForm } from '@/types';

class EmergencyService {
  private collectionName = 'emergencyAlerts';

  async createEmergencyAlert(alertData: EmergencyForm & { createdBy: string }): Promise<ApiResponse<EmergencyAlert>> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...alertData,
        isActive: true,
        createdAt: serverTimestamp()
      });

      const alert: EmergencyAlert = {
        ...alertData,
        id: docRef.id,
        isActive: true,
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
        message: `${alerts.length} alertas ativos encontrados`
      };
    } catch (error: any) {
      console.error('Error fetching active alerts:', error);
      return {
        success: false,
        error: 'Erro ao buscar alertas ativos: ' + error.message,
        data: []
      };
    }
  }

  async resolveAlert(id: string, resolvedBy: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        isActive: false,
        resolvedAt: serverTimestamp(),
        resolvedBy
      });

      return {
        success: true,
        message: 'Alerta de emergência resolvido com sucesso'
      };
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      return {
        success: false,
        error: 'Erro ao resolver alerta: ' + error.message
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
        message: `${alerts.length} alertas encontrados`
      };
    } catch (error: any) {
      console.error('Error fetching all alerts:', error);
      return {
        success: false,
        error: 'Erro ao buscar alertas: ' + error.message,
        data: []
      };
    }
  }
}

export const emergencyService = new EmergencyService();