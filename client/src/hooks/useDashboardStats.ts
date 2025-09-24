// Real-time Dashboard Statistics Hook
import { useEffect, useState } from 'react';
import { getDocuments, collections } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  activeVisitors: number;
  completedChecklist: number;
  totalChecklistItems: number;
  upcomingDrills: number;
  activeNotices: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    activeVisitors: 0,
    completedChecklist: 0,
    totalChecklistItems: 0,
    upcomingDrills: 0,
    activeNotices: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      if (!user) return;
      
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Get all data in parallel with better error handling
        const [reports, visitors, checklistItems, drills, notices] = await Promise.all([
          getDocuments(collections.reports).catch(err => { console.log('Reports error:', err); return []; }),
          getDocuments(collections.visitors, [{ field: 'isActive', operator: '==', value: true }]).catch(err => { console.log('Visitors error:', err); return []; }),
          getDocuments(collections.checklistItems).catch(err => { console.log('Checklist error:', err); return []; }),
          getDocuments(collections.drills, [{ field: 'scheduledDate', operator: '>=', value: new Date() }]).catch(err => { console.log('Drills error:', err); return []; }),
          getDocuments(collections.notices, [{ field: 'isActive', operator: '==', value: true }]).catch(err => { console.log('Notices error:', err); return []; }),
        ]);

        if (!isMounted) return;

        // Calculate real statistics
        const totalReports = reports.length;
        const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'open').length;
        const activeVisitors = visitors.length;
        const totalChecklistItems = checklistItems.length;
        const completedChecklist = checklistItems.filter(item => item.isCompleted).length;
        const upcomingDrills = drills.length;
        const activeNotices = notices.length;

        setStats({
          totalReports,
          pendingReports,
          activeVisitors,
          completedChecklist,
          totalChecklistItems,
          upcomingDrills,
          activeNotices,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            loading: false,
            error: 'Erro ao carregar estatísticas. Usando dados padrão.',
            // Provide fallback data for better UX
            totalReports: 0,
            pendingReports: 0,
            activeVisitors: 0,
            completedChecklist: 0,
            totalChecklistItems: 0,
            upcomingDrills: 0,
            activeNotices: 0,
          }));
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return stats;
};