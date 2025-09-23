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
import { firestore, auth } from './firebase';
import { Incident, ApiResponse, UserRole } from '@/types';

class IncidentsService {
  private collectionName = 'incidents';

  async createIncident(incidentData: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'>): Promise<ApiResponse<Incident>> {
    try {
      const docRef = await addDoc(collection(firestore, this.collectionName), {
        ...incidentData,
        reportedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const incident: Incident = {
        ...incidentData,
        id: docRef.id,
        reportedAt: new Date(),
        updatedAt: new Date()
      };

      return {
        success: true,
        data: incident,
        message: 'Ocorrência registrada com sucesso'
      };
    } catch (error: any) {
      console.error('Error creating incident:', error);
      return {
        success: false,
        error: 'Erro ao registrar ocorrência: ' + error.message
      };
    }
  }

  async getAllIncidents(limit?: number): Promise<ApiResponse<Incident[]>> {
    try {
      let q = query(
        collection(firestore, this.collectionName),
        orderBy('reportedAt', 'desc')
      );

      if (limit) {
        q = query(q, limitQuery(limit));
      }

      const querySnapshot = await getDocs(q);
      const incidents: Incident[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incidents.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          severity: data.severity,
          involvedPersons: data.involvedPersons || [],
          actionsTaken: data.actionsTaken,
          followUpRequired: data.followUpRequired,
          reportedBy: data.reportedBy,
          reportedAt: data.reportedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          status: data.status
        });
      });

      return {
        success: true,
        data: incidents,
        message: 'Ocorrências carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting all incidents:', error);
      return {
        success: false,
        error: 'Erro ao carregar ocorrências: ' + error.message
      };
    }
  }

  async getIncidentsByCategory(category: Incident['category']): Promise<ApiResponse<Incident[]>> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('category', '==', category),
        orderBy('reportedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const incidents: Incident[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incidents.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          severity: data.severity,
          involvedPersons: data.involvedPersons || [],
          actionsTaken: data.actionsTaken,
          followUpRequired: data.followUpRequired,
          reportedBy: data.reportedBy,
          reportedAt: data.reportedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          status: data.status
        });
      });

      return {
        success: true,
        data: incidents,
        message: `Ocorrências da categoria ${category} carregadas com sucesso`
      };
    } catch (error: any) {
      console.error('Error getting incidents by category:', error);
      return {
        success: false,
        error: 'Erro ao carregar ocorrências por categoria: ' + error.message
      };
    }
  }

  async getOpenIncidents(): Promise<ApiResponse<Incident[]>> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('status', 'in', ['open', 'in_progress']),
        orderBy('reportedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const incidents: Incident[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incidents.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          severity: data.severity,
          involvedPersons: data.involvedPersons || [],
          actionsTaken: data.actionsTaken,
          followUpRequired: data.followUpRequired,
          reportedBy: data.reportedBy,
          reportedAt: data.reportedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          status: data.status
        });
      });

      return {
        success: true,
        data: incidents,
        message: 'Ocorrências abertas carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting open incidents:', error);
      return {
        success: false,
        error: 'Erro ao carregar ocorrências abertas: ' + error.message
      };
    }
  }

  async getCriticalIncidents(): Promise<ApiResponse<Incident[]>> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('severity', '==', 'critical'),
        where('status', '!=', 'closed'),
        orderBy('reportedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const incidents: Incident[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incidents.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          severity: data.severity,
          involvedPersons: data.involvedPersons || [],
          actionsTaken: data.actionsTaken,
          followUpRequired: data.followUpRequired,
          reportedBy: data.reportedBy,
          reportedAt: data.reportedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          status: data.status
        });
      });

      return {
        success: true,
        data: incidents,
        message: 'Ocorrências críticas carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting critical incidents:', error);
      return {
        success: false,
        error: 'Erro ao carregar ocorrências críticas: ' + error.message
      };
    }
  }

  async updateIncidentStatus(
    incidentId: string, 
    status: Incident['status'], 
    actionsTaken?: string
  ): Promise<ApiResponse<void>> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (actionsTaken) {
        updateData.actionsTaken = actionsTaken;
      }

      await updateDoc(doc(firestore, this.collectionName, incidentId), updateData);

      return {
        success: true,
        message: 'Status da ocorrência atualizado com sucesso'
      };
    } catch (error: any) {
      console.error('Error updating incident status:', error);
      return {
        success: false,
        error: 'Erro ao atualizar status da ocorrência: ' + error.message
      };
    }
  }

  async addActionsTaken(incidentId: string, actionsTaken: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(firestore, this.collectionName, incidentId), {
        actionsTaken,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Ações tomadas registradas com sucesso'
      };
    } catch (error: any) {
      console.error('Error adding actions taken:', error);
      return {
        success: false,
        error: 'Erro ao registrar ações tomadas: ' + error.message
      };
    }
  }

  async markFollowUpRequired(incidentId: string, required: boolean): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(firestore, this.collectionName, incidentId), {
        followUpRequired: required,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: required ? 'Follow-up marcado como necessário' : 'Follow-up removido'
      };
    } catch (error: any) {
      console.error('Error updating follow-up required:', error);
      return {
        success: false,
        error: 'Erro ao atualizar follow-up: ' + error.message
      };
    }
  }

  async getIncidentById(incidentId: string): Promise<ApiResponse<Incident>> {
    try {
      const docRef = doc(firestore, this.collectionName, incidentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Ocorrência não encontrada'
        };
      }

      const data = docSnap.data();
      const incident: Incident = {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        location: data.location,
        category: data.category,
        severity: data.severity,
        involvedPersons: data.involvedPersons || [],
        actionsTaken: data.actionsTaken,
        followUpRequired: data.followUpRequired,
        reportedBy: data.reportedBy,
        reportedAt: data.reportedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        status: data.status
      };

      return {
        success: true,
        data: incident,
        message: 'Ocorrência carregada com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting incident by ID:', error);
      return {
        success: false,
        error: 'Erro ao carregar ocorrência: ' + error.message
      };
    }
  }

  async deleteIncident(incidentId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(firestore, this.collectionName, incidentId));
      
      return {
        success: true,
        message: 'Ocorrência excluída com sucesso'
      };
    } catch (error: any) {
      console.error('Error deleting incident:', error);
      return {
        success: false,
        error: 'Erro ao excluir ocorrência: ' + error.message
      };
    }
  }

  async getIncidentsByDateRange(startDate: Date, endDate: Date): Promise<ApiResponse<Incident[]>> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('reportedAt', '>=', Timestamp.fromDate(startDate)),
        where('reportedAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('reportedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const incidents: Incident[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incidents.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category,
          severity: data.severity,
          involvedPersons: data.involvedPersons || [],
          actionsTaken: data.actionsTaken,
          followUpRequired: data.followUpRequired,
          reportedBy: data.reportedBy,
          reportedAt: data.reportedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          status: data.status
        });
      });

      return {
        success: true,
        data: incidents,
        message: `${incidents.length} ocorrência${incidents.length !== 1 ? 's' : ''} encontrada${incidents.length !== 1 ? 's' : ''} no período`
      };
    } catch (error: any) {
      console.error('Error getting incidents by date range:', error);
      return {
        success: false,
        error: 'Erro ao carregar ocorrências por período: ' + error.message
      };
    }
  }

  // Get statistics for admin dashboard
  async getIncidentsStatistics(): Promise<ApiResponse<{
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    followUpRequired: number;
    openIncidents: number;
    criticalIncidents: number;
  }>> {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.collectionName));
      
      const stats = {
        total: 0,
        byCategory: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        followUpRequired: 0,
        openIncidents: 0,
        criticalIncidents: 0
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;

        // Count by category
        stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;

        // Count by severity
        stats.bySeverity[data.severity] = (stats.bySeverity[data.severity] || 0) + 1;

        // Count by status
        stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1;

        // Count follow-up required
        if (data.followUpRequired) {
          stats.followUpRequired++;
        }

        // Count open incidents
        if (data.status === 'open' || data.status === 'in_progress') {
          stats.openIncidents++;
        }

        // Count critical incidents
        if (data.severity === 'critical' && data.status !== 'closed') {
          stats.criticalIncidents++;
        }
      });

      return {
        success: true,
        data: stats,
        message: 'Estatísticas de ocorrências carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting incident statistics:', error);
      return {
        success: false,
        error: 'Erro ao carregar estatísticas: ' + error.message
      };
    }
  }

  // Generate daily incident report
  async generateDailyReport(date: Date): Promise<ApiResponse<{
    totalIncidents: number;
    byCategory: Record<string, number>;
    criticalIncidents: Incident[];
    openIncidents: Incident[];
  }>> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const incidentsResult = await this.getIncidentsByDateRange(startOfDay, endOfDay);
      
      if (!incidentsResult.success || !incidentsResult.data) {
        return {
          success: false,
          error: incidentsResult.error || 'Erro ao gerar relatório'
        };
      }

      const incidents = incidentsResult.data;
      const byCategory: Record<string, number> = {};
      
      incidents.forEach(incident => {
        byCategory[incident.category] = (byCategory[incident.category] || 0) + 1;
      });

      const criticalIncidents = incidents.filter(i => i.severity === 'critical');
      const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress');

      return {
        success: true,
        data: {
          totalIncidents: incidents.length,
          byCategory,
          criticalIncidents,
          openIncidents
        },
        message: `Relatório do dia ${date.toLocaleDateString('pt-BR')} gerado com sucesso`
      };
    } catch (error: any) {
      console.error('Error generating daily incident report:', error);
      return {
        success: false,
        error: 'Erro ao gerar relatório diário: ' + error.message
      };
    }
  }
}

export const incidentsService = new IncidentsService();