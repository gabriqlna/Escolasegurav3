import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { reportsService } from '@/services/reports';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { REPORT_TYPES, PRIORITY_LEVELS } from '@/constants/permissions';
import { Report } from '@/types';

const reportSchema = z.object({
  type: z.enum(['bullying', 'violence', 'infrastructure', 'security', 'other']),
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(100, 'Título muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição muito longa'),
  location: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  isAnonymous: z.boolean(),
});

type ReportFormData = z.infer<typeof reportSchema>;

const reportTypeOptions: SelectOption[] = Object.entries(REPORT_TYPES).map(([value, label]) => ({
  value,
  label,
}));

const priorityOptions: SelectOption[] = Object.entries(PRIORITY_LEVELS).map(([value, label]) => ({
  value: value as keyof typeof PRIORITY_LEVELS,
  label,
}));

export default function CreateReportScreen() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: 'other',
      title: '',
      description: '',
      location: '',
      priority: 'medium',
      isAnonymous: false,
    },
  });

  const isAnonymous = watch('isAnonymous');

  const onSubmit = async (data: ReportFormData) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para fazer uma denúncia');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> = {
        type: data.type,
        title: data.title,
        description: data.description,
        location: data.location || '',
        priority: data.priority,
        isAnonymous: data.isAnonymous,
        reporterId: data.isAnonymous ? undefined : user.id,
        status: 'pending',
      };

      const result = await reportsService.createReport(reportData);

      if (result.success) {
        Alert.alert(
          'Sucesso',
          'Denúncia criada com sucesso! Nossa equipe irá analisar e tomar as medidas necessárias.',
          [
            {
              text: 'OK',
              onPress: () => {
                reset();
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao criar denúncia');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao criar denúncia');
      console.error('Error creating report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>📝 Nova Denúncia</Text>
            <Text style={styles.subtitle}>
              Relate incidentes de forma segura e confidencial
            </Text>
          </View>

          <View style={styles.form}>
            {/* Tipo de Denúncia */}
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Tipo de Denúncia *"
                  value={value}
                  options={reportTypeOptions}
                  onValueChange={onChange}
                  placeholder="Selecione o tipo"
                  error={errors.type?.message}
                />
              )}
            />

            {/* Título */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Título *"
                  placeholder="Descreva resumidamente o incidente"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  maxLength={100}
                  data-testid="input-report-title"
                />
              )}
            />

            {/* Descrição */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Descrição Detalhada *"
                  placeholder="Descreva detalhadamente o que aconteceu, quando e como"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  data-testid="input-report-description"
                />
              )}
            />

            {/* Local */}
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Local (Opcional)"
                  placeholder="Ex: Sala 201, Pátio, Banheiro do 2º andar"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.location?.message}
                  leftIcon="location"
                  data-testid="input-report-location"
                />
              )}
            />

            {/* Prioridade */}
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Prioridade *"
                  value={value}
                  options={priorityOptions}
                  onValueChange={onChange}
                  placeholder="Selecione a prioridade"
                  error={errors.priority?.message}
                />
              )}
            />

            {/* Denúncia Anônima */}
            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Denúncia Anônima</Text>
                <Text style={styles.switchDescription}>
                  {isAnonymous
                    ? 'Sua identidade será mantida em sigilo'
                    : 'Sua identidade será registrada (recomendado para follow-up)'}
                </Text>
              </View>
              <Controller
                control={control}
                name="isAnonymous"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#F2F2F7', true: '#007AFF' }}
                    thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
                    data-testid="switch-anonymous"
                  />
                )}
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ Sua denúncia será analisada pela equipe de segurança da escola.
                Você receberá atualizações sobre o status {!isAnonymous && 'no seu perfil'}.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => router.back()}
                disabled={isSubmitting}
                style={styles.cancelButton}
                data-testid="button-cancel"
              />
              <Button
                title={isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitButton}
                data-testid="button-submit"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoid: {
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  form: {
    padding: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});