import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Navigation, 
  Eye, 
  Home, 
  Car,
  Activity,
  Heart,
  Phone,
  Zap,
  Users,
  Filter,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@shared/schema';
import { useHistory } from 'react-router-dom';

// Mock data for school regions
const SCHOOL_REGIONS = [
  {
    id: 'main_building',
    name: 'Prédio Principal',
    description: 'Salas de aula, direção e secretaria',
    color: '#007AFF',
    type: 'building',
    area: '1,200m²',
    capacity: '800 pessoas'
  },
  {
    id: 'sports_area',
    name: 'Área Esportiva',
    description: 'Quadras e área de educação física',
    color: '#34C759',
    type: 'sports',
    area: '800m²',
    capacity: '200 pessoas'
  },
  {
    id: 'parking',
    name: 'Estacionamento',
    description: 'Área de estacionamento para funcionários e visitantes',
    color: '#8E8E93',
    type: 'parking',
    area: '600m²',
    capacity: '50 vagas'
  },
  {
    id: 'library',
    name: 'Biblioteca',
    description: 'Centro de estudos e recursos educacionais',
    color: '#AF52DE',
    type: 'education',
    area: '400m²',
    capacity: '100 pessoas'
  },
  {
    id: 'cafeteria',
    name: 'Refeitório',
    description: 'Área de alimentação e convivência',
    color: '#FF9500',
    type: 'food',
    area: '300m²',
    capacity: '150 pessoas'
  }
];

// Mock data for points of interest
const POINTS_OF_INTEREST = [
  {
    id: 'entrance',
    name: 'Entrada Principal',
    description: 'Portão de entrada da escola com controle de acesso',
    icon: 'enter',
    color: '#007AFF',
    category: 'access',
    location: 'Rua Principal, 123'
  },
  {
    id: 'emergency_exit_1',
    name: 'Saída de Emergência - Norte',
    description: 'Saída exclusiva para emergências - lado norte',
    icon: 'exit',
    color: '#FF3B30',
    category: 'emergency',
    location: 'Lateral Norte do Prédio'
  },
  {
    id: 'emergency_exit_2',
    name: 'Saída de Emergência - Sul',
    description: 'Saída exclusiva para emergências - lado sul',
    icon: 'exit',
    color: '#FF3B30',
    category: 'emergency',
    location: 'Lateral Sul do Prédio'
  },
  {
    id: 'health_room',
    name: 'Enfermaria',
    description: 'Sala de primeiros socorros e atendimento médico',
    icon: 'medical',
    color: '#FF3B30',
    category: 'health',
    location: 'Térreo - Prédio Principal'
  },
  {
    id: 'fire_extinguisher_1',
    name: 'Extintor - Entrada',
    description: 'Extintor de incêndio localizado na entrada',
    icon: 'fire',
    color: '#FF3B30',
    category: 'safety',
    location: 'Hall de Entrada'
  },
  {
    id: 'fire_extinguisher_2',
    name: 'Extintor - Corredor A',
    description: 'Extintor de incêndio no corredor principal',
    icon: 'fire',
    color: '#FF3B30',
    category: 'safety',
    location: '1º Andar - Corredor A'
  },
  {
    id: 'camera_1',
    name: 'Câmera - Pátio',
    description: 'Sistema de monitoramento do pátio central',
    icon: 'camera',
    color: '#5856D6',
    category: 'security',
    location: 'Pátio Central'
  },
  {
    id: 'camera_2',
    name: 'Câmera - Entrada',
    description: 'Sistema de monitoramento da entrada principal',
    icon: 'camera',
    color: '#5856D6',
    category: 'security',
    location: 'Portão Principal'
  },
  {
    id: 'meeting_point',
    name: 'Ponto de Encontro',
    description: 'Local de concentração em caso de evacuação',
    icon: 'meeting',
    color: '#34C759',
    category: 'emergency',
    location: 'Pátio Principal'
  }
];

// Mock data for risk areas
const RISK_AREAS = [
  {
    id: 'construction_zone',
    name: 'Área em Construção',
    description: 'Área interditada por obras de reforma',
    severity: 'high' as const,
    type: 'construction',
    location: 'Ala Oeste - 2º Andar',
    restrictions: 'Acesso proibido para alunos e visitantes'
  },
  {
    id: 'wet_floor_area',
    name: 'Piso Molhado',
    description: 'Área com risco de escorregamento após limpeza',
    severity: 'medium' as const,
    type: 'slip',
    location: 'Corredor B - Térreo',
    restrictions: 'Cuidado ao caminhar'
  },
  {
    id: 'electrical_maintenance',
    name: 'Manutenção Elétrica',
    description: 'Quadro elétrico em manutenção',
    severity: 'high' as const,
    type: 'electrical',
    location: 'Subsolo - Sala Técnica',
    restrictions: 'Apenas técnicos autorizados'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: MapPin },
  { id: 'access', name: 'Acessos', icon: Navigation },
  { id: 'emergency', name: 'Emergência', icon: AlertTriangle },
  { id: 'health', name: 'Saúde', icon: Heart },
  { id: 'safety', name: 'Segurança', icon: Shield },
  { id: 'security', name: 'Vigilância', icon: Eye }
];

const SEVERITY_COLORS = {
  low: '#34C759',
  medium: '#FF9500',
  high: '#FF3B30'
};

const SEVERITY_LABELS = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto'
};

export default function SchoolMapPage() {
  const { hasPermission } = useAuth();
  const history = useHistory();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [selectedRiskArea, setSelectedRiskArea] = useState<string | null>(null);
  const [showRiskAreas, setShowRiskAreas] = useState(true);

  const filteredPOIs = selectedCategory === 'all' 
    ? POINTS_OF_INTEREST 
    : POINTS_OF_INTEREST.filter(poi => poi.category === selectedCategory);

  const getIconByType = (iconType: string) => {
    const iconMap: Record<string, any> = {
      enter: Navigation,
      exit: AlertTriangle,
      medical: Heart,
      fire: Zap,
      camera: Eye,
      meeting: Users
    };
    return iconMap[iconType] || MapPin;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-school-map-title">
          Mapa da Escola
        </h1>
        <p className="text-muted-foreground mt-1">
          Navegue pelos espaços e pontos de interesse da escola
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Legenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria de Pontos</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                    data-testid={`button-filter-${category.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Risk Areas Toggle */}
          {hasPermission([USER_ROLES.FUNCIONARIO, USER_ROLES.DIRECAO]) && (
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mostrar Áreas de Risco</label>
              <Button
                variant={showRiskAreas ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRiskAreas(!showRiskAreas)}
                data-testid="button-toggle-risk-areas"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {showRiskAreas ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Visualization Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Mock Map Container */}
          <Card className="h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Layout da Escola
              </CardTitle>
              <CardDescription>
                Clique nas regiões e pontos para ver detalhes
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <div className="relative w-full h-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">Mapa Interativo da Escola</p>
                  <p className="text-sm text-muted-foreground">
                    Em produção: Integração com Google Maps ou sistema de mapas interno
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Regions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Regiões da Escola
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCHOOL_REGIONS.map((region) => (
                  <Card 
                    key={region.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRegion === region.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                    data-testid={`card-region-${region.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: region.color }}
                        />
                        <CardTitle className="text-sm">{region.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">{region.description}</p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Área:</span> {region.area}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Capacidade:</span> {region.capacity}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Points of Interest and Risk Areas */}
        <div className="space-y-4">
          {/* Points of Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pontos de Interesse
              </CardTitle>
              <CardDescription>
                {filteredPOIs.length} ponto(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredPOIs.map((poi) => {
                const Icon = getIconByType(poi.icon);
                return (
                  <Card 
                    key={poi.id}
                    className={`cursor-pointer transition-all hover:shadow-sm ${
                      selectedPOI === poi.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPOI(selectedPOI === poi.id ? null : poi.id)}
                    data-testid={`card-poi-${poi.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${poi.color}20`, color: poi.color }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{poi.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{poi.description}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {poi.location}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          {/* Risk Areas - Only for staff and admin */}
          {hasPermission([USER_ROLES.FUNCIONARIO, USER_ROLES.DIRECAO]) && showRiskAreas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Áreas de Risco
                </CardTitle>
                <CardDescription>
                  {RISK_AREAS.length} área(s) identificada(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                {RISK_AREAS.map((area) => (
                  <Card 
                    key={area.id}
                    className={`cursor-pointer transition-all hover:shadow-sm border-l-4 ${
                      selectedRiskArea === area.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ borderLeftColor: SEVERITY_COLORS[area.severity] }}
                    onClick={() => setSelectedRiskArea(selectedRiskArea === area.id ? null : area.id)}
                    data-testid={`card-risk-${area.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{area.name}</h4>
                            <Badge 
                              variant="outline"
                              style={{ 
                                color: SEVERITY_COLORS[area.severity],
                                borderColor: SEVERITY_COLORS[area.severity]
                              }}
                            >
                              {SEVERITY_LABELS[area.severity]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{area.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {area.location}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {area.restrictions}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => history.push('/emergency')}
                data-testid="button-emergency-procedures"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Procedimentos de Emergência
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => history.push('/contacts')}
                data-testid="button-contact-security"
              >
                <Phone className="h-4 w-4 mr-2" />
                Contatar Segurança
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => history.push('/reports')}
                data-testid="button-report-issue"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Reportar Problema no Local
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Tipos de Região</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#007AFF' }} />
                  Prédios/Administrativo
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#34C759' }} />
                  Esportes/Recreação
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF9500' }} />
                  Alimentação/Convivência
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8E8E93' }} />
                  Estacionamento/Acesso
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Nível de Risco</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: SEVERITY_COLORS.low }} />
                  Baixo Risco
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: SEVERITY_COLORS.medium }} />
                  Médio Risco
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: SEVERITY_COLORS.high }} />
                  Alto Risco
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Pontos de Emergência</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Heart className="h-3 w-3 text-red-500" />
                  Primeiros Socorros
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  Saídas de Emergência
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-3 w-3 text-green-500" />
                  Pontos de Encontro
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Segurança</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Eye className="h-3 w-3 text-blue-500" />
                  Câmeras de Segurança
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="h-3 w-3 text-red-500" />
                  Equipamentos de Segurança
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Navigation className="h-3 w-3 text-blue-500" />
                  Acessos Controlados
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}