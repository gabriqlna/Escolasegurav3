import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Campaign } from '@/types';

const CAMPAIGN_CATEGORIES = [
  { id: 'digital_safety', label: 'Segurança Digital', icon: 'shield-checkmark', color: '#007AFF' },
  { id: 'traffic_education', label: 'Educação no Trânsito Escolar', icon: 'car', color: '#34C759' },
  { id: 'anti_bullying', label: 'Prevenção ao Bullying', icon: 'people', color: '#FF9500' },
  { id: 'emergency_preparedness', label: 'Primeiros Socorros', icon: 'medical', color: '#FF3B30' },
  { id: 'general', label: 'Geral', icon: 'information-circle', color: '#8E8E93' },
];

const CampaignCard = ({ 
  campaign, 
  onPress 
}: { 
  campaign: Campaign; 
  onPress: () => void;
}) => {
  const category = CAMPAIGN_CATEGORIES.find(cat => cat.id === campaign.category);
  
  return (
    <TouchableOpacity 
      style={styles.campaignCard} 
      onPress={onPress}
      data-testid={`campaign-card-${campaign.id}`}
    >
      <View style={styles.campaignHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category?.color || '#8E8E93' }]}>
          <Ionicons 
            name={category?.icon as any || 'information-circle'} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.campaignHeaderText}>
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {campaign.title}
          </Text>
          <Text style={styles.campaignCategory}>
            {category?.label || 'Categoria não encontrada'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
      
      <Text style={styles.campaignDescription} numberOfLines={3}>
        {campaign.description}
      </Text>
      
      <View style={styles.campaignFooter}>
        <Text style={styles.campaignDate}>
          {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
        </Text>
        {campaign.isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>Ativo</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryPress 
}: {
  categories: any[];
  selectedCategory: string | null;
  onCategoryPress: (categoryId: string | null) => void;
}) => (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    style={styles.categoryFilter}
    contentContainerStyle={styles.categoryFilterContent}
  >
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === null && styles.categoryChipActive
      ]}
      onPress={() => onCategoryPress(null)}
      data-testid="category-filter-all"
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === null && styles.categoryChipTextActive
      ]}>
        Todas
      </Text>
    </TouchableOpacity>
    
    {categories.map((category) => (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryChip,
          selectedCategory === category.id && styles.categoryChipActive
        ]}
        onPress={() => onCategoryPress(category.id)}
        data-testid={`category-filter-${category.id}`}
      >
        <Ionicons 
          name={category.icon} 
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
);

export default function CampaignsScreen() {
  const { user, hasPermission } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const canCreateCampaigns = hasPermission('create_campaigns');

  // Mock data - substituir por chamadas de API reais
  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      title: 'Segurança Digital: Protegendo sua Privacidade Online',
      description: 'Aprenda como proteger suas informações pessoais na internet e evitar golpes digitais.',
      content: 'Conteúdo completo sobre segurança digital...',
      category: 'digital_safety',
      targetAudience: ['aluno', 'funcionario'],
      isActive: true,
      startDate: new Date(),
      createdBy: 'admin',
      createdAt: new Date(),
      imageUrl: 'https://example.com/image1.jpg',
      views: 0,
      completions: 0
    },
    {
      id: '2',
      title: 'Educação no Trânsito: Segurança na Entrada e Saída da Escola',
      description: 'Regras e comportamentos seguros para o trânsito escolar.',
      content: 'Conteúdo completo sobre educação no trânsito...',
      category: 'traffic_education',
      targetAudience: ['aluno'],
      isActive: true,
      startDate: new Date(),
      createdBy: 'admin',
      createdAt: new Date(),
      views: 0,
      completions: 0
    },
    {
      id: '3',
      title: 'Prevenção ao Bullying: Criando um Ambiente Escolar Mais Seguro',
      description: 'Como identificar, prevenir e denunciar casos de bullying.',
      content: 'Conteúdo completo sobre prevenção ao bullying...',
      category: 'anti_bullying',
      targetAudience: ['aluno', 'funcionario'],
      isActive: true,
      startDate: new Date(),
      createdBy: 'admin',
      createdAt: new Date(),
      views: 0,
      completions: 0
    }
  ];

  const filteredCampaigns = campaigns.length > 0 ? campaigns : mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !selectedCategory || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory && campaign.isActive;
  });

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      // Aqui seria feita a chamada para a API
      // const result = await campaignsService.getActiveCampaigns();
      // setCampaigns(result.data || []);
      setTimeout(() => {
        setCampaigns(mockCampaigns);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar campanhas');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  const openCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setModalVisible(true);
  };

  const renderCampaignDetail = () => (
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
          <Text style={styles.modalTitle}>Campanha Educativa</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedCampaign && (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.campaignDetailTitle}>
              {selectedCampaign.title}
            </Text>
            
            <View style={styles.campaignDetailMeta}>
              <View style={styles.campaignDetailCategory}>
                <Ionicons 
                  name="bookmark" 
                  size={16} 
                  color={CAMPAIGN_CATEGORIES.find(cat => cat.id === selectedCampaign.category)?.color || '#8E8E93'} 
                />
                <Text style={styles.campaignDetailCategoryText}>
                  {CAMPAIGN_CATEGORIES.find(cat => cat.id === selectedCampaign.category)?.label || 'Categoria'}
                </Text>
              </View>
              <Text style={styles.campaignDetailDate}>
                {new Date(selectedCampaign.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            <Text style={styles.campaignDetailContent}>
              {selectedCampaign.content}
            </Text>

            {/* Quiz Section - Future Implementation */}
            <View style={styles.quizSection}>
              <Text style={styles.quizTitle}>🧩 Quiz Interativo</Text>
              <Text style={styles.quizDescription}>
                Teste seus conhecimentos sobre este tema (em breve)
              </Text>
              <TouchableOpacity 
                style={styles.quizButton}
                disabled
              >
                <Text style={styles.quizButtonText}>Iniciar Quiz</Text>
                <Ionicons name="play-circle" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Campanhas Educativas</Text>
        <Text style={styles.subtitle}>
          Conteúdo educativo sobre segurança escolar
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar campanhas..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
            data-testid="search-campaigns"
          />
        </View>
        
        {canCreateCampaigns && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/campaigns/create' as any)}
            data-testid="button-create-campaign"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <CategoryFilter
        categories={CAMPAIGN_CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryPress={setSelectedCategory}
      />

      {/* Campaigns List */}
      <FlatList
        data={filteredCampaigns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => openCampaignDetail(item)}
          />
        )}
        style={styles.campaignsList}
        contentContainerStyle={styles.campaignsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Nenhuma campanha encontrada</Text>
            <Text style={styles.emptySubtitle}>
              Tente alterar os filtros ou aguarde novas campanhas
            </Text>
          </View>
        }
      />

      {renderCampaignDetail()}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  campaignsList: {
    flex: 1,
  },
  campaignsListContent: {
    padding: 16,
  },
  campaignCard: {
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
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  campaignHeaderText: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  campaignCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
  campaignDescription: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
    marginBottom: 12,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  activeIndicator: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  campaignDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  campaignDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  campaignDetailCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignDetailCategoryText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  campaignDetailDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  campaignDetailContent: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
    marginBottom: 32,
  },
  quizSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quizButtonText: {
    fontSize: 16,
    color: '#C7C7CC',
    fontWeight: '500',
    marginRight: 8,
  },
});