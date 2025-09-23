import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { reportsService } from '@/services/reports';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { Report } from '@/types';
import { REPORT_TYPES, STATUS_LABELS, PRIORITY_LEVELS } from '@/constants/permissions';

const statusOptions: SelectOption[] = Object.entries(STATUS_LABELS)
  .filter(([key]) => ['pending', 'in_progress', 'resolved', 'rejected'].includes(key))
  .map(([value, label]) => ({ value, label }));

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

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, hasPermission } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const canUpdateStatus = hasPermission('update_report_status');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    // Para esta implementação básica, vamos simular a busca por ID
    // Em um sistema real, você criaria um método getReportById no serviço
    Alert.alert('Recurso em desenvolvimento', 'Visualização detalhada de denúncias será implementada em breve');
    router.back();
  };

  const handleStatusUpdate = async () => {
    if (!report || !newStatus || newStatus === report.status) return;

    setUpdating(true);
    try {
      const result = await reportsService.updateReportStatus(
        report.id,
        newStatus as Report['status'],
        undefined,
        user?.id
      );

      if (result.success) {
        setReport({ ...report, status: newStatus as Report['status'] });
        Alert.alert('Sucesso', 'Status da denúncia atualizado com sucesso');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao atualizar status');
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Denúncia</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.comingSoon}>🚧 Tela de detalhes em desenvolvimento...</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 18,
    color: '#FF9500',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 48,
  },
});