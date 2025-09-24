import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { reportsService } from '@/services/reports';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { Report } from '@/types';
import { REPORT_TYPES, STATUS_LABELS, PRIORITY_LEVELS } from '@/constants/permissions';

const statusFilterOptions: SelectOption[] = [
  { value: 'all', label: 'Todos os Status' },
  ...Object.entries(STATUS_LABELS)
    .filter(([key]) => ['pending', 'in_progress', 'resolved', 'rejected'].includes(key))
    .map(([value, label]) => ({ value, label })),
];

const typeFilterOptions: SelectOption[] = [
  { value: 'all', label: 'Todos os Tipos' },
  ...Object.entries(REPORT_TYPES).map(([value, label]) => ({ value, label })),
];

const getPriorityColor = (priority: Report['priority']) => {
  switch (priority) {
    case 'low': return '#34C759';
    case 'medium': return '#FF9500';
    case 'high': return '#FF3B30';
    case 'urgent': return '#AF52DE';
    default: return '#8E8E93';
  }
};

const getStatusColor = (status: Report['status']) => {
  switch (status) {
    case 'pending': return '#FF9500';
    case 'in_progress': return '#007AFF';
    case 'resolved': return '#34C759';
    case 'rejected': return '#FF3B30';
    default: return '#8E8E93';
  }
};

export default function ReportsListScreen() {
  const { user, hasPermission } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const canViewAllReports = hasPermission('view_all_reports');

  useEffect(() => {
    loadReports();
  }, [user, canViewAllReports]);

  const loadReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let result;

      if (canViewAllReports) {
        result = await reportsService.getAllReports();
      } else {
        result = await reportsService.getReports(user.id);
      }

      if (result.success && result.data) {
        setReports(result.data);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar denúncias');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao carregar denúncias');
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const filteredReports = reports.filter(report => {
    const statusMatch = statusFilter === 'all' || report.status === statusFilter;
    const typeMatch = typeFilter === 'all' || report.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderReportCard = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => router.push(`/reports/${item.id}` as any)}
      data-testid={`card-report-${item.id}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {PRIORITY_LEVELS[item.priority]}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardType}>
            {REPORT_TYPES[item.type]}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS]}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.cardInfo}>
          {item.location && (
            <View style={styles.infoItem}>
              <Ionicons name="location" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Ionicons name="time" size={14} color="#8E8E93" />
            <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        
        {item.isAnonymous && (
          <View style={styles.anonymousBadge}>
            <Ionicons name="eye-off" size={12} color="#8E8E93" />
            <Text style={styles.anonymousText}>Anônima</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Nenhuma denúncia encontrada</Text>
      <Text style={styles.emptySubtitle}>
        {canViewAllReports
          ? 'Não há denúncias registradas no sistema'
          : 'Você ainda não fez nenhuma denúncia'}
      </Text>
      {!canViewAllReports && (
        <Button
          title="Fazer Denúncia"
          onPress={() => router.push('/reports/create' as any)}
          style={styles.emptyButton}
          data-testid="button-create-first-report"
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {canViewAllReports ? '📋 Todas as Denúncias' : '📝 Minhas Denúncias'}
        </Text>
        <Text style={styles.subtitle}>
          {filteredReports.length} {filteredReports.length === 1 ? 'denúncia' : 'denúncias'}
        </Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Select
              value={statusFilter}
              options={statusFilterOptions}
              onValueChange={setStatusFilter}
              placeholder="Status"
            />
          </View>
          <View style={styles.filterItem}>
            <Select
              value={typeFilter}
              options={typeFilterOptions}
              onValueChange={setTypeFilter}
              placeholder="Tipo"
            />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredReports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredReports.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />

      {hasPermission('create_report') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/reports/create' as any)}
          data-testid="button-create-report"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  filters: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardInfo: {
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  anonymousText: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});