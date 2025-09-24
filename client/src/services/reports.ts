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
import { Report, ApiResponse, ReportForm } from '@/types';

class ReportsService {
  private collectionName = 'reports';

  async createReport(reportData: ReportForm & { reporterId?: string }): Promise<ApiResponse<Report>> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...reportData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending'
      });

      const report: Report = {
        ...reportData,
        id: docRef.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        success: true,
        data: report,
        message: 'Denúncia criada com sucesso'
      };
    } catch (error: any) {
      console.error('Error creating report:', error);
      return {
        success: false,
        error: 'Erro ao criar denúncia: ' + error.message
      };
    }
  }

  async getReports(userId?: string, limit?: number): Promise<ApiResponse<Report[]>> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      // Se userId for fornecido, filtrar por reportador (exceto denúncias anônimas)
      if (userId) {
        q = query(
          collection(db, this.collectionName),
          where('reporterId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }

      if (limit) {
        q = query(q, limitQuery(limit));
      }

      const querySnapshot = await getDocs(q);
      const reports: Report[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          isAnonymous: data.isAnonymous,
          reporterId: data.reporterId,
          status: data.status,
          priority: data.priority,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy,
          resolution: data.resolution
        });
      });

      return {
        success: true,
        data: reports,
        message: `${reports.length} denúncias encontradas`
      };
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      return {
        success: false,
        error: 'Erro ao buscar denúncias: ' + error.message,
        data: []
      };
    }
  }

  async getReportById(id: string): Promise<ApiResponse<Report>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const report: Report = {
          id: docSnap.id,
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          isAnonymous: data.isAnonymous,
          reporterId: data.reporterId,
          status: data.status,
          priority: data.priority,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy,
          resolution: data.resolution
        };

        return {
          success: true,
          data: report,
          message: 'Denúncia encontrada'
        };
      } else {
        return {
          success: false,
          error: 'Denúncia não encontrada'
        };
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      return {
        success: false,
        error: 'Erro ao buscar denúncia: ' + error.message
      };
    }
  }

  async updateReportStatus(
    id: string, 
    status: Report['status'], 
    resolution?: string,
    resolvedBy?: string
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (resolution) {
        updateData.resolution = resolution;
      }

      if (resolvedBy) {
        updateData.resolvedBy = resolvedBy;
      }

      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }

      await updateDoc(docRef, updateData);

      return {
        success: true,
        message: 'Status da denúncia atualizado com sucesso'
      };
    } catch (error: any) {
      console.error('Error updating report status:', error);
      return {
        success: false,
        error: 'Erro ao atualizar status da denúncia: ' + error.message
      };
    }
  }

  async deleteReport(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Denúncia excluída com sucesso'
      };
    } catch (error: any) {
      console.error('Error deleting report:', error);
      return {
        success: false,
        error: 'Erro ao excluir denúncia: ' + error.message
      };
    }
  }

  async getReportsByStatus(status: Report['status']): Promise<ApiResponse<Report[]>> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reports: Report[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          isAnonymous: data.isAnonymous,
          reporterId: data.reporterId,
          status: data.status,
          priority: data.priority,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy,
          resolution: data.resolution
        });
      });

      return {
        success: true,
        data: reports,
        message: `${reports.length} denúncias com status ${status}`
      };
    } catch (error: any) {
      console.error('Error fetching reports by status:', error);
      return {
        success: false,
        error: 'Erro ao buscar denúncias por status: ' + error.message,
        data: []
      };
    }
  }

  async getReportStatistics(): Promise<ApiResponse<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  }>> {
    try {
      const q = query(collection(db, this.collectionName));
      const querySnapshot = await getDocs(q);
      
      const stats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        switch (data.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'in_progress':
            stats.inProgress++;
            break;
          case 'resolved':
            stats.resolved++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
        }
      });

      return {
        success: true,
        data: stats,
        message: 'Estatísticas obtidas com sucesso'
      };
    } catch (error: any) {
      console.error('Error fetching report statistics:', error);
      return {
        success: false,
        error: 'Erro ao buscar estatísticas: ' + error.message
      };
    }
  }
}

export const reportsService = new ReportsService();