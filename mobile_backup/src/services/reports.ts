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
import { db, auth } from './firebase';
import { Report, ApiResponse } from '@/types';

class ReportsService {
  private collectionName = 'reports';

  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Report>> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...reportData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const report: Report = {
        ...reportData,
        id: docRef.id,
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
        message: 'Denúncias carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting reports:', error);
      return {
        success: false,
        error: 'Erro ao carregar denúncias: ' + error.message
      };
    }
  }

  async getAllReports(limit?: number): Promise<ApiResponse<Report[]>> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

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
        message: 'Todas as denúncias carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting all reports:', error);
      return {
        success: false,
        error: 'Erro ao carregar todas as denúncias: ' + error.message
      };
    }
  }

  async updateReportStatus(
    reportId: string, 
    status: Report['status'], 
    resolution?: string,
    resolvedBy?: string
  ): Promise<ApiResponse<void>> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'resolved' && resolution) {
        updateData.resolution = resolution;
        updateData.resolvedAt = serverTimestamp();
        updateData.resolvedBy = resolvedBy;
      }

      await updateDoc(doc(db, this.collectionName, reportId), updateData);

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

  async getReportsByType(type: Report['type']): Promise<ApiResponse<Report[]>> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', type),
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
        message: `Denúncias do tipo ${type} carregadas com sucesso`
      };
    } catch (error: any) {
      console.error('Error getting reports by type:', error);
      return {
        success: false,
        error: 'Erro ao carregar denúncias por tipo: ' + error.message
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
        message: `Denúncias com status ${status} carregadas com sucesso`
      };
    } catch (error: any) {
      console.error('Error getting reports by status:', error);
      return {
        success: false,
        error: 'Erro ao carregar denúncias por status: ' + error.message
      };
    }
  }

  async getReportById(reportId: string): Promise<ApiResponse<Report>> {
    try {
      const docRef = doc(db, this.collectionName, reportId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Denúncia não encontrada'
        };
      }

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
        message: 'Denúncia carregada com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting report by ID:', error);
      return {
        success: false,
        error: 'Erro ao carregar denúncia: ' + error.message
      };
    }
  }

  async deleteReport(reportId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, this.collectionName, reportId));
      
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
}

export const reportsService = new ReportsService();