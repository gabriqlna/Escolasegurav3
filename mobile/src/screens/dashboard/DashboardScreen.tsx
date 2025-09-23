import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { reportsService } from '@/services/reports';
import { emergencyService } from '@/services/emergency';
import { visitorsService } from '@/services/visitors';
import { noticesService } from '@/services/notices';
import { Report, EmergencyAlert, Visitor, Notice } from '@/types';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  urgentReports: number;
  activeVisitors: number;
  emergencyAlerts: number;
  activeNotices: number;
  todayIncidents: number;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  onPress,
  testId 
}: { 
  title: string; 
  value: number | string; 
  icon: string; 
  color: string; 
  onPress?: () => void;
  testId?: string;
}) => (
  <TouchableOpacity 
    style={[styles.statCard, { borderLeftColor: color }]} 
    onPress={onPress}
    disabled={!onPress}
    data-testid={testId}
  >
    <View style={styles.statIcon}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const RecentActivityCard = ({ 
  title, 
  items, 
  emptyMessage, 
  onViewAll 
}: { 
  title: string; 
  items: any[]; 
  emptyMessage: string; 
  onViewAll: () => void;
}) => (
  <View style={styles.activityCard}>
    <View style={styles.activityHeader}>
      <Text style={styles.activityTitle}>{title}</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAllText}>Ver todos</Text>
      </TouchableOpacity>
    </View>
    {items.length === 0 ? (
      <Text style={styles.emptyMessage}>{emptyMessage}</Text>
    ) : (
      items.slice(0, 3).map((item, index) => (
        <View key={index} style={styles.activityItem}>
          <View style={styles.activityItemContent}>
            <Text style={styles.activityItemTitle} numberOfLines={1}>
              {item.title || item.name}
            </Text>
            <Text style={styles.activityItemTime}>
              {item.createdAt ? formatTimeAgo(item.createdAt) : 'Agora'}
            </Text>
          </View>
        </View>
      ))
    )}
  </View>
);

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
};

export default function DashboardScreen() {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    urgentReports: 0,
    activeVisitors: 0,
    emergencyAlerts: 0,
    activeNotices: 0,
    todayIncidents: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canViewDashboard = hasPermission('view_dashboard');
  const canManageAll = hasPermission('manage_all');

  useEffect(() => {
    if (canViewDashboard) {
      loadDashboardData();
    }
  }, [canViewDashboard]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados em paralelo
      const [
        reportsResult,
        visitorsResult,
        alertsResult,
        noticesResult
      ] = await Promise.all([
        reportsService.getAllReports(20),
        visitorsService.getActiveVisitors(),
        emergencyService.getActiveAlerts(),
        noticesService.getActiveNotices()
      ]);

      // Processar relatórios
      if (reportsResult.success && reportsResult.data) {
        const reports = reportsResult.data;
        setRecentReports(reports.slice(0, 5));
        
        setStats(prevStats => ({
          ...prevStats,
          totalReports: reports.length,
          pendingReports: reports.filter(r => r.status === 'pending').length,
          urgentReports: reports.filter(r => r.priority === 'urgent').length,
        }));
      }

      // Processar visitantes
      if (visitorsResult.success && visitorsResult.data) {
        const visitors = visitorsResult.data;
        setRecentVisitors(visitors.slice(0, 5));
        
        setStats(prevStats => ({
          ...prevStats,
          activeVisitors: visitors.length,
        }));
      }

      // Processar alertas de emergência
      if (alertsResult.success && alertsResult.data) {
        const alerts = alertsResult.data;
        setActiveAlerts(alerts);
        
        setStats(prevStats => ({
          ...prevStats,
          emergencyAlerts: alerts.length,
        }));
      }

      // Processar avisos
      if (noticesResult.success && noticesResult.data) {
        const notices = noticesResult.data;
        
        setStats(prevStats => ({
          ...prevStats,
          activeNotices: notices.length,
        }));
      }

    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do dashboard');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (!canViewDashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noPermissionContainer}>
          <Ionicons name="lock-closed" size={64} color="#C7C7CC" />
          <Text style={styles.noPermissionTitle}>Acesso Restrito</Text>
          <Text style={styles.noPermissionSubtitle}>
            Você não tem permissão para acessar o dashboard administrativo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>📊 Dashboard</Text>
          <Text style={styles.subtitle}>
            Visão geral da segurança escolar
          </Text>
        </View>

        {/* Alertas de Emergência Ativos */}
        {activeAlerts.length > 0 && (
          <View style={styles.emergencySection}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="warning" size={24} color="#FF3B30" />
              <Text style={styles.emergencyTitle}>
                {activeAlerts.length} Alerta{activeAlerts.length > 1 ? 's' : ''} Ativo{activeAlerts.length > 1 ? 's' : ''}
              </Text>
            </View>
            {activeAlerts.slice(0, 2).map((alert, index) => (
              <TouchableOpacity 
                key={alert.id} 
                style={styles.emergencyAlert}
                onPress={() => router.push('/emergency' as any)}
              >
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>
                  {formatTimeAgo(alert.createdAt)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Estatísticas Principais */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Denúncias"
              value={stats.totalReports}
              icon="document-text"
              color="#007AFF"
              onPress={() => router.push('/reports' as any)}
              testId="stat-reports"
            />
            <StatCard
              title="Pendentes"
              value={stats.pendingReports}
              icon="hourglass"
              color="#FF9500"
              onPress={() => router.push('/reports' as any)}
              testId="stat-pending"
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatCard
              title="Urgentes"
              value={stats.urgentReports}
              icon="alert-circle"
              color="#FF3B30"
              onPress={() => router.push('/reports' as any)}
              testId="stat-urgent"
            />
            <StatCard
              title="Visitantes Ativos"
              value={stats.activeVisitors}
              icon="people"
              color="#34C759"
              onPress={() => router.push('/visitors' as any)}
              testId="stat-visitors"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Avisos Ativos"
              value={stats.activeNotices}
              icon="notifications"
              color="#AF52DE"
              onPress={() => router.push('/notices' as any)}
              testId="stat-notices"
            />
            <StatCard
              title="Alertas"
              value={stats.emergencyAlerts}
              icon="warning"
              color={stats.emergencyAlerts > 0 ? "#FF3B30" : "#8E8E93"}
              onPress={() => router.push('/emergency' as any)}
              testId="stat-alerts"
            />
          </View>
        </View>

        {/* Atividade Recente */}
        <View style={styles.activitySection}>
          <RecentActivityCard
            title="🚨 Denúncias Recentes"
            items={recentReports}
            emptyMessage="Nenhuma denúncia recente"
            onViewAll={() => router.push('/reports' as any)}
          />

          <RecentActivityCard
            title="👥 Visitantes Ativos"
            items={recentVisitors}
            emptyMessage="Nenhum visitante ativo"
            onViewAll={() => router.push('/visitors' as any)}
          />
        </View>

        {/* Ações Rápidas */}
        {canManageAll && (
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/reports/create' as any)}
                data-testid="quick-create-report"
              >
                <Ionicons name="add-circle" size={32} color="#007AFF" />
                <Text style={styles.quickActionTitle}>Nova Denúncia</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/visitors/register' as any)}
                data-testid="quick-register-visitor"
              >
                <Ionicons name="person-add" size={32} color="#34C759" />
                <Text style={styles.quickActionTitle}>Registrar Visitante</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/notices/create' as any)}
                data-testid="quick-create-notice"
              >
                <Ionicons name="megaphone" size={32} color="#AF52DE" />
                <Text style={styles.quickActionTitle}>Novo Aviso</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/emergency' as any)}
                data-testid="quick-emergency"
              >
                <Ionicons name="warning" size={32} color="#FF3B30" />
                <Text style={styles.quickActionTitle}>Emergência</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emergencySection: {
    backgroundColor: '#FFF5F5',
    borderTopWidth: 3,
    borderTopColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  emergencyAlert: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  alertTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  activitySection: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activityItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityItemTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  activityItemTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  quickActionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 48) / 2 - 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noPermissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  noPermissionSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});