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
import { incidentsService } from '@/services/incidents';
import { Button } from '@/components/ui/Button';
import { Incident } from '@/types';

const categoryIcons = {
  equipment: 'build',
  conflict: 'people',
  accident: 'medical',
  security: 'shield',
  health: 'heart',
  other: 'document'
};

const categoryLabels = {
  equipment: 'Equipamento',
  conflict: 'Conflito',
  accident: 'Acidente',
  security: 'Segurança',
  health: 'Saúde',
  other: 'Outros'
};

const severityColors = {
  low: '#34C759',
  medium: '#FF9500',
  high: '#FF3B30',
  critical: '#AF52DE'
};

const severityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'CRÍTICA'
};

const statusColors = {
  open: '#FF3B30',
  in_progress: '#FF9500',
  resolved: '#34C759',
  closed: '#8E8E93'
};

const statusLabels = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado'
};

export default function IncidentsScreen() {
  const { user, hasPermission } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'open' | 'critical'>('all');

  const canCreateIncidents = hasPermission('create_incidents');
  const canManageIncidents = hasPermission('manage_incidents');

  useEffect(() => {
    loadIncidents();
  }, [viewMode]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      let result;

      switch (viewMode) {
        case 'open':
          result = await incidentsService.getOpenIncidents();
          break;
        case 'critical':
          result = await incidentsService.getCriticalIncidents();
          break;
        default:
          result = await incidentsService.getAllIncidents();
      }

      if (result.success && result.data) {
        setIncidents(result.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar ocorrências');
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const handleStatusUpdate = (incident: Incident, newStatus: Incident['status']) => {
    const actionLabels = {
      in_progress: 'marcar como em andamento',
      resolved: 'marcar como resolvido',
      closed: 'fechar ocorrência'
    };

    Alert.alert(
      'Atualizar Status',
      `Deseja ${actionLabels[newStatus]}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const result = await incidentsService.updateIncidentStatus(incident.id, newStatus);
              if (result.success) {
                Alert.alert('Sucesso', 'Status atualizado com sucesso');
                await loadIncidents();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao atualizar status');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro inesperado ao atualizar status');
            }
          },
        },
      ]
    );
  };

  const handleDeleteIncident = (incident: Incident) => {
    Alert.alert(
      'Excluir Ocorrência',
      `Tem certeza que deseja excluir "${incident.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await incidentsService.deleteIncident(incident.id);
              if (result.success) {
                Alert.alert('Sucesso', 'Ocorrência excluída com sucesso');
                await loadIncidents();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao excluir ocorrência');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro inesperado ao excluir ocorrência');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderIncidentCard = ({ item }: { item: Incident }) => {
    return (
      <TouchableOpacity
        style={[
          styles.incidentCard,
          { borderLeftColor: severityColors[item.severity] }
        ]}
        onPress={() => router.push(`/incidents/${item.id}` as any)}
        data-testid={`incident-card-${item.id}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.categoryIcon, { backgroundColor: severityColors[item.severity] + '20' }]}>
              <Ionicons 
                name={categoryIcons[item.category] as any} 
                size={20} 
                color={severityColors[item.severity]} 
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.cardMeta}>
                <View style={[styles.categoryBadge, { backgroundColor: '#E8F4FD' }]}>
                  <Text style={[styles.categoryText, { color: '#007AFF' }]}>
                    {categoryLabels[item.category]}
                  </Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: severityColors[item.severity] }]}>
                  <Text style={styles.severityText}>
                    {severityLabels[item.severity]}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{formatDate(item.reportedAt)}</Text>
            </View>
            {item.followUpRequired && (
              <View style={styles.infoItem}>
                <Ionicons name="flag" size={14} color="#FF9500" />
                <Text style={[styles.infoText, { color: '#FF9500' }]}>Follow-up necessário</Text>
              </View>
            )}
          </View>

          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
              <Text style={styles.statusText}>
                {statusLabels[item.status]}
              </Text>
            </View>
            
            {canManageIncidents && item.status === 'open' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleStatusUpdate(item, 'in_progress')}
                data-testid={`button-progress-${item.id}`}
              >
                <Ionicons name="play-circle" size={20} color="#FF9500" />
              </TouchableOpacity>
            )}
            
            {canManageIncidents && (item.status === 'open' || item.status === 'in_progress') && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleStatusUpdate(item, 'resolved')}
                data-testid={`button-resolve-${item.id}`}
              >
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              </TouchableOpacity>
            )}

            {canManageIncidents && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteIncident(item)}
                data-testid={`button-delete-${item.id}`}
              >
                <Ionicons name="trash" size={16} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={
          viewMode === 'critical' ? 'warning' : 
          viewMode === 'open' ? 'folder-open' : 
          'document-text-outline'
        } 
        size={64} 
        color="#C7C7CC" 
      />
      <Text style={styles.emptyTitle}>
        {viewMode === 'critical' ? 'Nenhuma ocorrência crítica' : 
         viewMode === 'open' ? 'Nenhuma ocorrência aberta' : 
         'Nenhuma ocorrência registrada'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {viewMode === 'critical' ? 'Não há ocorrências críticas no momento' : 
         viewMode === 'open' ? 'Todas as ocorrências foram resolvidas' : 
         'Não há ocorrências registradas no sistema'}
      </Text>
      {canCreateIncidents && viewMode === 'all' && (
        <Button
          title="Registrar Primeira Ocorrência"
          onPress={() => router.push('/incidents/create' as any)}
          style={styles.emptyButton}
          data-testid="button-create-first-incident"
        />
      )}
    </View>
  );

  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const openCount = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Diário de Ocorrências</Text>
        <Text style={styles.subtitle}>
          {viewMode === 'critical' ? `${criticalCount} ocorrência${criticalCount !== 1 ? 's' : ''} crítica${criticalCount !== 1 ? 's' : ''}` :
           viewMode === 'open' ? `${openCount} ocorrência${openCount !== 1 ? 's' : ''} aberta${openCount !== 1 ? 's' : ''}` :
           `${incidents.length} ocorrência${incidents.length !== 1 ? 's' : ''} registrada${incidents.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'all' && styles.activeTab]}
            onPress={() => setViewMode('all')}
            data-testid="tab-all"
          >
            <Text style={[styles.tabText, viewMode === 'all' && styles.activeTabText]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'open' && styles.activeTab]}
            onPress={() => setViewMode('open')}
            data-testid="tab-open"
          >
            <Text style={[styles.tabText, viewMode === 'open' && styles.activeTabText]}>
              Abertas
              {openCount > 0 && (
                <Text style={styles.badgeText}> ({openCount})</Text>
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'critical' && styles.activeTab]}
            onPress={() => setViewMode('critical')}
            data-testid="tab-critical"
          >
            <Text style={[styles.tabText, viewMode === 'critical' && styles.activeTabText]}>
              Críticas
              {criticalCount > 0 && (
                <Text style={styles.badgeText}> ({criticalCount})</Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={incidents}
        renderItem={renderIncidentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          incidents.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />

      {canCreateIncidents && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/incidents/create' as any)}
          data-testid="button-create-incident"
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
  controls: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#007AFF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
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
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
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
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 6,
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