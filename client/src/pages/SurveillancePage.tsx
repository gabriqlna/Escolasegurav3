import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@shared/schema";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import { format as formatDate, subDays, subMonths, subYears, isAfter, isBefore, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Download,
  RefreshCw,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SurveillanceStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  criticalIncidents: number;
  activeVisitors: number;
  emergencyAlerts: number;
  lastWeekReports: number;
  averageResolutionTime: number;
  resolutionRate: number;
  userSatisfaction: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

interface IncidentTypeData {
  type: string;
  count: number;
  color: string;
}

type Period = "week" | "month" | "year";

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  trend,
  onClick
}: { 
  title: string; 
  value: number | string; 
  change?: string;
  icon: any; 
  color: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}) => (
  <Card 
    className={`transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
    data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
          <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}>
            {change}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

const PerformanceIndicator = ({ 
  label, 
  value, 
  percentage, 
  color 
}: { 
  label: string; 
  value: string; 
  percentage: number; 
  color: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
    <Progress value={percentage} className="h-2" />
  </div>
);

export default function SurveillancePage() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");
  const [refreshing, setRefreshing] = useState(false);

  // Permission check
  const canViewSurveillance = hasPermission([USER_ROLES.FUNCIONARIO, USER_ROLES.DIRECAO]);

  // Fetch surveillance data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<SurveillanceStats>({
    queryKey: ["surveillance-stats", selectedPeriod],
    queryFn: async () => {
      // This would normally fetch real data from Firebase
      // For now, using mock data that varies by period
      const mockStats: SurveillanceStats = {
        totalReports: selectedPeriod === 'week' ? 12 : selectedPeriod === 'month' ? 45 : 180,
        resolvedReports: selectedPeriod === 'week' ? 8 : selectedPeriod === 'month' ? 32 : 156,
        pendingReports: selectedPeriod === 'week' ? 4 : selectedPeriod === 'month' ? 13 : 24,
        criticalIncidents: selectedPeriod === 'week' ? 2 : selectedPeriod === 'month' ? 5 : 18,
        activeVisitors: 7,
        emergencyAlerts: selectedPeriod === 'week' ? 1 : selectedPeriod === 'month' ? 3 : 8,
        lastWeekReports: 12,
        averageResolutionTime: selectedPeriod === 'week' ? 2.5 : selectedPeriod === 'month' ? 3.2 : 2.8,
        resolutionRate: selectedPeriod === 'week' ? 85 : selectedPeriod === 'month' ? 78 : 82,
        userSatisfaction: selectedPeriod === 'week' ? 92 : selectedPeriod === 'month' ? 88 : 85
      };
      
      return mockStats;
    },
    enabled: canViewSurveillance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock chart data based on period
  const getChartData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = formatDate(subDays(new Date(), i), 'dd/MM');
      const value = Math.floor(Math.random() * 10) + 1;
      data.push({ date, value });
    }
    
    return data;
  };

  const getIncidentTypes = (): IncidentTypeData[] => [
    { type: "Comportamento", count: 18, color: "bg-blue-500" },
    { type: "Visitantes", count: 12, color: "bg-green-500" },
    { type: "Infraestrutura", count: 8, color: "bg-yellow-500" },
    { type: "Emergência", count: 5, color: "bg-red-500" },
    { type: "Outros", count: 3, color: "bg-purple-500" }
  ];

  const chartData = getChartData();
  const incidentTypes = getIncidentTypes();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchStats();
      toast({
        title: "Dados atualizados",
        description: "Informações do painel foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Falha ao carregar os dados mais recentes.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      // Create export data
      const exportData = {
        period: selectedPeriod,
        dateRange: selectedPeriod === 'week' ? 'Última semana' : selectedPeriod === 'month' ? 'Último mês' : 'Último ano',
        generatedAt: new Date().toISOString(),
        stats: stats || {},
        chartData: chartData || [],
        incidentTypes: incidentTypes || []
      };

      if (format === 'excel') {
        // Create CSV format for Excel compatibility
        const csvData = [
          ['Estatísticas de Vigilância'],
          ['Período', exportData.dateRange],
          ['Gerado em', formatDate(new Date(), 'dd/MM/yyyy HH:mm')],
          [''],
          ['Métrica', 'Valor'],
          ['Total de Denúncias', stats?.totalReports?.toString() || '0'],
          ['Denúncias Resolvidas', stats?.resolvedReports?.toString() || '0'],
          ['Denúncias Pendentes', stats?.pendingReports?.toString() || '0'],
          ['Incidentes Críticos', stats?.criticalIncidents?.toString() || '0'],
          ['Visitantes Ativos', stats?.activeVisitors?.toString() || '0'],
          ['Taxa de Resolução (%)', stats?.resolutionRate?.toString() || '0'],
          ['Tempo Médio Resolução (h)', stats?.averageResolutionTime?.toString() || '0'],
          [''],
          ['Tipos de Incidentes'],
          ['Tipo', 'Quantidade'],
          ...incidentTypes.map(item => [item.type, item.count.toString()])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `vigilancia-${selectedPeriod}-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
      } else {
        // For PDF, create a simple text export (real PDF would need jsPDF)
        const textData = [
          'RELATÓRIO DE VIGILÂNCIA',
          '========================',
          '',
          `Período: ${exportData.dateRange}`,
          `Gerado em: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`,
          '',
          'ESTATÍSTICAS PRINCIPAIS:',
          `-Total de Denúncias: ${stats?.totalReports || 0}`,
          `-Denúncias Resolvidas: ${stats?.resolvedReports || 0}`,
          `-Denúncias Pendentes: ${stats?.pendingReports || 0}`,
          `-Incidentes Críticos: ${stats?.criticalIncidents || 0}`,
          `-Visitantes Ativos: ${stats?.activeVisitors || 0}`,
          `-Taxa de Resolução: ${stats?.resolutionRate || 0}%`,
          `-Tempo Médio Resolução: ${stats?.averageResolutionTime || 0}h`,
          '',
          'TIPOS DE INCIDENTES:',
          ...incidentTypes.map(item => `-${item.type}: ${item.count}`),
        ].join('\n');
        
        const blob = new Blob([textData], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `vigilancia-${selectedPeriod}-${formatDate(new Date(), 'yyyy-MM-dd')}.txt`;
        link.click();
      }

      toast({
        title: "Exportação concluída",
        description: `Relatório exportado em formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro na exportação",
        description: "Falha ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!canViewSurveillance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar o painel de vigilância.
          </p>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-surveillance-title">
            📊 Painel de Vigilância
          </h1>
          <p className="text-muted-foreground">
            Estatísticas e relatórios de segurança em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Denúncias"
          value={stats?.totalReports || 0}
          change="+12% vs período anterior"
          icon={Shield}
          color="text-blue-600"
          trend="up"
        />
        
        <StatCard
          title="Resolvidas"
          value={stats?.resolvedReports || 0}
          change={`${Math.round(((stats?.resolvedReports || 0) / (stats?.totalReports || 1)) * 100)}% taxa resolução`}
          icon={CheckCircle}
          color="text-green-600"
          trend="up"
        />
        
        <StatCard
          title="Pendentes"
          value={stats?.pendingReports || 0}
          change="-8% vs período anterior"
          icon={Clock}
          color="text-yellow-600"
          trend="down"
        />
        
        <StatCard
          title="Críticos"
          value={stats?.criticalIncidents || 0}
          change="Requer atenção imediata"
          icon={AlertTriangle}
          color="text-red-600"
          trend="neutral"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Visitantes Ativos"
          value={stats?.activeVisitors || 0}
          change="Em tempo real"
          icon={Users}
          color="text-purple-600"
          trend="neutral"
        />
        
        <StatCard
          title="Alertas de Emergência"
          value={stats?.emergencyAlerts || 0}
          change="Últimas 24h"
          icon={XCircle}
          color="text-red-600"
          trend="neutral"
        />
        
        <StatCard
          title="Tempo Médio Resolução"
          value={`${stats?.averageResolutionTime || 0}h`}
          change="Abaixo da meta (4h)"
          icon={Activity}
          color="text-green-600"
          trend="down"
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts" data-testid="tab-charts">Gráficos</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Denúncias por Dia
                </CardTitle>
                <CardDescription>
                  Tendência de denúncias nos últimos {selectedPeriod === 'week' ? '7 dias' : selectedPeriod === 'month' ? '30 dias' : '12 meses'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 p-4">
                  {/* Simple SVG Line Chart */}
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line
                        key={i}
                        x1="0"
                        y1={40 * i}
                        x2="400"
                        y2={40 * i}
                        stroke="#e5e7eb"
                        strokeWidth={0.5}
                      />
                    ))}
                    
                    {/* Sample data line */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      points={chartData.map((point, index) => 
                        `${(index / (chartData.length - 1)) * 400},${180 - (point.value * 15)}`
                      ).join(' ')}
                    />
                    
                    {/* Data points */}
                    {chartData.map((point, index) => (
                      <circle
                        key={index}
                        cx={(index / (chartData.length - 1)) * 400}
                        cy={180 - (point.value * 15)}
                        r="4"
                        fill="#3b82f6"
                      />
                    ))}
                    
                    {/* X-axis labels */}
                    {chartData.slice(0, 7).map((point, index) => (
                      <text
                        key={index}
                        x={(index / 6) * 400}
                        y="195"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {point.date}
                      </text>
                    ))}
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Tipos de Incidentes
                </CardTitle>
                <CardDescription>
                  Distribuição por categoria de incidente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidentTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                        <span className="text-sm">{type.type}</span>
                      </div>
                      <span className="text-sm font-medium">{type.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Incidentes por Mês
              </CardTitle>
              <CardDescription>
                Comparativo mensal de incidentes registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Gráfico de barras seria renderizado aqui</p>
                  <p className="text-xs text-muted-foreground">
                    Comparativo últimos 12 meses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📈 Indicadores de Performance</CardTitle>
              <CardDescription>
                Métricas de eficiência e qualidade do sistema de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PerformanceIndicator
                label="Taxa de Resolução"
                value={`${stats?.resolutionRate || 0}%`}
                percentage={stats?.resolutionRate || 0}
                color="blue"
              />
              
              <PerformanceIndicator
                label="Tempo Médio Resposta"
                value="Bom"
                percentage={75}
                color="green"
              />
              
              <PerformanceIndicator
                label="Satisfação Usuários"
                value={`${stats?.userSatisfaction || 0}%`}
                percentage={stats?.userSatisfaction || 0}
                color="blue"
              />
              
              <PerformanceIndicator
                label="Eficiência Preventiva"
                value="85%"
                percentage={85}
                color="green"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>⚡ Ações Rápidas</CardTitle>
              <CardDescription>
                Exportação de relatórios e análises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  data-testid="button-export-pdf"
                >
                  <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
                  Relatório PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                  data-testid="button-export-excel"
                >
                  <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
                  Planilha Excel
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => toast({ title: "Em breve", description: "Relatório de emergências em desenvolvimento" })}
                  data-testid="button-emergency-report"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergências
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => toast({ title: "Em breve", description: "Análise avançada em desenvolvimento" })}
                  data-testid="button-advanced-analytics"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Análise Avançada
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Atividade Recente</CardTitle>
              <CardDescription>
                Últimos eventos e ocorrências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "14:30", type: "Resolução", description: "Incidente #45 resolvido - Visitante não autorizado", status: "success" },
                  { time: "13:15", type: "Alerta", description: "Novo visitante registrado - João Silva", status: "info" },
                  { time: "12:45", type: "Denúncia", description: "Nova denúncia de comportamento inadequado", status: "warning" },
                  { time: "11:20", type: "Crítico", description: "Alerta de emergência - Evacuação parcial", status: "error" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{activity.type}</span>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert for critical incidents */}
      {(stats?.criticalIncidents || 0) > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-200">
            Incidentes Críticos Detectados
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            Existem {stats?.criticalIncidents} incidentes críticos que requerem atenção imediata.
            Verifique a seção de denúncias para mais detalhes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}