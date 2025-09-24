import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Campaign, UserRole } from '@/types';

const CAMPAIGN_CATEGORIES = [
  { id: 'digital_safety', label: 'Segurança Digital', icon: 'shield-checkmark', color: '#007AFF' },
  { id: 'traffic_education', label: 'Educação no Trânsito Escolar', icon: 'car', color: '#34C759' },
  { id: 'anti_bullying', label: 'Prevenção ao Bullying', icon: 'people', color: '#FF9500' },
  { id: 'emergency_preparedness', label: 'Primeiros Socorros', icon: 'medical', color: '#FF3B30' },
  { id: 'general', label: 'Geral', icon: 'information-circle', color: '#8E8E93' },
];

const TARGET_AUDIENCES = [
  { id: 'aluno', label: 'Alunos' },
  { id: 'funcionario', label: 'Funcionários' },
  { id: 'direcao', label: 'Direção' },
];

interface FormData {
  title: string;
  description: string;
  content: string;
  category: string;
  targetAudience: UserRole[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

export default function CreateCampaignScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    category: 'general',
    targetAudience: ['aluno'],
    isActive: true,
    startDate: new Date(),
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTargetAudience = (audience: UserRole) => {
    const newAudience = formData.targetAudience.includes(audience)
      ? formData.targetAudience.filter(a => a !== audience)
      : [...formData.targetAudience, audience];
    
    updateFormData('targetAudience', newAudience);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Erro', 'Conteúdo é obrigatório');
      return false;
    }
    if (formData.targetAudience.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um público-alvo');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Aqui seria feita a chamada para a API
      // const result = await campaignsService.createCampaign(formData);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Sucesso',
        'Campanha criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar campanha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CAMPAIGN_CATEGORIES.find(cat => cat.id === formData.category);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          data-testid="button-back"
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Nova Campanha</Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
          data-testid="button-save-campaign"
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Segurança Digital na Escola"
            placeholderTextColor="#8E8E93"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
            maxLength={100}
            data-testid="input-title"
          />
          <Text style={styles.charCount}>{formData.title.length}/100</Text>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Breve descrição da campanha..."
            placeholderTextColor="#8E8E93"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            maxLength={200}
            multiline
            numberOfLines={3}
            data-testid="input-description"
          />
          <Text style={styles.charCount}>{formData.description.length}/200</Text>
        </View>

        {/* Categoria */}
        <View style={styles.section}>
          <Text style={styles.label}>Categoria</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CAMPAIGN_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  formData.category === category.id && styles.categoryOptionSelected,
                  { borderColor: category.color }
                ]}
                onPress={() => updateFormData('category', category.id)}
                data-testid={`category-${category.id}`}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={20} 
                  color={formData.category === category.id ? '#FFFFFF' : category.color} 
                />
                <Text style={[
                  styles.categoryOptionText,
                  formData.category === category.id && styles.categoryOptionTextSelected
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Público-alvo */}
        <View style={styles.section}>
          <Text style={styles.label}>Público-alvo *</Text>
          {TARGET_AUDIENCES.map((audience) => (
            <TouchableOpacity
              key={audience.id}
              style={styles.audienceOption}
              onPress={() => toggleTargetAudience(audience.id as UserRole)}
              data-testid={`audience-${audience.id}`}
            >
              <View style={styles.audienceOptionContent}>
                <Text style={styles.audienceOptionText}>{audience.label}</Text>
                <View style={[
                  styles.checkbox,
                  formData.targetAudience.includes(audience.id as UserRole) && styles.checkboxSelected
                ]}>
                  {formData.targetAudience.includes(audience.id as UserRole) && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo */}
        <View style={styles.section}>
          <Text style={styles.label}>Conteúdo da Campanha *</Text>
          <TextInput
            style={[styles.textInput, styles.contentArea]}
            placeholder="Escreva o conteúdo completo da campanha educativa..."
            placeholderTextColor="#8E8E93"
            value={formData.content}
            onChangeText={(text) => updateFormData('content', text)}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            data-testid="input-content"
          />
        </View>

        {/* Status Ativo */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.label}>Ativar Campanha</Text>
              <Text style={styles.switchDescription}>
                A campanha ficará visível para o público-alvo selecionado
              </Text>
            </View>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => updateFormData('isActive', value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
              data-testid="switch-active"
            />
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.label}>📱 Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={[styles.previewIcon, { backgroundColor: selectedCategory?.color || '#8E8E93' }]}>
                <Ionicons 
                  name={selectedCategory?.icon as any || 'information-circle'} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </View>
              <View style={styles.previewHeaderText}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {formData.title || 'Título da campanha'}
                </Text>
                <Text style={styles.previewCategory}>
                  {selectedCategory?.label || 'Categoria'}
                </Text>
              </View>
            </View>
            <Text style={styles.previewDescription} numberOfLines={2}>
              {formData.description || 'Descrição da campanha aparecerá aqui...'}
            </Text>
            <View style={styles.previewFooter}>
              <Text style={styles.previewAudience}>
                👥 {formData.targetAudience.map(a => 
                  TARGET_AUDIENCES.find(au => au.id === a)?.label
                ).join(', ') || 'Público-alvo'}
              </Text>
              {formData.isActive && (
                <View style={styles.previewActive}>
                  <Text style={styles.previewActiveText}>Ativo</Text>
                </View>
              )}
            </View>
          </View>
        </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  contentArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  audienceOption: {
    marginBottom: 12,
  },
  audienceOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  audienceOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewHeaderText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  previewCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
  previewDescription: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
    marginBottom: 12,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewAudience: {
    fontSize: 12,
    color: '#8E8E93',
  },
  previewActive: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewActiveText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});