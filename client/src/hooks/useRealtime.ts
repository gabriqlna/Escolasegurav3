import { useState, useEffect } from 'react';
import { 
  subscribeToReports, 
  subscribeToActiveVisitors, 
  subscribeToActiveNotices, 
  subscribeToCampaigns,
  subscribeToUsers 
} from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Report } from './useReports';

// Hook para relatórios em tempo real (visível para todos)
export const useRealtimeReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time reports subscription...');
    setLoading(true);
    
    const unsubscribe = subscribeToReports((data) => {
      console.log('Real-time reports update:', data.length, 'reports');
      setReports(data as Report[]);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time reports subscription');
      unsubscribe();
    };
  }, []);

  return { reports, loading, error };
};

// Hook para visitantes ativos em tempo real (visível para todos)
export const useRealtimeVisitors = () => {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time visitors subscription...');
    setLoading(true);
    
    const unsubscribe = subscribeToActiveVisitors((data) => {
      console.log('Real-time visitors update:', data.length, 'active visitors');
      setVisitors(data);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('Cleaning up real-time visitors subscription');
      unsubscribe();
    };
  }, []);

  return { visitors, loading, error };
};

// Hook para avisos ativos em tempo real (visível para todos)
export const useRealtimeNotices = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time notices subscription...');
    setLoading(true);
    
    const unsubscribe = subscribeToActiveNotices((data) => {
      console.log('Real-time notices update:', data.length, 'active notices');
      setNotices(data);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('Cleaning up real-time notices subscription');
      unsubscribe();
    };
  }, []);

  return { notices, loading, error };
};

// Hook para campanhas em tempo real (visível para todos)
export const useRealtimeCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up real-time campaigns subscription...');
    setLoading(true);
    
    const unsubscribe = subscribeToCampaigns((data) => {
      console.log('Real-time campaigns update:', data.length, 'active campaigns');
      setCampaigns(data);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('Cleaning up real-time campaigns subscription');
      unsubscribe();
    };
  }, []);

  return { campaigns, loading, error };
};

// Hook para usuários em tempo real (somente para administradores)
export const useRealtimeUsers = () => {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !hasPermission(['direcao'])) {
      setUsers([]);
      setLoading(false);
      return;
    }

    console.log('Setting up real-time users subscription...');
    setLoading(true);
    
    const unsubscribe = subscribeToUsers((data) => {
      console.log('Real-time users update:', data.length, 'users');
      setUsers(data);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('Cleaning up real-time users subscription');
      unsubscribe();
    };
  }, [user, hasPermission]);

  return { users, loading, error };
};

// Hook combinado para estatísticas do dashboard em tempo real
export const useRealtimeDashboardStats = () => {
  const { reports } = useRealtimeReports();
  const { visitors } = useRealtimeVisitors();
  const { notices } = useRealtimeNotices();
  const { campaigns } = useRealtimeCampaigns();
  
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    activeVisitors: visitors.length,
    activeNotices: notices.length,
    activeCampaigns: campaigns.length,
    // Dados estáticos por enquanto - podem ser convertidos para tempo real se necessário
    completedChecklist: 8,
    totalChecklistItems: 12,
    upcomingDrills: 2,
    loading: false,
    error: null
  };

  return stats;
};