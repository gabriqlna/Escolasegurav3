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
} from 'firebase/db';
import { db } from './firebase';
import { Visitor, ApiResponse } from '@/types';

class VisitorsService {
  private collectionName = 'visitors';

  async registerVisitor(visitorData: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Visitor>> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...visitorData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const visitor: Visitor = {
        ...visitorData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        success: true,
        data: visitor,
        message: 'Visitante registrado com sucesso'
      };
    } catch (error: any) {
      console.error('Error registering visitor:', error);
      return {
        success: false,
        error: 'Erro ao registrar visitante: ' + error.message
      };
    }
  }

  async checkOutVisitor(visitorId: string, checkOutNote?: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, this.collectionName, visitorId), {
        checkOutTime: serverTimestamp(),
        checkOutNote: checkOutNote || '',
        status: 'checked_out',
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Check-out realizado com sucesso'
      };
    } catch (error: any) {
      console.error('Error checking out visitor:', error);
      return {
        success: false,
        error: 'Erro ao fazer check-out: ' + error.message
      };
    }
  }

  async getActiveVisitors(): Promise<ApiResponse<Visitor[]>> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'checked_in'),
        orderBy('checkInTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const visitors: Visitor[] = [];

      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        visitors.push({
          id: doc.id,
          name: data.name,
          document: data.document,
          phone: data.phone,
          purpose: data.purpose,
          hostName: data.hostName,
          hostId: data.hostId,
          checkInTime: data.checkInTime?.toDate() || new Date(),
          checkOutTime: data.checkOutTime?.toDate(),
          status: data.status,
          badgeNumber: data.badgeNumber,
          checkOutNote: data.checkOutNote,
          registeredBy: data.registeredBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        });
      });

      return {
        success: true,
        data: visitors,
        message: 'Visitantes ativos carregados com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting active visitors:', error);
      return {
        success: false,
        error: 'Erro ao carregar visitantes ativos: ' + error.message
      };
    }
  }

  async getAllVisitors(limit?: number): Promise<ApiResponse<Visitor[]>> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('checkInTime', 'desc')
      );

      if (limit) {
        q = query(q, limitQuery(limit));
      }

      const querySnapshot = await getDocs(q);
      const visitors: Visitor[] = [];

      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        visitors.push({
          id: doc.id,
          name: data.name,
          document: data.document,
          phone: data.phone,
          purpose: data.purpose,
          hostName: data.hostName,
          hostId: data.hostId,
          checkInTime: data.checkInTime?.toDate() || new Date(),
          checkOutTime: data.checkOutTime?.toDate(),
          status: data.status,
          badgeNumber: data.badgeNumber,
          checkOutNote: data.checkOutNote,
          registeredBy: data.registeredBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        });
      });

      return {
        success: true,
        data: visitors,
        message: 'Histórico de visitantes carregado com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting all visitors:', error);
      return {
        success: false,
        error: 'Erro ao carregar histórico de visitantes: ' + error.message
      };
    }
  }

  async getVisitorsByDate(date: Date): Promise<ApiResponse<Visitor[]>> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, this.collectionName),
        where('checkInTime', '>=', Timestamp.fromDate(startOfDay)),
        where('checkInTime', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('checkInTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const visitors: Visitor[] = [];

      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        visitors.push({
          id: doc.id,
          name: data.name,
          document: data.document,
          phone: data.phone,
          purpose: data.purpose,
          hostName: data.hostName,
          hostId: data.hostId,
          checkInTime: data.checkInTime?.toDate() || new Date(),
          checkOutTime: data.checkOutTime?.toDate(),
          status: data.status,
          badgeNumber: data.badgeNumber,
          checkOutNote: data.checkOutNote,
          registeredBy: data.registeredBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        });
      });

      return {
        success: true,
        data: visitors,
        message: `${visitors.length} visitante(s) encontrado(s) para ${date.toLocaleDateString('pt-BR')}`
      };
    } catch (error: any) {
      console.error('Error getting visitors by date:', error);
      return {
        success: false,
        error: 'Erro ao carregar visitantes por data: ' + error.message
      };
    }
  }

  async generateDailyReport(date: Date): Promise<ApiResponse<{
    totalVisitors: number;
    activeVisitors: number;
    checkedOutVisitors: number;
    visitors: Visitor[];
  }>> {
    try {
      const visitorsResult = await this.getVisitorsByDate(date);
      
      if (!visitorsResult.success || !visitorsResult.data) {
        return {
          success: false,
          error: visitorsResult.error || 'Erro ao gerar relatório'
        };
      }

      const visitors = visitorsResult.data;
      const activeVisitors = visitors.filter(v => v.status === 'checked_in').length;
      const checkedOutVisitors = visitors.filter(v => v.status === 'checked_out').length;

      return {
        success: true,
        data: {
          totalVisitors: visitors.length,
          activeVisitors,
          checkedOutVisitors,
          visitors
        },
        message: `Relatório do dia ${date.toLocaleDateString('pt-BR')} gerado com sucesso`
      };
    } catch (error: any) {
      console.error('Error generating daily report:', error);
      return {
        success: false,
        error: 'Erro ao gerar relatório diário: ' + error.message
      };
    }
  }

  async deleteVisitor(visitorId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, this.collectionName, visitorId));
      
      return {
        success: true,
        message: 'Visitante excluído com sucesso'
      };
    } catch (error: any) {
      console.error('Error deleting visitor:', error);
      return {
        success: false,
        error: 'Erro ao excluir visitante: ' + error.message
      };
    }
  }

  async getVisitorById(visitorId: string): Promise<ApiResponse<Visitor>> {
    try {
      const docRef = doc(db, this.collectionName, visitorId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Visitante não encontrado'
        };
      }

      const data = docSnap.data();
      const visitor: Visitor = {
        id: docSnap.id,
        name: data.name,
        document: data.document,
        phone: data.phone,
        purpose: data.purpose,
        hostName: data.hostName,
        hostId: data.hostId,
        checkInTime: data.checkInTime?.toDate() || new Date(),
        checkOutTime: data.checkOutTime?.toDate(),
        status: data.status,
        badgeNumber: data.badgeNumber,
        checkOutNote: data.checkOutNote,
        registeredBy: data.registeredBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate()
      };

      return {
        success: true,
        data: visitor,
        message: 'Visitante carregado com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting visitor by ID:', error);
      return {
        success: false,
        error: 'Erro ao carregar visitante: ' + error.message
      };
    }
  }
}

export const visitorsService = new VisitorsService();