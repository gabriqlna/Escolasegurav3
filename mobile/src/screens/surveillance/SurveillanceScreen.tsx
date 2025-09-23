import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const chartWidth = width - 32;

interface SurveillanceStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  criticalIncidents: number;
  activeVisitors: number;
  emergencyAlerts: number;
  lastWeekReports: number;
  averageResolutionTime: number;
}

interface ChartData {
  labels: string[];
  datasets: { data: number[] }[];
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  changeColor,
  onPress
}: { 
  title: string; 
  value: number | string; 
  change?: string;
  icon: string; 
  color: string;
  changeColor?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.statCard, { borderLeftColor: color }]} 
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.statContent}>
      <View style={styles.statHeader}>
        <Text style={styles.statValue}>{value}</Text>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {change && (
        <Text style={[styles.statChange, { color: changeColor || '#8E8E93' }]}>
          {change}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

const ChartCard = ({ 
  title, 
  chart, 
  onExport
}: { 
  title: string; 
  chart: React.ReactNode;
  onExport?: () => void;
}) => (
  <View style={styles.chartCard}>
    <View style={styles.chartHeader}>
      <Text style={styles.chartTitle}>{title}</Text>
      {onExport && (
        <TouchableOpacity onPress={onExport} style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.chartContainer}>
      {chart}
    </View>
  </View>
);

export default function SurveillanceScreen() {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState<SurveillanceStats>({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    criticalIncidents: 0,
    activeVisitors: 0,
    emergencyAlerts: 0,
    lastWeekReports: 0,
    averageResolutionTime: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const canViewSurveillance = hasPermission('view_surveillance');
  const canExportReports = hasPermission('export_reports');

  // Mock data - substituir por chamadas de API reais
  useEffect(() => {
    loadSurveillanceData();
  }, [selectedPeriod]);

  const loadSurveillanceData = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data baseado no período selecionado
      const mockStats: SurveillanceStats = {
        totalReports: selectedPeriod === 'week' ? 12 : selectedPeriod === 'month' ? 45 : 180,
        resolvedReports: selectedPeriod === 'week' ? 8 : selectedPeriod === 'month' ? 32 : 156,
        pendingReports: selectedPeriod === 'week' ? 4 : selectedPeriod === 'month' ? 13 : 24,
        criticalIncidents: selectedPeriod === 'week' ? 2 : selectedPeriod === 'month' ? 5 : 18,
        activeVisitors: 7,
        emergencyAlerts: selectedPeriod === 'week' ? 1 : selectedPeriod === 'month' ? 3 : 8,
        lastWeekReports: 12,
        averageResolutionTime: selectedPeriod === 'week' ? 2.5 : selectedPeriod === 'month' ? 3.2 : 2.8,
      };
      
      setStats(mockStats);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados de vigilância');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSurveillanceData();
    setRefreshing(false);
  };

  // Dados para gráficos
  const weeklyReportsData: ChartData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [2, 3, 1, 4, 2, 0, 0]
      }
    ]
  };

  const monthlyIncidentsData: ChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [15, 18, 12, 20, 16, 14]
      }
    ]
  };

  const reportTypeData = [
    {
      name: 'Bullying',
      population: 35,
      color: '#FF3B30',
      legendFontColor: '#1C1C1E',
      legendFontSize: 12,
    },
    {
      name: 'Infraestrutura',
      population: 25,
      color: '#FF9500',
      legendFontColor: '#1C1C1E',
      legendFontSize: 12,
    },
    {
      name: 'Segurança',
      population: 20,
      color: '#007AFF',
      legendFontColor: '#1C1C1E',
      legendFontSize: 12,
    },
    {
      name: 'Outros',
      population: 20,
      color: '#8E8E93',
      legendFontColor: '#1C1C1E',
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(28, 28, 30, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#007AFF'
    }
  };

  const handleExportReport = (reportType: string) => {
    Alert.alert(
      'Exportar Relatório',
      `Deseja exportar o relatório de ${reportType}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'PDF', 
          onPress: () => Alert.alert('Sucesso', 'Relatório PDF gerado com sucesso!') 
        },
        { 
          text: 'Excel', 
          onPress: () => Alert.alert('Sucesso', 'Relatório Excel gerado com sucesso!') 
        },
      ]
    );
  };

  if (!canViewSurveillance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noPermissionContainer}>
          <Ionicons name="lock-closed" size={64} color="#C7C7CC" />
          <Text style={styles.noPermissionTitle}>Acesso Restrito</Text>
          <Text style={styles.noPermissionSubtitle}>
            Você não tem permissão para acessar o painel de vigilância.
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
          <Text style={styles.title}>📊 Painel de Vigilância</Text>
          <Text style={styles.subtitle}>
            Estatísticas e relatórios de segurança
          </Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mês' },
            { key: 'year', label: 'Ano' },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
              data-testid={`period-${period.key}`}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Statistics */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total de Denúncias"
            value={stats.totalReports}
            change={`+${Math.round((stats.totalReports - stats.lastWeekReports) / stats.lastWeekReports * 100)}% vs período anterior`}
            changeColor={stats.totalReports > stats.lastWeekReports ? '#FF9500' : '#34C759'}
            icon="document-text"
            color="#007AFF"
          />
          
          <StatCard
            title="Denúncias Resolvidas"
            value={stats.resolvedReports}
            change={`${Math.round(stats.resolvedReports / stats.totalReports * 100)}% do total`}
            changeColor="#34C759"
            icon="checkmark-circle"
            color="#34C759"
          />
          
          <StatCard
            title="Pendentes"
            value={stats.pendingReports}
            change={`${Math.round(stats.pendingReports / stats.totalReports * 100)}% do total`}
            changeColor="#FF9500"
            icon="hourglass"
            color="#FF9500"
          />
          
          <StatCard
            title="Incidentes Críticos"
            value={stats.criticalIncidents}
            change={stats.criticalIncidents > 0 ? "Requer atenção" : "Situação normal"}
            changeColor={stats.criticalIncidents > 0 ? "#FF3B30" : "#34C759"}
            icon="warning"
            color="#FF3B30"
          />
          
          <StatCard
            title="Visitantes Ativos"
            value={stats.activeVisitors}
            change="Agora na escola"
            changeColor="#8E8E93"
            icon="people"
            color="#AF52DE"
          />
          
          <StatCard
            title="Tempo Médio Resolução"
            value={`${stats.averageResolutionTime}h`}
            change="Tempo para resolver denúncias"
            changeColor="#8E8E93"
            icon="time"
            color="#34C759"
          />
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <ChartCard
            title="📈 Denúncias por Dia (Última Semana)"
            onExport={canExportReports ? () => handleExportReport('Denúncias Semanais') : undefined}
            chart={
              <LineChart
                data={weeklyReportsData}
                width={chartWidth - 32}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            }
          />

          <ChartCard
            title="📊 Incidentes por Mês"
            onExport={canExportReports ? () => handleExportReport('Incidentes Mensais') : undefined}
            chart={
              <BarChart
                data={monthlyIncidentsData}
                width={chartWidth - 32}
                height={200}
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                style={styles.chart}
              />
            }
          />

          <ChartCard
            title="🥧 Tipos de Denúncias"
            onExport={canExportReports ? () => handleExportReport('Tipos de Denúncias') : undefined}
            chart={
              <PieChart
                data={reportTypeData}
                width={chartWidth - 32}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            }
          />
        </View>

        {/* Performance Indicators */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>🎯 Indicadores de Performance</Text>
          
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Taxa de Resolução</Text>
              <View style={styles.performanceBar}>
                <View style={[
                  styles.performanceProgress, 
                  { width: `${(stats.resolvedReports / stats.totalReports) * 100}%` }
                ]} />
              </View>
              <Text style={styles.performanceValue}>
                {Math.round((stats.resolvedReports / stats.totalReports) * 100)}%
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Tempo Médio Resposta</Text>
              <View style={styles.performanceBar}>
                <View style={[
                  styles.performanceProgress, 
                  { width: '75%', backgroundColor: '#34C759' }
                ]} />
              </View>
              <Text style={styles.performanceValue}>Bom</Text>
            </View>

            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Satisfação Usuários</Text>
              <View style={styles.performanceBar}>
                <View style={[
                  styles.performanceProgress, 
                  { width: '88%', backgroundColor: '#007AFF' }
                ]} />
              </View>
              <Text style={styles.performanceValue}>88%</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        {canExportReports && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleExportReport('Relatório Completo')}
                data-testid="export-full-report"
              >
                <Ionicons name="document-text" size={24} color="#007AFF" />
                <Text style={styles.actionButtonText}>Relatório Completo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleExportReport('Relatório de Emergências')}
                data-testid="export-emergency-report"
              >
                <Ionicons name="warning" size={24} color="#FF3B30" />
                <Text style={styles.actionButtonText}>Emergências</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Em breve', 'Configuração de alertas em desenvolvimento')}
                data-testid="configure-alerts"
              >
                <Ionicons name="notifications" size={24} color="#FF9500" />
                <Text style={styles.actionButtonText}>Configurar Alertas</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Em breve', 'Análise avançada em desenvolvimento')}
                data-testid="advanced-analytics"
              >
                <Ionicons name="analytics" size={24} color="#AF52DE" />
                <Text style={styles.actionButtonText}>Análise Avançada</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    paddingHorizontal: 16,
  },
  statCard: {
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
  statContent: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  chartsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  chartCard: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  performanceSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  performanceBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 8,
  },
  performanceProgress: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'right',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
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
  actionButtonText: {
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