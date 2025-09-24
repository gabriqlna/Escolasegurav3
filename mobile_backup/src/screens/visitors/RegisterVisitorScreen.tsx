import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { visitorsService } from '@/services/visitors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Visitor } from '@/types';

const purposeOptions: SelectOption[] = [
  { value: 'meeting', label: 'Reunião' },
  { value: 'interview', label: 'Entrevista' },
  { value: 'parent_conference', label: 'Reunião de pais' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'delivery', label: 'Entrega' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'official', label: 'Visita oficial' },
  { value: 'other', label: 'Outro' },
];

const visitorSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  document: z.string().min(8, 'Documento deve ter pelo menos 8 caracteres').max(20, 'Documento muito longo'),
  phone: z.string().optional(),
  purpose: z.enum(['meeting', 'interview', 'parent_conference', 'maintenance', 'delivery', 'inspection', 'official', 'other']),
  customPurpose: z.string().optional(),
  hostName: z.string().min(2, 'Nome do anfitrião é obrigatório').max(100, 'Nome muito longo'),
  badgeNumber: z.string().optional(),
});

type VisitorFormData = z.infer<typeof visitorSchema>;

export default function RegisterVisitorScreen() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      name: '',
      document: '',
      phone: '',
      purpose: 'meeting',
      customPurpose: '',
      hostName: '',
      badgeNumber: '',
    },
  });

  const selectedPurpose = watch('purpose');

  const onSubmit = async (data: VisitorFormData) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para registrar visitantes');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalPurpose = data.purpose === 'other' && data.customPurpose 
        ? data.customPurpose 
        : purposeOptions.find(opt => opt.value === data.purpose)?.label || data.purpose;

      const visitorData: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        document: data.document,
        phone: data.phone,
        purpose: finalPurpose,
        hostName: data.hostName,
        hostId: undefined, // Could be implemented to link to actual host user
        checkInTime: new Date(),
        checkOutTime: undefined,
        status: 'checked_in',
        badgeNumber: data.badgeNumber,
        checkOutNote: undefined,
        registeredBy: user.id,
      };

      const result = await visitorsService.registerVisitor(visitorData);

      if (result.success) {
        Alert.alert(
          '✅ Visitante Registrado',
          `${data.name} foi registrado com sucesso!\n\nStatus: Check-in realizado\nCrachá: ${data.badgeNumber || 'N/A'}\nHorário: ${new Date().toLocaleTimeString('pt-BR')}`,
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
        Alert.alert('Erro', result.error || 'Erro ao registrar visitante');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao registrar visitante');
      console.error('Error registering visitor:', error);
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
            <Text style={styles.title}>📝 Registrar Visitante</Text>
            <Text style={styles.subtitle}>
              Faça o check-in de um novo visitante na escola
            </Text>
          </View>

          <View style={styles.form}>
            {/* Nome Completo */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome Completo *"
                  placeholder="Digite o nome completo do visitante"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  maxLength={100}
                  leftIcon="person"
                  data-testid="input-visitor-name"
                />
              )}
            />

            {/* Documento */}
            <Controller
              control={control}
              name="document"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Documento (RG/CPF) *"
                  placeholder="RG ou CPF do visitante"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.document?.message}
                  maxLength={20}
                  leftIcon="card"
                  data-testid="input-visitor-document"
                />
              )}
            />

            {/* Telefone */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Telefone (Opcional)"
                  placeholder="(11) 99999-9999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  leftIcon="call"
                  data-testid="input-visitor-phone"
                />
              )}
            />

            {/* Motivo da Visita */}
            <Controller
              control={control}
              name="purpose"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Motivo da Visita *"
                  value={value}
                  options={purposeOptions}
                  onValueChange={onChange}
                  placeholder="Selecione o motivo"
                  error={errors.purpose?.message}
                />
              )}
            />

            {/* Motivo Personalizado */}
            {selectedPurpose === 'other' && (
              <Controller
                control={control}
                name="customPurpose"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Especifique o Motivo"
                    placeholder="Descreva o motivo da visita"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.customPurpose?.message}
                    maxLength={100}
                    data-testid="input-custom-purpose"
                  />
                )}
              />
            )}

            {/* Nome do Anfitrião */}
            <Controller
              control={control}
              name="hostName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Anfitrião/Pessoa a Visitar *"
                  placeholder="Nome da pessoa que será visitada"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.hostName?.message}
                  maxLength={100}
                  leftIcon="person-circle"
                  data-testid="input-host-name"
                />
              )}
            />

            {/* Número do Crachá */}
            <Controller
              control={control}
              name="badgeNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Número do Crachá (Opcional)"
                  placeholder="Ex: 001, A-15, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.badgeNumber?.message}
                  maxLength={10}
                  leftIcon="bookmark"
                  data-testid="input-badge-number"
                />
              )}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ O visitante será registrado com status "Check-in" e ficará visível 
                na lista de visitantes ativos até que seja feito o check-out.
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
                title={isSubmitting ? 'Registrando...' : 'Registrar Visitante'}
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