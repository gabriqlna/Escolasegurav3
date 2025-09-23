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
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Notice, ApiResponse } from '@/types';

class NoticesService {
  private collectionName = 'notices';

  async createNotice(noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Notice>> {
    try {
      const docRef = await addDoc(collection(firestore, this.collectionName), {
        ...noticeData,
        readBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const notice: Notice = {
        ...noticeData,
        id: docRef.id,
        readBy: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        success: true,
        data: notice,
        message: 'Aviso criado com sucesso'
      };
    } catch (error: any) {
      console.error('Error creating notice:', error);
      return {
        success: false,
        error: 'Erro ao criar aviso: ' + error.message
      };
    }
  }

  async getActiveNotices(): Promise<ApiResponse<Notice[]>> {
    try {
      const now = new Date();
      let q = query(
        collection(firestore, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notices: Notice[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate();
        
        // Verificar se não expirou
        if (!expiresAt || expiresAt > now) {
          notices.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            priority: data.priority,
            targetAudience: data.targetAudience || [],
            isActive: data.isActive,
            expiresAt: expiresAt,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            readBy: data.readBy || []
          });
        }
      });

      return {
        success: true,
        data: notices,
        message: 'Avisos ativos carregados com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting active notices:', error);
      return {
        success: false,
        error: 'Erro ao carregar avisos ativos: ' + error.message
      };
    }
  }

  async getAllNotices(limit?: number): Promise<ApiResponse<Notice[]>> {
    try {
      let q = query(
        collection(firestore, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (limit) {
        q = query(q, limitQuery(limit));
      }

      const querySnapshot = await getDocs(q);
      const notices: Notice[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notices.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          priority: data.priority,
          targetAudience: data.targetAudience || [],
          isActive: data.isActive,
          expiresAt: data.expiresAt?.toDate(),
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          readBy: data.readBy || []
        });
      });

      return {
        success: true,
        data: notices,
        message: 'Todos os avisos carregados com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting all notices:', error);
      return {
        success: false,
        error: 'Erro ao carregar todos os avisos: ' + error.message
      };
    }
  }

  async markAsRead(noticeId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(firestore, this.collectionName, noticeId), {
        readBy: arrayUnion(userId)
      });

      return {
        success: true,
        message: 'Aviso marcado como lido'
      };
    } catch (error: any) {
      console.error('Error marking notice as read:', error);
      return {
        success: false,
        error: 'Erro ao marcar aviso como lido: ' + error.message
      };
    }
  }

  async updateNotice(noticeId: string, updateData: Partial<Omit<Notice, 'id' | 'createdAt' | 'createdBy'>>): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(firestore, this.collectionName, noticeId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Aviso atualizado com sucesso'
      };
    } catch (error: any) {
      console.error('Error updating notice:', error);
      return {
        success: false,
        error: 'Erro ao atualizar aviso: ' + error.message
      };
    }
  }

  async deactivateNotice(noticeId: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(firestore, this.collectionName, noticeId), {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Aviso desativado com sucesso'
      };
    } catch (error: any) {
      console.error('Error deactivating notice:', error);
      return {
        success: false,
        error: 'Erro ao desativar aviso: ' + error.message
      };
    }
  }

  async getNoticesForUser(userRole: string): Promise<ApiResponse<Notice[]>> {
    try {
      const activeNoticesResult = await this.getActiveNotices();
      
      if (!activeNoticesResult.success || !activeNoticesResult.data) {
        return activeNoticesResult as ApiResponse<Notice[]>;
      }

      // Filtrar avisos que são para o role do usuário ou para todos
      const filteredNotices = activeNoticesResult.data.filter(notice => 
        notice.targetAudience.length === 0 || 
        notice.targetAudience.includes(userRole as any)
      );

      return {
        success: true,
        data: filteredNotices,
        message: `${filteredNotices.length} avisos encontrados para sua função`
      };
    } catch (error: any) {
      console.error('Error getting notices for user:', error);
      return {
        success: false,
        error: 'Erro ao carregar avisos para usuário: ' + error.message
      };
    }
  }

  async deleteNotice(noticeId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(firestore, this.collectionName, noticeId));
      
      return {
        success: true,
        message: 'Aviso excluído com sucesso'
      };
    } catch (error: any) {
      console.error('Error deleting notice:', error);
      return {
        success: false,
        error: 'Erro ao excluir aviso: ' + error.message
      };
    }
  }

  async getNoticeById(noticeId: string): Promise<ApiResponse<Notice>> {
    try {
      const docRef = doc(firestore, this.collectionName, noticeId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Aviso não encontrado'
        };
      }

      const data = docSnap.data();
      const notice: Notice = {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        priority: data.priority,
        targetAudience: data.targetAudience || [],
        isActive: data.isActive,
        expiresAt: data.expiresAt?.toDate(),
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        readBy: data.readBy || []
      };

      return {
        success: true,
        data: notice,
        message: 'Aviso carregado com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting notice by ID:', error);
      return {
        success: false,
        error: 'Erro ao carregar aviso: ' + error.message
      };
    }
  }

  async getUnreadNotices(userId: string, userRole?: string): Promise<ApiResponse<Notice[]>> {
    try {
      let q = query(
        collection(firestore, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const unreadNotices: Notice[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filter by target audience if user role is provided
        if (userRole && data.targetAudience && data.targetAudience.length > 0 && !data.targetAudience.includes(userRole)) {
          return;
        }

        // Check if user has read this notice
        const readBy = data.readBy || [];
        if (readBy.includes(userId)) {
          return;
        }

        // Check if notice is still active (not expired)
        const now = new Date();
        if (data.expiresAt && data.expiresAt.toDate() < now) {
          return;
        }

        unreadNotices.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          priority: data.priority,
          targetAudience: data.targetAudience || [],
          isActive: data.isActive,
          expiresAt: data.expiresAt?.toDate(),
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          readBy: data.readBy || []
        });
      });

      return {
        success: true,
        data: unreadNotices,
        message: `${unreadNotices.length} aviso${unreadNotices.length !== 1 ? 's' : ''} não lido${unreadNotices.length !== 1 ? 's' : ''}`
      };
    } catch (error: any) {
      console.error('Error getting unread notices:', error);
      return {
        success: false,
        error: 'Erro ao carregar avisos não lidos: ' + error.message
      };
    }
  }

  async createUrgentNotice(
    title: string, 
    content: string, 
    createdBy: string,
    targetAudience: string[] = ['aluno', 'funcionario', 'direcao'],
    expiresIn24Hours: boolean = true
  ): Promise<ApiResponse<Notice>> {
    try {
      const expiresAt = expiresIn24Hours 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        : undefined;

      const noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        content,
        priority: 'urgent',
        targetAudience: targetAudience as any[],
        isActive: true,
        expiresAt,
        createdBy,
        readBy: []
      };

      return await this.createNotice(noticeData);
    } catch (error: any) {
      console.error('Error creating urgent notice:', error);
      return {
        success: false,
        error: 'Erro ao criar aviso urgente: ' + error.message
      };
    }
  }
}

export const noticesService = new NoticesService();