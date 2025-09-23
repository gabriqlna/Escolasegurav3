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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ChecklistItem } from '@/types';

const CHECKLIST_CATEGORIES = [
  { id: 'daily', label: 'Diário', icon: 'today', color: '#007AFF', description: 'Verificações diárias de segurança' },
  { id: 'weekly', label: 'Semanal', icon: 'calendar', color: '#34C759', description: 'Inspeções semanais completas' },
  { id: 'monthly', label: 'Mensal', icon: 'calendar-outline', color: '#FF9500', description: 'Auditorias mensais detalhadas' },
  { id: 'emergency', label: 'Emergência', icon: 'warning', color: '#FF3B30', description: 'Checklist para situações de emergência' },
];

const DAILY_CHECKLIST_ITEMS = [
  'Verificar funcionamento de portões principais',
  'Testar sistema de câmeras de segurança',
  'Verificar iluminação de emergência',
  'Inspecionar extintores de incêndio',
  'Conferir fechaduras das salas',
  'Verificar sistema de alarme',
  'Inspecionar área de playground',
  'Conferir limpeza e manutenção básica',
];

const WEEKLY_CHECKLIST_ITEMS = [
  'Teste completo do sistema de emergência',
  'Verificação detalhada das rotas de evacuação',
  'Inspeção de equipamentos de segurança',
  'Teste de comunicação interna',
  'Verificação de primeiros socorros',
  'Inspeção estrutural básica',
  'Teste de procedimentos de emergência',
  'Auditoria de visitantes da semana',
];

const MONTHLY_CHECKLIST_ITEMS = [
  'Auditoria completa de segurança',
  'Revisão de políticas de segurança',
  'Treinamento de equipe atualizado',
  'Manutenção preventiva completa',
  'Análise de incidentes do mês',
  'Atualização de contatos de emergência',
  'Revisão de acesso e permissões',
  'Relatório mensal de conformidade',
];

const EMERGENCY_CHECKLIST_ITEMS = [
  'Acionar alarme de emergência',
  'Contactar autoridades competentes',
  'Iniciar procedimento de evacuação',
  'Verificar rotas de escape livres',
  'Contar pessoas no ponto de encontro',
  'Prestar primeiros socorros se necessário',
  'Documentar o incidente',
  'Comunicar aos responsáveis',
];

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onToggle: (item: ChecklistItem) => void;
  onAddNote: (item: ChecklistItem) => void;
}

const ChecklistItemCard = ({ item, onToggle, onAddNote }: ChecklistItemCardProps) => {
  const getStatusColor = () => {
    if (item.isCompleted) return '#34C759';
    if (item.dueDate && new Date() > item.dueDate) return '#FF3B30';
    return '#FF9500';
  };

  const getStatusIcon = () => {
    if (item.isCompleted) return 'checkmark-circle';
    if (item.dueDate && new Date() > item.dueDate) return 'alert-circle';
    return 'radio-button-off';
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={[styles.checklistItem, { borderLeftColor: getStatusColor() }]}>
      <TouchableOpacity 
        style={styles.checklistItemMain}
        onPress={() => onToggle(item)}
        data-testid={`checklist-item-${item.id}`}
      >
        <View style={styles.checklistItemContent}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={24} 
            color={getStatusColor()}
            style={styles.checklistIcon}
          />
          <View style={styles.checklistItemText}>
            <Text style={[
              styles.checklistItemTitle,
              item.isCompleted && styles.checklistItemTitleCompleted
            ]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={styles.checklistItemDescription}>
                {item.description}
              </Text>
            )}
            <View style={styles.checklistItemMeta}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
                <Text style={styles.priorityText}>
                  {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                </Text>
              </View>
              {item.completedAt && (
                <Text style={styles.completedTime}>
                  Concluído em {new Date(item.completedAt).toLocaleString('pt-BR')}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.noteButton}
        onPress={() => onAddNote(item)}
        data-testid={`add-note-${item.id}`}
      >
        <Ionicons name="create-outline" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

export default function ChecklistScreen() {
  const { user, hasPermission } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'daily' | 'weekly' | 'monthly' | 'emergency'>('daily');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [noteText, setNoteText] = useState('');

  const canManageChecklist = hasPermission('manage_checklist');
  const canCompleteChecklist = hasPermission('complete_checklist');

  useEffect(() => {
    loadChecklistItems();
  }, [selectedCategory]);

  const loadChecklistItems = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Gerar items baseado na categoria
      let baseItems: string[] = [];
      switch (selectedCategory) {
        case 'daily':
          baseItems = DAILY_CHECKLIST_ITEMS;
          break;
        case 'weekly':
          baseItems = WEEKLY_CHECKLIST_ITEMS;
          break;
        case 'monthly':
          baseItems = MONTHLY_CHECKLIST_ITEMS;
          break;
        case 'emergency':
          baseItems = EMERGENCY_CHECKLIST_ITEMS;
          break;
      }

      const mockItems: ChecklistItem[] = baseItems.map((title, index) => ({
        id: `${selectedCategory}_${index}`,
        title,
        description: selectedCategory === 'emergency' ? 'Ação crítica para emergências' : undefined,
        category: selectedCategory,
        isCompleted: Math.random() > 0.7, // 30% já completados
        priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
        dueDate: selectedCategory === 'daily' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
        createdBy: 'admin',
        createdAt: new Date(),
        completedAt: Math.random() > 0.7 ? new Date() : undefined,
        completedBy: Math.random() > 0.7 ? user?.id : undefined,
      }));

      setChecklistItems(mockItems);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar checklist');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChecklistItems();
    setRefreshing(false);
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    if (!canCompleteChecklist) {
      Alert.alert('Sem permissão', 'Você não tem permissão para alterar itens do checklist');
      return;
    }

    try {
      const updatedItems = checklistItems.map(i => 
        i.id === item.id 
          ? { 
              ...i, 
              isCompleted: !i.isCompleted,
              completedAt: !i.isCompleted ? new Date() : undefined,
              completedBy: !i.isCompleted ? user?.id : undefined,
            }
          : i
      );
      setChecklistItems(updatedItems);
      
      // Aqui seria feita a atualização no backend
      
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar item do checklist');
    }
  };

  const handleAddNote = (item: ChecklistItem) => {
    setSelectedItem(item);
    setNoteText('');
    setNoteModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Erro', 'Por favor, digite uma observação');
      return;
    }

    try {
      // Aqui seria salva a observação no backend
      setNoteModalVisible(false);
      Alert.alert('Sucesso', 'Observação adicionada com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar observação');
    }
  };

  const generateReport = () => {
    const completed = checklistItems.filter(item => item.isCompleted).length;
    const total = checklistItems.length;
    const percentage = Math.round((completed / total) * 100);
    
    const category = CHECKLIST_CATEGORIES.find(cat => cat.id === selectedCategory);
    
    Alert.alert(
      'Relatório de Conformidade',
      `Checklist ${category?.label}:\n\n` +
      `✅ Completos: ${completed}/${total} (${percentage}%)\n` +
      `📋 Pendentes: ${total - completed}\n\n` +
      `${percentage >= 90 ? '🟢 Conformidade ALTA' : 
        percentage >= 70 ? '🟡 Conformidade MÉDIA' : 
        '🔴 Conformidade BAIXA'}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'Exportar PDF', onPress: () => Alert.alert('Sucesso', 'Relatório PDF gerado!') },
      ]
    );
  };

  const selectedCategoryData = CHECKLIST_CATEGORIES.find(cat => cat.id === selectedCategory);
  const completedCount = checklistItems.filter(item => item.isCompleted).length;
  const totalCount = checklistItems.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✅ Checklist de Segurança</Text>
        <Text style={styles.subtitle}>
          Verificações e conformidade de segurança
        </Text>
      </View>

      {/* Category Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categorySelector}
        contentContainerStyle={styles.categorySelectorContent}
      >
        {CHECKLIST_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardActive,
              { borderColor: category.color }
            ]}
            onPress={() => setSelectedCategory(category.id as any)}
            data-testid={`category-${category.id}`}
          >
            <Ionicons 
              name={category.icon as any} 
              size={24} 
              color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
            />
            <Text style={[
              styles.categoryCardTitle,
              selectedCategory === category.id && styles.categoryCardTitleActive
            ]}>
              {category.label}
            </Text>
            <Text style={[
              styles.categoryCardDescription,
              selectedCategory === category.id && styles.categoryCardDescriptionActive
            ]}>
              {category.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Summary */}
      <View style={styles.progressSection}>
        <View style={[styles.progressCard, { borderLeftColor: selectedCategoryData?.color }]}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                Checklist {selectedCategoryData?.label}
              </Text>
              <Text style={styles.progressSubtitle}>
                {completedCount}/{totalCount} itens concluídos
              </Text>
            </View>
            <View style={styles.progressPercentage}>
              <Text style={styles.progressPercentageText}>{completionPercentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${completionPercentage}%`,
                  backgroundColor: selectedCategoryData?.color 
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={generateReport}
          data-testid="generate-report"
        >
          <Ionicons name="document-text" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Relatório</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onRefresh}
          data-testid="refresh-checklist"
        >
          <Ionicons name="refresh" size={20} color="#34C759" />
          <Text style={styles.actionButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Checklist Items */}
      <ScrollView
        style={styles.checklistContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {checklistItems.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            onToggle={handleToggleItem}
            onAddNote={handleAddNote}
          />
        ))}
        
        {checklistItems.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Selecione uma categoria para ver os itens do checklist
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Note Modal */}
      <Modal
        visible={noteModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setNoteModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Adicionar Observação</Text>
            <TouchableOpacity 
              onPress={handleSaveNote}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {selectedItem && (
              <Text style={styles.modalItemTitle}>{selectedItem.title}</Text>
            )}
            <TextInput
              style={styles.noteInput}
              placeholder="Digite sua observação sobre este item..."
              placeholderTextColor="#8E8E93"
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              data-testid="note-input"
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  categorySelector: {
    maxHeight: 140,
    marginVertical: 16,
  },
  categorySelectorContent: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  categoryCardTitleActive: {
    color: '#FFFFFF',
  },
  categoryCardDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  categoryCardDescriptionActive: {
    color: '#FFFFFF',
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  progressPercentage: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressPercentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
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
    marginLeft: 8,
  },
  checklistContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  checklistItem: {
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistItemMain: {
    flex: 1,
  },
  checklistItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistIcon: {
    marginRight: 12,
  },
  checklistItemText: {
    flex: 1,
  },
  checklistItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  checklistItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  checklistItemDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  checklistItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedTime: {
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
  },
  noteButton: {
    padding: 8,
    marginLeft: 8,
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
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    height: 150,
  },
});