import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLE_LABELS } from '@/constants/permissions';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2 - 8;

interface QuickActionCard {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  permissions: string[];
}

const quickActions: QuickActionCard[] = [
  {
    title: 'Denúncia',
    subtitle: 'Reportar incidente',
    icon: 'alert-circle',
    color: '#FF9500',
    route: '/(main)/reports',
    permissions: ['create_report'],
  },
  {
    title: 'Emergência',
    subtitle: 'Alertas urgentes',
    icon: 'warning',
    color: '#FF3B30',
    route: '/(main)/emergency',
    permissions: ['view_emergency_info'],
  },
  {
    title: 'Visitantes',
    subtitle: 'Gerenciar visitas',
    icon: 'people',
    color: '#007AFF',
    route: '/(main)/visitors',
    permissions: ['manage_visitors'],
  },
  {
    title: 'Campanhas',
    subtitle: 'Educação e prevenção',
    icon: 'book',
    color: '#34C759',
    route: '/(main)/campaigns',
    permissions: ['view_campaigns'],
  },
  {
    title: 'Checklist',
    subtitle: 'Verificações de segurança',
    icon: 'checkmark-circle',
    color: '#5856D6',
    route: '/(main)/checklist',
    permissions: ['view_checklist'],
  },
  {
    title: 'Simulados',
    subtitle: 'Exercícios de evacuação',
    icon: 'calendar',
    color: '#AF52DE',
    route: '/(main)/drills',
    permissions: ['view_checklist'],
  },
];

export default function DashboardScreen() {
  const { user, hasPermission, signOut } = useAuth();

  const filteredActions = quickActions.filter(action =>
    hasPermission(action.permissions)
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const StatCard = ({ title, value, subtitle, color }: {
    title: string;
    value: string;
    subtitle: string;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIndicator, { backgroundColor: color }]} />
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const ActionCard = ({ action }: { action: QuickActionCard }) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={() => router.push(action.route as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name}!</Text>
            <Text style={styles.roleLabel}>
              {USER_ROLE_LABELS[user?.role || 'aluno']}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Resumo de Hoje</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Denúncias"
              value="3"
              subtitle="Pendentes"
              color="#FF9500"
            />
            <StatCard
              title="Visitantes"
              value="12"
              subtitle="Ativos"
              color="#007AFF"
            />
            <StatCard
              title="Checklist"
              value="85%"
              subtitle="Completo"
              color="#34C759"
            />
            <StatCard
              title="Sistema"
              value="OK"
              subtitle="Operacional"
              color="#00C7BE"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            {filteredActions.map((action, index) => (
              <ActionCard key={index} action={action} />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#FF9500' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Nova denúncia registrada</Text>
                <Text style={styles.activityTime}>2 minutos atrás</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#007AFF' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Visitante fez check-in</Text>
                <Text style={styles.activityTime}>15 minutos atrás</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#34C759' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Checklist completado</Text>
                <Text style={styles.activityTime}>1 hora atrás</Text>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  roleLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  statsContainer: {
    padding: 24,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: cardWidth,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  actionsContainer: {
    padding: 24,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: cardWidth,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
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
  activityContainer: {
    padding: 24,
    paddingTop: 0,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
});