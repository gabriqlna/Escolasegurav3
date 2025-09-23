import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Campaign, CampaignRead, QuizAnswer } from '@/types';

export class CampaignService {
  private static readonly COLLECTION = 'campaigns';
  private static readonly CAMPAIGN_READS_COLLECTION = 'campaignReads';

  static async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'views' | 'completions'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.COLLECTION), {
      ...campaignData,
      views: 0,
      completions: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteCampaign(id: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await deleteDoc(docRef);
  }

  static async toggleCampaignActive(id: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  }

  static subscribeToActiveCampaigns(
    targetAudience?: string[], 
    category?: string,
    callback?: (campaigns: Campaign[]) => void
  ) {
    let q = query(
      collection(db, this.COLLECTION),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    if (category && category !== 'all') {
      q = query(q, where('category', '==', category));
    }

    if (targetAudience && targetAudience.length > 0) {
      q = query(q, where('targetAudience', 'array-contains-any', targetAudience));
    }

    return onSnapshot(q, (snapshot: any) => {
      const campaigns: Campaign[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      } as Campaign));
      
      callback?.(campaigns);
    });
  }

  static subscribeToAllCampaigns(callback?: (campaigns: Campaign[]) => void) {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot: any) => {
      const campaigns: Campaign[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      } as Campaign));
      
      callback?.(campaigns);
    });
  }

  static async getCampaign(id: string): Promise<Campaign | null> {
    const docRef = doc(db, this.COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
      } as Campaign;
    }
    
    return null;
  }

  static async markCampaignAsViewed(campaignId: string, userId: string): Promise<void> {
    // Registrar visualização do usuário
    const readRef = doc(db, this.CAMPAIGN_READS_COLLECTION, `${campaignId}_${userId}`);
    await setDoc(readRef, {
      campaignId,
      userId,
      viewedAt: serverTimestamp(),
      hasRead: false,
      hasCompleted: false,
    }, { merge: true });
  }

  static async markCampaignAsRead(campaignId: string, userId: string): Promise<void> {
    const readRef = doc(db, this.CAMPAIGN_READS_COLLECTION, `${campaignId}_${userId}`);
    await setDoc(readRef, {
      campaignId,
      userId,
      readAt: serverTimestamp(),
      hasRead: true,
    }, { merge: true });
  }

  static async submitQuizAnswers(
    campaignId: string, 
    userId: string, 
    answers: QuizAnswer[]
  ): Promise<void> {
    const readRef = doc(db, this.CAMPAIGN_READS_COLLECTION, `${campaignId}_${userId}`);
    
    // Calcular pontuação usando questionId
    let correctAnswers = 0;
    const campaign = await this.getCampaign(campaignId);
    
    if (campaign?.quiz) {
      answers.forEach((answer) => {
        const question = campaign.quiz?.questions.find(q => q.id === answer.questionId);
        if (question && question.correctAnswer === answer.selectedAnswer) {
          correctAnswers++;
        }
      });
    }

    const score = campaign?.quiz ? (correctAnswers / campaign.quiz.questions.length) * 100 : 0;

    await setDoc(readRef, {
      quizAnswers: answers,
      quizScore: score,
      quizCompletedAt: serverTimestamp(),
      hasCompleted: true,
      hasRead: true,
    }, { merge: true });
  }

  static async getUserCampaignRead(campaignId: string, userId: string): Promise<CampaignRead | null> {
    const readRef = doc(db, this.CAMPAIGN_READS_COLLECTION, `${campaignId}_${userId}`);
    const docSnap = await getDoc(readRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        viewedAt: data.viewedAt?.toDate(),
        readAt: data.readAt?.toDate(),
        quizCompletedAt: data.quizCompletedAt?.toDate(),
      } as CampaignRead;
    }
    
    return null;
  }

  static subscribeToUserCampaignReads(
    userId: string,
    callback?: (reads: CampaignRead[]) => void
  ) {
    const q = query(
      collection(db, this.CAMPAIGN_READS_COLLECTION),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const reads: CampaignRead[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        viewedAt: doc.data().viewedAt?.toDate(),
        readAt: doc.data().readAt?.toDate(),
        quizCompletedAt: doc.data().quizCompletedAt?.toDate(),
      } as CampaignRead));
      
      callback?.(reads);
    });
  }

  static async getCampaignAnalytics(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) return null;

    const readsQuery = query(
      collection(db, this.CAMPAIGN_READS_COLLECTION),
      where('campaignId', '==', campaignId)
    );
    
    const readsSnapshot = await getDocs(readsQuery);
    const reads = readsSnapshot.docs.map((doc: any) => doc.data() as CampaignRead);
    
    const totalViews = reads.filter(read => read.hasRead).length;
    const totalCompletions = reads.filter(read => read.hasCompleted).length;
    const averageScore = reads
      .filter((read: any) => read.quizScore !== undefined)
      .reduce((sum: any, read: any) => sum + (read.quizScore || 0), 0) / Math.max(1, totalCompletions);

    return {
      campaign,
      totalViews,
      totalCompletions,
      completionRate: totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0,
      averageScore: averageScore || 0,
      reads,
    };
  }

  static async searchCampaigns(searchTerm: string, filters?: {
    category?: string;
    isActive?: boolean;
    targetAudience?: string[];
  }): Promise<Campaign[]> {
    // Para busca mais avançada, seria recomendado usar Algolia ou similar
    // Por enquanto, fazemos busca simples no título
    let q = query(collection(db, this.COLLECTION));

    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    if (filters?.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.targetAudience && filters.targetAudience.length > 0) {
      q = query(q, where('targetAudience', 'array-contains-any', filters.targetAudience));
    }

    const snapshot = await getDocs(q);
    const campaigns = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
    } as Campaign));

    // Filtrar por termo de busca localmente
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return campaigns.filter((campaign: any) => 
        campaign.title.toLowerCase().includes(searchLower) ||
        campaign.description.toLowerCase().includes(searchLower) ||
        campaign.content.toLowerCase().includes(searchLower)
      );
    }

    return campaigns;
  }
}