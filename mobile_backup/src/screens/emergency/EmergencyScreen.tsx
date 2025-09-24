import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAuth } from '@/contexts/AuthContext';
import { emergencyService } from '@/services/emergency';
import { Button } from '@/components/ui/Button';
import { EmergencyAlert } from '@/types';
import { EMERGENCY_TYPES } from '@/constants/permissions';

const getSeverityColor = (severity: EmergencyAlert['severity']) => {
  switch (severity) {
    case 'low': return '#34C759';
    case 'medium': return '#FF9500';
    case 'high': return '#FF3B30';
    case 'critical': return '#AF52DE';
    default: return '#8E8E93';
  }
};

const getEmergencyIcon = (type: EmergencyAlert['type']) => {
  switch (type) {
    case 'fire': return 'flame';
    case 'evacuation': return 'exit';
    case 'lockdown': return 'lock-closed';
    case 'medical': return 'medical';
    case 'security': return 'shield';
    case 'weather': return 'cloudy';
    default: return 'warning';
  }
};

export default function EmergencyScreen() {
  const { user, hasPermission } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggeringPanic, setTriggeringPanic] = useState(false);

  const canCreateAlert = hasPermission('create_emergency_alert');
  const canManageAlerts = hasPermission('manage_emergency_alerts');

  useEffect(() => {
    loadActiveAlerts();
  }, []);

  const loadActiveAlerts = async () => {
    try {
      setLoading(true);
      const result = await emergencyService.getActiveAlerts();

      if (result.success && result.data) {
        setActiveAlerts(result.data);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar alertas ativos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao carregar alertas');
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveAlerts();
    setRefreshing(false);
  };

  const handlePanicButton = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para acionar o botão de pânico');
      return;
    }

    Alert.alert(
      '🚨 ALERTA DE PÂNICO',
      'Você está prestes a acionar o botão de pânico. Esta ação irá notificar imediatamente a equipe de segurança.\n\nContinuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'ACIONAR PÂNICO',
          style: 'destructive',
          onPress: triggerPanicAlert,
        },
      ]
    );
  };

  const triggerPanicAlert = async () => {
    if (!user) return;

    setTriggeringPanic(true);
    
    try {
      // Vibrar dispositivo
      Vibration.vibrate([500, 300, 500, 300, 500]);
      
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Tentar obter localização atual
      let currentLocation = 'Localização não disponível';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          currentLocation = `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`;
        }
      } catch (locationError) {
        console.log('Could not get location:', locationError);
      }

      const result = await emergencyService.triggerPanicAlert(user.id, user.name);

      if (result.success) {
        Alert.alert(
          '✅ ALERTA ENVIADO',
          'Sua solicitação de emergência foi enviada! A equipe de segurança foi notificada e está a caminho.',
          [{ text: 'OK' }]
        );
        await loadActiveAlerts(); // Recarregar alertas
      } else {
        Alert.alert('Erro', result.error || 'Erro ao acionar alerta de pânico');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao acionar alerta de pânico');
      console.error('Error triggering panic:', error);
    } finally {
      setTriggeringPanic(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    if (!user || !canManageAlerts) return;

    Alert.alert(
      'Resolver Alerta',
      'Tem certeza que deseja marcar este alerta como resolvido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resolver',
          onPress: async () => {
            const result = await emergencyService.resolveAlert(alertId, user.id);
            if (result.success) {
              await loadActiveAlerts();
            } else {
              Alert.alert('Erro', result.error || 'Erro ao resolver alerta');
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

  const renderEmergencyCard = (alert: EmergencyAlert) => (
    <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleRow}>
          <View style={[styles.alertIcon, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
            <Ionicons 
              name={getEmergencyIcon(alert.type) as any} 
              size={24} 
              color={getSeverityColor(alert.severity)} 
            />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertType}>{EMERGENCY_TYPES[alert.type]}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
            <Text style={styles.severityText}>
              {alert.severity.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.alertDescription}>{alert.description}</Text>

      <View style={styles.alertFooter}>
        <View style={styles.alertInfo}>
          {alert.location && (
            <View style={styles.infoItem}>
              <Ionicons name="location" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{alert.location}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Ionicons name="time" size={14} color="#8E8E93" />
            <Text style={styles.infoText}>{formatDate(alert.createdAt)}</Text>
          </View>
        </View>

        {canManageAlerts && (
          <Button
            title="Resolver"
            variant="secondary"
            size="small"
            onPress={() => handleResolveAlert(alert.id)}
            data-testid={`button-resolve-${alert.id}`}
          />
        )}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Ações de Emergência</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.quickActionCard} data-testid="card-evacuation-plan">
          <View style={[styles.actionIcon, { backgroundColor: '#007AFF20' }]}>
            <Ionicons name="map" size={32} color="#007AFF" />
          </View>
          <Text style={styles.actionTitle}>Plano de Evacuação</Text>
          <Text style={styles.actionSubtitle}>Ver rotas de fuga</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard} data-testid="card-emergency-contacts">
          <View style={[styles.actionIcon, { backgroundColor: '#34C75920' }]}>
            <Ionicons name="call" size={32} color="#34C759" />
          </View>
          <Text style={styles.actionTitle}>Contatos de Emergência</Text>
          <Text style={styles.actionSubtitle}>Ligar para ajuda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard} data-testid="card-first-aid">
          <View style={[styles.actionIcon, { backgroundColor: '#FF950020' }]}>
            <Ionicons name="medical" size={32} color="#FF9500" />
          </View>
          <Text style={styles.actionTitle}>Primeiros Socorros</Text>
          <Text style={styles.actionSubtitle}>Instruções básicas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard} data-testid="card-incident-report">
          <View style={[styles.actionIcon, { backgroundColor: '#AF52DE20' }]}>
            <Ionicons name="document-text" size={32} color="#AF52DE" />
          </View>
          <Text style={styles.actionTitle}>Reportar Incidente</Text>
          <Text style={styles.actionSubtitle}>Fazer denúncia</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🚨 Central de Emergência</Text>
          <Text style={styles.subtitle}>
            {activeAlerts.length > 0 
              ? `${activeAlerts.length} alerta${activeAlerts.length > 1 ? 's' : ''} ativo${activeAlerts.length > 1 ? 's' : ''}`
              : 'Nenhum alerta ativo'
            }
          </Text>
        </View>

        {/* Botão de Pânico */}
        <View style={styles.panicSection}>
          <TouchableOpacity
            style={styles.panicButton}
            onPress={handlePanicButton}
            disabled={triggeringPanic}
            data-testid="button-panic"
          >
            <View style={styles.panicContent}>
              <Ionicons name="warning" size={48} color="#FFFFFF" />
              <Text style={styles.panicText}>
                {triggeringPanic ? 'ACIONANDO...' : 'BOTÃO DE PÂNICO'}
              </Text>
              <Text style={styles.panicSubtext}>
                Pressione em caso de emergência
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Alertas Ativos */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>⚠️ Alertas Ativos</Text>
            {activeAlerts.map(renderEmergencyCard)}
          </View>
        )}

        {/* Ações Rápidas */}
        {renderQuickActions()}

        {/* Status do Sistema */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Status do Sistema</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Sistema Operacional</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#FF9500' }]} />
              <Text style={styles.statusText}>Últimos 5 min: {activeAlerts.length} alertas</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  panicSection: {
    padding: 24,
    alignItems: 'center',
  },
  panicButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  panicContent: {
    alignItems: 'center',
  },
  panicText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  panicSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  alertsSection: {
    padding: 24,
    paddingTop: 0,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  alertType: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertDescription: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  alertInfo: {
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
  quickActions: {
    padding: 24,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statusSection: {
    padding: 24,
    paddingTop: 0,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
});