import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '@/contexts/AuthContext';
import { RiskArea } from '@/types';

const { width, height } = Dimensions.get('window');

const SCHOOL_REGIONS = [
  {
    id: 'main_building',
    name: 'Prédio Principal',
    description: 'Salas de aula, direção e secretaria',
    coordinates: [
      { latitude: -23.55052, longitude: -46.633308 },
      { latitude: -23.550720, longitude: -46.633108 },
      { latitude: -23.550920, longitude: -46.633308 },
      { latitude: -23.550720, longitude: -46.633508 },
    ],
    color: '#007AFF',
    type: 'building'
  },
  {
    id: 'sports_area',
    name: 'Área Esportiva',
    description: 'Quadras e área de educação física',
    coordinates: [
      { latitude: -23.551020, longitude: -46.633108 },
      { latitude: -23.551220, longitude: -46.632908 },
      { latitude: -23.551420, longitude: -46.633108 },
      { latitude: -23.551220, longitude: -46.633308 },
    ],
    color: '#34C759',
    type: 'sports'
  },
  {
    id: 'parking',
    name: 'Estacionamento',
    description: 'Área de estacionamento para funcionários',
    coordinates: [
      { latitude: -23.550520, longitude: -46.632908 },
      { latitude: -23.550720, longitude: -46.632708 },
      { latitude: -23.550920, longitude: -46.632908 },
      { latitude: -23.550720, longitude: -46.633108 },
    ],
    color: '#8E8E93',
    type: 'parking'
  },
];

const POINTS_OF_INTEREST = [
  {
    id: 'entrance',
    name: 'Entrada Principal',
    description: 'Portão de entrada da escola',
    coordinate: { latitude: -23.55042, longitude: -46.633308 },
    icon: 'enter',
    color: '#007AFF',
    category: 'access'
  },
  {
    id: 'emergency_exit',
    name: 'Saída de Emergência',
    description: 'Saída exclusiva para emergências',
    coordinate: { latitude: -23.55102, longitude: -46.633508 },
    icon: 'exit',
    color: '#FF3B30',
    category: 'emergency'
  },
  {
    id: 'health_room',
    name: 'Enfermaria',
    description: 'Sala de primeiros socorros',
    coordinate: { latitude: -23.55062, longitude: -46.633208 },
    icon: 'medical',
    color: '#34C759',
    category: 'health'
  },
  {
    id: 'fire_extinguisher_1',
    name: 'Extintor 1',
    description: 'Extintor de incêndio - Prédio Principal',
    coordinate: { latitude: -23.55052, longitude: -46.633258 },
    icon: 'flame',
    color: '#FF9500',
    category: 'safety'
  },
  {
    id: 'assembly_point',
    name: 'Ponto de Encontro',
    description: 'Local de reunião em emergências',
    coordinate: { latitude: -23.55082, longitude: -46.632908 },
    icon: 'people',
    color: '#AF52DE',
    category: 'emergency'
  },
  {
    id: 'security_camera_1',
    name: 'Câmera de Segurança',
    description: 'Sistema de monitoramento',
    coordinate: { latitude: -23.55072, longitude: -46.633358 },
    icon: 'videocam',
    color: '#007AFF',
    category: 'security'
  },
];

const RISK_AREAS: RiskArea[] = [
  {
    id: 'electrical_room',
    name: 'Sala Elétrica',
    description: 'Área com equipamentos elétricos de alta voltagem',
    location: 'Subsolo do Prédio Principal',
    riskLevel: 'high',
    riskType: 'electrical',
    coordinates: { latitude: -23.55072, longitude: -46.633408 },
    precautions: [
      'Acesso restrito a pessoal autorizado',
      'Uso obrigatório de EPIs',
      'Verificação de equipamentos desligados'
    ],
    emergencyProcedures: [
      'Desligue a energia geral',
      'Evacue a área imediatamente',
      'Acione o Corpo de Bombeiros'
    ],
    isActive: true,
    identifiedBy: 'admin',
    identifiedAt: new Date(),
  },
  {
    id: 'construction_area',
    name: 'Área em Construção',
    description: 'Local de obras e reformas',
    location: 'Lateral do Prédio Principal',
    riskLevel: 'medium',
    riskType: 'structural',
    coordinates: { latitude: -23.55092, longitude: -46.633158 },
    precautions: [
      'Uso obrigatório de capacete',
      'Área isolada durante obras',
      'Supervisão constante'
    ],
    emergencyProcedures: [
      'Evacue a área',
      'Acione equipe de segurança',
      'Isole completamente o local'
    ],
    isActive: true,
    identifiedBy: 'admin',
    identifiedAt: new Date(),
  },
];

const POI_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: 'apps', color: '#8E8E93' },
  { id: 'access', label: 'Acesso', icon: 'enter', color: '#007AFF' },
  { id: 'emergency', label: 'Emergência', icon: 'warning', color: '#FF3B30' },
  { id: 'health', label: 'Saúde', icon: 'medical', color: '#34C759' },
  { id: 'safety', label: 'Segurança', icon: 'shield', color: '#FF9500' },
  { id: 'security', label: 'Vigilância', icon: 'eye', color: '#007AFF' },
];

export default function SchoolMapScreen() {
  const { user, hasPermission } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  const [selectedRiskArea, setSelectedRiskArea] = useState<RiskArea | null>(null);
  const [showRiskAreas, setShowRiskAreas] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [riskModalVisible, setRiskModalVisible] = useState(false);

  const canViewRiskAreas = hasPermission('view_risk_areas');
  const canManageMap = hasPermission('manage_map');

  // Coordenadas centrais da escola
  const schoolCenter = {
    latitude: -23.55072,
    longitude: -46.633208,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  const filteredPOIs = selectedCategory === 'all' 
    ? POINTS_OF_INTEREST 
    : POINTS_OF_INTEREST.filter(poi => poi.category === selectedCategory);

  const handlePOIPress = (poi: any) => {
    setSelectedPOI(poi);
    setModalVisible(true);
  };

  const handleRiskAreaPress = (riskArea: RiskArea) => {
    setSelectedRiskArea(riskArea);
    setRiskModalVisible(true);
  };

  const centerOnPOI = (poi: any) => {
    mapRef.current?.animateToRegion({
      ...poi.coordinate,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    }, 1000);
    setModalVisible(false);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#34C759';
      case 'medium': return '#FF9500';
      case 'high': return '#FF3B30';
      case 'critical': return '#8B0000';
      default: return '#8E8E93';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
    }
  };

  const renderPOIModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setModalVisible(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Ponto de Interesse</Text>
          <TouchableOpacity 
            onPress={() => selectedPOI && centerOnPOI(selectedPOI)}
            style={styles.modalActionButton}
          >
            <Ionicons name="location" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {selectedPOI && (
          <ScrollView style={styles.modalContent}>
            <View style={[styles.poiIcon, { backgroundColor: selectedPOI.color }]}>
              <Ionicons name={selectedPOI.icon} size={32} color="#FFFFFF" />
            </View>
            
            <Text style={styles.poiDetailTitle}>{selectedPOI.name}</Text>
            <Text style={styles.poiDetailDescription}>{selectedPOI.description}</Text>
            
            <View style={styles.poiDetailInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#8E8E93" />
                <Text style={styles.infoText}>
                  {selectedPOI.coordinate.latitude.toFixed(6)}, {selectedPOI.coordinate.longitude.toFixed(6)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="bookmark-outline" size={20} color="#8E8E93" />
                <Text style={styles.infoText}>
                  {POI_CATEGORIES.find(cat => cat.id === selectedPOI.category)?.label || 'Categoria'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.navigationButton}
              onPress={() => centerOnPOI(selectedPOI)}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.navigationButtonText}>Navegar até aqui</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderRiskAreaModal = () => (
    <Modal
      visible={riskModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setRiskModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setRiskModalVisible(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Área de Risco</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedRiskArea && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.riskHeader}>
              <View style={[
                styles.riskLevelBadge, 
                { backgroundColor: getRiskLevelColor(selectedRiskArea.riskLevel) }
              ]}>
                <Text style={styles.riskLevelText}>
                  Risco {getRiskLevelLabel(selectedRiskArea.riskLevel)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.riskDetailTitle}>{selectedRiskArea.name}</Text>
            <Text style={styles.riskDetailDescription}>{selectedRiskArea.description}</Text>
            <Text style={styles.riskDetailLocation}>{selectedRiskArea.location}</Text>
            
            <View style={styles.riskSection}>
              <Text style={styles.riskSectionTitle}>⚠️ Precauções</Text>
              {selectedRiskArea.precautions.map((precaution, index) => (
                <View key={index} style={styles.riskItem}>
                  <Text style={styles.riskItemText}>• {precaution}</Text>
                </View>
              ))}
            </View>

            <View style={styles.riskSection}>
              <Text style={styles.riskSectionTitle}>🚨 Procedimentos de Emergência</Text>
              {selectedRiskArea.emergencyProcedures.map((procedure, index) => (
                <View key={index} style={styles.riskItem}>
                  <Text style={styles.riskItemText}>{index + 1}. {procedure}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Mapa da Escola</Text>
        <Text style={styles.subtitle}>Navegação e pontos de interesse</Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {POI_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
            data-testid={`category-${category.id}`}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.id ? '#FFFFFF' : category.color}
              style={styles.categoryChipIcon}
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        {canViewRiskAreas && (
          <TouchableOpacity
            style={[styles.controlButton, showRiskAreas && styles.controlButtonActive]}
            onPress={() => setShowRiskAreas(!showRiskAreas)}
            data-testid="toggle-risk-areas"
          >
            <Ionicons 
              name={showRiskAreas ? "warning" : "warning-outline"} 
              size={20} 
              color={showRiskAreas ? "#FFFFFF" : "#FF3B30"} 
            />
            <Text style={[
              styles.controlButtonText,
              showRiskAreas && styles.controlButtonTextActive
            ]}>
              Áreas de Risco
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={schoolCenter}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          data-testid="school-map"
        >
          {/* School Regions */}
          {SCHOOL_REGIONS.map((region) => (
            <Polygon
              key={region.id}
              coordinates={region.coordinates}
              strokeColor={region.color}
              fillColor={`${region.color}20`}
              strokeWidth={2}
            />
          ))}

          {/* Points of Interest */}
          {filteredPOIs.map((poi) => (
            <Marker
              key={poi.id}
              coordinate={poi.coordinate}
              onPress={() => handlePOIPress(poi)}
              data-testid={`marker-${poi.id}`}
            >
              <View style={[styles.markerContainer, { backgroundColor: poi.color }]}>
                <Ionicons name={poi.icon as any} size={20} color="#FFFFFF" />
              </View>
            </Marker>
          ))}

          {/* Risk Areas */}
          {showRiskAreas && canViewRiskAreas && RISK_AREAS.map((riskArea) => (
            <Marker
              key={riskArea.id}
              coordinate={riskArea.coordinates!}
              onPress={() => handleRiskAreaPress(riskArea)}
              data-testid={`risk-marker-${riskArea.id}`}
            >
              <View style={[
                styles.riskMarkerContainer, 
                { backgroundColor: getRiskLevelColor(riskArea.riskLevel) }
              ]}>
                <Ionicons name="warning" size={16} color="#FFFFFF" />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Map Legend */}
        <View style={styles.legend}>
          <TouchableOpacity style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#007AFF20' }]} />
            <Text style={styles.legendText}>Prédio Principal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#34C75920' }]} />
            <Text style={styles.legendText}>Área Esportiva</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#8E8E9320' }]} />
            <Text style={styles.legendText}>Estacionamento</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderPOIModal()}
      {renderRiskAreaModal()}
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
  categoryFilter: {
    marginBottom: 8,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipIcon: {
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  mapControls: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  controlButtonActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  controlButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 4,
  },
  controlButtonTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  riskMarkerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  legendText: {
    fontSize: 12,
    color: '#1C1C1E',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalActionButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  poiIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  poiDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  poiDetailDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  poiDetailInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  riskHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  riskLevelBadge: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  riskDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  riskDetailDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  riskDetailLocation: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  riskSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  riskSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  riskItem: {
    marginBottom: 8,
  },
  riskItemText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
});