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
import { antiBullyingService, AntiBullyingReportCreate } from '@/services/anti-bullying';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Report } from '@/types';

const bullyingTypeOptions: SelectOption[] = [
  { value: 'verbal', label: 'Verbal - Xingamentos, apelidos, provocações' },
  { value: 'physical', label: 'Físico - Empurrões, socos, chutes' },
  { value: 'cyber', label: 'Cyberbullying - Online, redes sociais, mensagens' },
  { value: 'social_exclusion', label: 'Exclusão Social - Isolamento, espalhar boatos' },
  { value: 'other', label: 'Outro tipo' },
];

const frequencyOptions: SelectOption[] = [
  { value: 'single_incident', label: 'Aconteceu uma vez' },
  { value: 'weekly', label: 'Algumas vezes por semana' },
  { value: 'daily', label: 'Todos os dias' },
  { value: 'ongoing', label: 'Acontece constantemente' },
];

const impactOptions: SelectOption[] = [
  { value: 'low', label: 'Baixo - Me incomoda um pouco' },
  { value: 'medium', label: 'Médio - Me deixa triste/preocupado' },
  { value: 'high', label: 'Alto - Não quero mais vir à escola' },
  { value: 'severe', label: 'Severo - Penso em me machucar' },
];

const antiBullyingSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(100, 'Título muito longo'),
  description: z.string().min(20, 'Descreva o que aconteceu com mais detalhes (mínimo 20 caracteres)').max(1000, 'Descrição muito longa'),
  bullyingType: z.enum(['verbal', 'physical', 'cyber', 'social_exclusion', 'other']),
  frequency: z.enum(['single_incident', 'weekly', 'daily', 'ongoing']),
  impactLevel: z.enum(['low', 'medium', 'high', 'severe']),
  location: z.string().optional(),
  witnessesPresent: z.boolean(),
  previouslyReported: z.boolean(),
  supportRequested: z.boolean(),
  isAnonymous: z.boolean(),
});

type AntiBullyingFormData = z.infer<typeof antiBullyingSchema>;

export default function AntiBullyingReportScreen() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AntiBullyingFormData>({
    resolver: zodResolver(antiBullyingSchema),
    defaultValues: {
      title: '',
      description: '',
      bullyingType: 'verbal',
      frequency: 'single_incident',
      impactLevel: 'medium',
      location: '',
      witnessesPresent: false,
      previouslyReported: false,
      supportRequested: false,
      isAnonymous: false,
    },
  });

  const isAnonymous = watch('isAnonymous');
  const supportRequested = watch('supportRequested');
  const impactLevel = watch('impactLevel');

  const onSubmit = async (data: AntiBullyingFormData) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para fazer uma denúncia');
      return;
    }

    // Se for impacto severo, alertar sobre ajuda imediata
    if (data.impactLevel === 'severe' && !supportRequested) {
      Alert.alert(
        'Ajuda Imediata Disponível',
        'Percebemos que você está passando por um momento muito difícil. Você gostaria de conversar com alguém agora mesmo?\\n\\nSempre há uma solução e pessoas dispostas a ajudar.',
        [
          {
            text: 'Sim, preciso de ajuda agora',
            onPress: () => {
              Alert.alert(
                'Ajuda Disponível',
                'Contatando equipe de apoio...\\nVocê será redirecionado para conversar com nossa psicóloga escolar.',
                [{ text: 'OK' }]
              );
            },
          },
          {
            text: 'Continuar com denúncia',
            onPress: () => submitReport(data),
          },
        ]
      );
      return;
    }

    await submitReport(data);
  };

  const submitReport = async (data: AntiBullyingFormData) => {
    setIsSubmitting(true);

    try {
      const reportData: AntiBullyingReportCreate = {
        title: data.title,
        description: data.description,
        location: data.location,
        isAnonymous: data.isAnonymous,
        reporterId: data.isAnonymous ? undefined : user?.id,
        priority: 'high', // Will be determined by service
        bullyingType: data.bullyingType,
        frequency: data.frequency,
        impactLevel: data.impactLevel,
        witnessesPresent: data.witnessesPresent,
        previouslyReported: data.previouslyReported,
        supportRequested: data.supportRequested,
        isHighRisk: false, // Will be determined by service
        parentNotified: false
      };

      const result = await antiBullyingService.createAntiBullyingReport(reportData);

      if (result.success) {
        Alert.alert(
          '💙 Denúncia Recebida',
          `Sua denúncia foi registrada com sucesso. Nossa equipe especializada em bullying irá analisar seu caso com toda a atenção que merece.

${data.supportRequested || data.impactLevel === 'severe' 
  ? '⚡ Devido à urgência do seu caso, você será contatado em até 2 horas.' 
  : '📞 Você receberá um retorno em até 24 horas.'
}

Lembre-se: Você não está sozinho(a). Estamos aqui para ajudar.`,
          [
            {
              text: 'Entendido',
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
      console.error('Error creating anti-bullying report:', error);
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
            <Text style={styles.title}>🛡️ Canal Anti-Bullying</Text>
            <Text style={styles.subtitle}>
              Um espaço seguro para reportar situações de bullying
            </Text>
            <View style={styles.supportBox}>
              <Text style={styles.supportText}>
                💙 Você não está sozinho(a). Nossa equipe está aqui para ajudar e proteger você.
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            {/* Título */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Resumo do que aconteceu *"
                  placeholder="Ex: Colegas me xingam todos os dias no recreio"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  maxLength={100}
                  data-testid="input-bullying-title"
                />
              )}
            />

            {/* Tipo de Bullying */}
            <Controller
              control={control}
              name="bullyingType"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Que tipo de bullying aconteceu? *"
                  value={value}
                  options={bullyingTypeOptions}
                  onValueChange={onChange}
                  placeholder="Selecione o tipo"
                  error={errors.bullyingType?.message}
                />
              )}
            />

            {/* Frequência */}
            <Controller
              control={control}
              name="frequency"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Com que frequência isso acontece? *"
                  value={value}
                  options={frequencyOptions}
                  onValueChange={onChange}
                  placeholder="Selecione a frequência"
                  error={errors.frequency?.message}
                />
              )}
            />

            {/* Impacto Emocional */}
            <Controller
              control={control}
              name="impactLevel"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Como isso te afeta emocionalmente? *"
                  value={value}
                  options={impactOptions}
                  onValueChange={onChange}
                  placeholder="Selecione o impacto"
                  error={errors.impactLevel?.message}
                />
              )}
            />

            {/* Alerta para impacto severo */}
            {impactLevel === 'severe' && (
              <View style={styles.urgentBox}>
                <Text style={styles.urgentText}>
                  🚨 Percebemos que você está passando por um momento muito difícil. 
                  Lembre-se: sempre há uma solução e pessoas dispostas a ajudar você.
                </Text>
              </View>
            )}

            {/* Descrição */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Conte-nos o que aconteceu em detalhes *"
                  placeholder="Descreva a situação: quem estava envolvido, o que foi dito ou feito, como você se sentiu..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={1000}
                  data-testid="input-bullying-description"
                />
              )}
            />

            {/* Local */}
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Onde aconteceu? (Opcional)"
                  placeholder="Ex: Sala de aula, pátio, banheiro, online..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.location?.message}
                  leftIcon="location"
                  data-testid="input-bullying-location"
                />
              )}
            />

            {/* Switches */}
            <View style={styles.switchesContainer}>
              <View style={styles.switchItem}>
                <View style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Havia testemunhas presentes?</Text>
                  <Text style={styles.switchDescription}>
                    Outras pessoas viram o que aconteceu?
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="witnessesPresent"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#F2F2F7', true: '#007AFF' }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                />
              </View>

              <View style={styles.switchItem}>
                <View style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Já reportou isso antes?</Text>
                  <Text style={styles.switchDescription}>
                    Já contou para alguém sobre essa situação?
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="previouslyReported"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#F2F2F7', true: '#007AFF' }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                />
              </View>

              <View style={styles.switchItem}>
                <View style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Precisa de apoio emocional?</Text>
                  <Text style={styles.switchDescription}>
                    Quer conversar com nossa equipe de apoio?
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="supportRequested"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#F2F2F7', true: '#FF3B30' }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                />
              </View>

              <View style={styles.switchItem}>
                <View style={styles.switchContent}>
                  <Text style={styles.switchLabel}>Denúncia Anônima</Text>
                  <Text style={styles.switchDescription}>
                    {isAnonymous
                      ? 'Sua identidade será mantida em sigilo total'
                      : 'Sua identidade será registrada (recomendado para acompanhamento)'}
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="isAnonymous"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#F2F2F7', true: '#AF52DE' }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.helpResources}>
              <Text style={styles.helpTitle}>🆘 Recursos de Ajuda Disponíveis</Text>
              <Text style={styles.helpText}>
                • Psicóloga escolar disponível todos os dias
                • Conversa confidencial com a direção
                • Mediação entre as partes envolvidas
                • Acompanhamento contínuo da situação
                • Suporte emocional para você e sua família
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
    marginBottom: 16,
  },
  supportBox: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  supportText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    fontWeight: '500',
  },
  form: {
    padding: 24,
  },
  switchesContainer: {
    marginBottom: 24,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  urgentBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  urgentText: {
    fontSize: 14,
    color: '#FF3B30',
    lineHeight: 20,
    fontWeight: '500',
  },
  helpResources: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  helpText: {
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