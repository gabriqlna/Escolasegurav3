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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/contexts/AuthContext';
import { visitorsService } from '@/services/visitors';
import { Button } from '@/components/ui/Button';
import { Visitor } from '@/types';

export default function VisitorsScreen() {
  const { user, hasPermission } = useAuth();
  const [activeVisitors, setActiveVisitors] = useState<Visitor[]>([]);
  const [allVisitors, setAllVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canManageVisitors = hasPermission('manage_visitors');
  const canRegisterVisitors = hasPermission('register_visitors');

  useEffect(() => {
    loadData();
  }, [viewMode, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (viewMode === 'active') {
        const result = await visitorsService.getActiveVisitors();
        if (result.success && result.data) {
          setActiveVisitors(result.data);
        }
      } else {
        const result = await visitorsService.getVisitorsByDate(selectedDate);
        if (result.success && result.data) {
          setAllVisitors(result.data);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados de visitantes');
      console.error('Error loading visitors data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCheckOut = (visitor: Visitor) => {
    Alert.alert(
      'Check-out de Visitante',
      `Confirmar check-out de ${visitor.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const result = await visitorsService.checkOutVisitor(visitor.id);
              if (result.success) {
                Alert.alert('Sucesso', 'Check-out realizado com sucesso');
                await loadData();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao fazer check-out');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro inesperado ao fazer check-out');
            }
          },
        },
      ]
    );
  };

  const getVisitDuration = (checkInTime: Date, checkOutTime?: Date) => {
    const endTime = checkOutTime || new Date();
    const durationMs = endTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderVisitorCard = ({ item }: { item: Visitor }) => {
    const isActive = item.status === 'checked_in';
    const duration = getVisitDuration(item.checkInTime, item.checkOutTime);

    return (
      <View style={[styles.visitorCard, isActive ? styles.activeCard : styles.inactiveCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.visitorInfo}>
            <Text style={styles.visitorName}>{item.name}</Text>
            <Text style={styles.visitorDocument}>{item.document}</Text>
          </View>
          <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.checkedOutBadge]}>
            <Text style={styles.statusText}>
              {isActive ? 'ATIVO' : 'SAIU'}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="business" size={16} color="#8E8E93" />
            <Text style={styles.infoText}>Motivo: {item.purpose}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#8E8E93" />
            <Text style={styles.infoText}>Anfitrião: {item.hostName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color="#8E8E93" />
            <Text style={styles.infoText}>
              Entrada: {formatTime(item.checkInTime)} 
              {item.checkOutTime && ` • Saída: ${formatTime(item.checkOutTime)}`}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="timer" size={16} color="#8E8E93" />
            <Text style={styles.infoText}>
              Duração: {duration} {isActive && '(em andamento)'}
            </Text>
          </View>

          {item.badgeNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="card" size={16} color="#8E8E93" />
              <Text style={styles.infoText}>Crachá: #{item.badgeNumber}</Text>
            </View>
          )}
        </View>

        {isActive && canManageVisitors && (
          <View style={styles.cardActions}>
            <Button
              title="Check-out"
              variant="outline"
              size="small"
              onPress={() => handleCheckOut(item)}
              data-testid={`button-checkout-${item.id}`}
            />
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={viewMode === 'active' ? 'people-outline' : 'calendar-outline'} 
        size={64} 
        color="#C7C7CC" 
      />
      <Text style={styles.emptyTitle}>
        {viewMode === 'active' ? 'Nenhum visitante ativo' : 'Nenhum visitante encontrado'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {viewMode === 'active' 
          ? 'Não há visitantes na escola no momento'
          : `Não há registros para ${selectedDate.toLocaleDateString('pt-BR')}`
        }
      </Text>
      {canRegisterVisitors && viewMode === 'active' && (
        <Button
          title="Registrar Visitante"
          onPress={() => router.push('/visitors/register' as any)}
          style={styles.emptyButton}
          data-testid="button-register-first-visitor"
        />
      )}
    </View>
  );

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const currentData = viewMode === 'active' ? activeVisitors : allVisitors;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Visitantes</Text>
        <Text style={styles.subtitle}>
          {viewMode === 'active' 
            ? `${activeVisitors.length} visitante${activeVisitors.length !== 1 ? 's' : ''} ativo${activeVisitors.length !== 1 ? 's' : ''}`
            : `${allVisitors.length} visitante${allVisitors.length !== 1 ? 's' : ''} em ${selectedDate.toLocaleDateString('pt-BR')}`
          }
        </Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'active' && styles.activeTab]}
            onPress={() => setViewMode('active')}
            data-testid="tab-active"
          >
            <Text style={[styles.tabText, viewMode === 'active' && styles.activeTabText]}>
              Ativos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'history' && styles.activeTab]}
            onPress={() => setViewMode('history')}
            data-testid="tab-history"
          >
            <Text style={[styles.tabText, viewMode === 'history' && styles.activeTabText]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'history' && (
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            data-testid="button-select-date"
          >
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateButtonText}>
              {selectedDate.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <FlatList
        data={currentData}
        renderItem={renderVisitorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          currentData.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />

      {canRegisterVisitors && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/visitors/register' as any)}
          data-testid="button-register-visitor"
        >
          <Ionicons name="person-add" size={24} color="#FFFFFF" />
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
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  visitorCard: {
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
  activeCard: {
    borderLeftColor: '#34C759',
  },
  inactiveCard: {
    borderLeftColor: '#8E8E93',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  visitorDocument: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#34C759',
  },
  checkedOutBadge: {
    backgroundColor: '#8E8E93',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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