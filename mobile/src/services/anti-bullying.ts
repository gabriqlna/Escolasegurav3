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
import { db, auth } from './firebase';
import { Report, ApiResponse } from '@/types';

// Specialized Anti-Bullying report interface with additional fields
export interface AntiBullyingReport extends Report {
  // Bullying-specific fields
  bullyingType: 'verbal' | 'physical' | 'cyber' | 'social_exclusion' | 'other';
  frequency: 'single_incident' | 'weekly' | 'daily' | 'ongoing';
  impactLevel: 'low' | 'medium' | 'high' | 'severe';
  witnessesPresent: boolean;
  previouslyReported: boolean;
  supportRequested: boolean;
  
  // Enhanced security/tracking
  isHighRisk: boolean;
  counselorAssigned?: string;
  parentNotified: boolean;
  followUpScheduled?: Date;
}

export type AntiBullyingReportCreate = Omit<AntiBullyingReport, 'id' | 'createdAt' | 'updatedAt' | 'type' | 'status'>;

class AntiBullyingService {
  private collectionName = 'anti_bullying_reports';
  
  async createAntiBullyingReport(
    reportData: AntiBullyingReportCreate
  ): Promise<ApiResponse<AntiBullyingReport>> {
    try {
      // Automatically set high priority and bullying type
      const enhancedReportData = {
        ...reportData,
        type: 'bullying' as const,
        status: 'pending' as const,
        priority: this.determinePriority(reportData),
        isHighRisk: this.assessRiskLevel(reportData),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), enhancedReportData);

      const report: AntiBullyingReport = {
        ...enhancedReportData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // If high risk, also create an emergency alert
      if (report.isHighRisk) {
        await this.createHighRiskAlert(report);
      }

      return {
        success: true,
        data: report,
        message: 'Denúncia de bullying registrada com sucesso. Nossa equipe especializada irá analisar com prioridade.'
      };
    } catch (error: any) {
      console.error('Error creating anti-bullying report:', error);
      return {
        success: false,
        error: 'Erro ao registrar denúncia de bullying: ' + error.message
      };
    }
  }

  private determinePriority(reportData: AntiBullyingReportCreate): Report['priority'] {
    // High risk cases get urgent priority
    if (this.assessRiskLevel(reportData)) {
      return 'urgent';
    }
    
    // Daily or ongoing frequency gets high priority
    if (reportData.frequency === 'daily' || reportData.frequency === 'ongoing') {
      return 'high';
    }

    // Severe impact gets high priority
    if (reportData.impactLevel === 'severe') {
      return 'high';
    }

    // Physical bullying gets high priority
    if (reportData.bullyingType === 'physical') {
      return 'high';
    }

    return 'medium';
  }

  private assessRiskLevel(reportData: AntiBullyingReportCreate): boolean {
    // High risk indicators
    const riskFactors = [
      reportData.impactLevel === 'severe',
      reportData.bullyingType === 'physical',
      reportData.frequency === 'daily' || reportData.frequency === 'ongoing',
      reportData.supportRequested === true
    ];

    // If 2 or more risk factors, mark as high risk
    return riskFactors.filter(Boolean).length >= 2;
  }

  private async createHighRiskAlert(report: AntiBullyingReport): Promise<void> {
    try {
      const { emergencyService } = await import('./emergency');
      
      await emergencyService.createEmergencyAlert({
        type: 'security',
        title: '⚠️ DENÚNCIA DE BULLYING DE ALTO RISCO',
        description: `Uma denúncia de bullying de alto risco foi registrada. ID: ${report.id}. Intervenção imediata necessária.`,
        location: report.location,
        severity: 'high',
        isActive: true,
        createdBy: 'system'
      });
    } catch (error) {
      console.error('Error creating high-risk alert for bullying report:', error);
    }
  }

  async getAntiBullyingReports(
    userId?: string, 
    limit?: number
  ): Promise<ApiResponse<AntiBullyingReport[]>> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      // If userId provided, filter by reporter (except anonymous)
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
      const reports: AntiBullyingReport[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push(this.mapFirestoreToReport(doc.id, data));
      });

      return {
        success: true,
        data: reports,
        message: 'Denúncias de bullying carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting anti-bullying reports:', error);
      return {
        success: false,
        error: 'Erro ao carregar denúncias de bullying: ' + error.message
      };
    }
  }

  async updateReportStatus(
    reportId: string, 
    status: Report['status'], 
    resolution?: string,
    resolvedBy?: string,
    additionalData?: {
      counselorAssigned?: string;
      parentNotified?: boolean;
      followUpScheduled?: Date;
    }
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

      // Add bullying-specific updates
      if (additionalData) {
        if (additionalData.counselorAssigned) {
          updateData.counselorAssigned = additionalData.counselorAssigned;
        }
        if (additionalData.parentNotified !== undefined) {
          updateData.parentNotified = additionalData.parentNotified;
        }
        if (additionalData.followUpScheduled) {
          updateData.followUpScheduled = Timestamp.fromDate(additionalData.followUpScheduled);
        }
      }

      await updateDoc(doc(db, this.collectionName, reportId), updateData);

      return {
        success: true,
        message: 'Status da denúncia de bullying atualizado com sucesso'
      };
    } catch (error: any) {
      console.error('Error updating anti-bullying report status:', error);
      return {
        success: false,
        error: 'Erro ao atualizar status da denúncia: ' + error.message
      };
    }
  }

  async getHighRiskReports(): Promise<ApiResponse<AntiBullyingReport[]>> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isHighRisk', '==', true),
        where('status', 'in', ['pending', 'in_progress']),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reports: AntiBullyingReport[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push(this.mapFirestoreToReport(doc.id, data));
      });

      return {
        success: true,
        data: reports,
        message: 'Denúncias de bullying de alto risco carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting high-risk reports:', error);
      return {
        success: false,
        error: 'Erro ao carregar denúncias de alto risco: ' + error.message
      };
    }
  }

  async getReportById(reportId: string): Promise<ApiResponse<AntiBullyingReport>> {
    try {
      const docRef = doc(db, this.collectionName, reportId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Denúncia de bullying não encontrada'
        };
      }

      const data = docSnap.data();
      const report = this.mapFirestoreToReport(docSnap.id, data);

      return {
        success: true,
        data: report,
        message: 'Denúncia de bullying carregada com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting anti-bullying report by ID:', error);
      return {
        success: false,
        error: 'Erro ao carregar denúncia de bullying: ' + error.message
      };
    }
  }

  async deleteReport(reportId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, this.collectionName, reportId));
      
      return {
        success: true,
        message: 'Denúncia de bullying excluída com sucesso'
      };
    } catch (error: any) {
      console.error('Error deleting anti-bullying report:', error);
      return {
        success: false,
        error: 'Erro ao excluir denúncia de bullying: ' + error.message
      };
    }
  }

  // Helper method to map Firestore data to TypeScript interface
  private mapFirestoreToReport(id: string, data: any): AntiBullyingReport {
    return {
      id,
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
      resolution: data.resolution,
      // Anti-bullying specific fields
      bullyingType: data.bullyingType,
      frequency: data.frequency,
      impactLevel: data.impactLevel,
      witnessesPresent: data.witnessesPresent,
      previouslyReported: data.previouslyReported,
      supportRequested: data.supportRequested,
      isHighRisk: data.isHighRisk,
      counselorAssigned: data.counselorAssigned,
      parentNotified: data.parentNotified,
      followUpScheduled: data.followUpScheduled?.toDate()
    };
  }

  // Get statistics for admin dashboard
  async getBullyingStatistics(): Promise<ApiResponse<{
    total: number;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    highRisk: number;
    resolved: number;
  }>> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      
      const stats = {
        total: 0,
        byType: {} as Record<string, number>,
        byImpact: {} as Record<string, number>,
        highRisk: 0,
        resolved: 0
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;

        // Count by type
        stats.byType[data.bullyingType] = (stats.byType[data.bullyingType] || 0) + 1;

        // Count by impact
        stats.byImpact[data.impactLevel] = (stats.byImpact[data.impactLevel] || 0) + 1;

        // Count high risk
        if (data.isHighRisk) {
          stats.highRisk++;
        }

        // Count resolved
        if (data.status === 'resolved') {
          stats.resolved++;
        }
      });

      return {
        success: true,
        data: stats,
        message: 'Estatísticas de bullying carregadas com sucesso'
      };
    } catch (error: any) {
      console.error('Error getting bullying statistics:', error);
      return {
        success: false,
        error: 'Erro ao carregar estatísticas: ' + error.message
      };
    }
  }
}

export const antiBullyingService = new AntiBullyingService();