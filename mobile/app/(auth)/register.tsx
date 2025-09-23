import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RegisterForm, UserRole } from '@/types';
import { USER_ROLE_LABELS } from '@/constants/permissions';

export default function RegisterScreen() {
  const { signUp, loading } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'aluno',
  });
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const result = await signUp(form);
      
      if (result.success) {
        Alert.alert(
          'Sucesso!', 
          'Conta criada com sucesso. Você será redirecionado para o dashboard.',
          [{ text: 'OK', onPress: () => router.replace('/(main)/dashboard') }]
        );
      } else {
        Alert.alert('Erro no Cadastro', result.error || 'Erro desconhecido');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado. Tente novamente.');
    }
  };

  const updateForm = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🏫</Text>
              <Text style={styles.title}>Criar Nova Conta</Text>
              <Text style={styles.subtitle}>Preencha suas informações</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Nome Completo"
                value={form.name}
                onChangeText={(value) => updateForm('name', value)}
                placeholder="Digite seu nome completo"
                autoCapitalize="words"
                autoComplete="name"
                leftIcon="person"
                error={errors.name}
              />

              <Input
                label="Email"
                value={form.email}
                onChangeText={(value) => updateForm('email', value)}
                placeholder="Digite seu email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="mail"
                error={errors.email}
              />

              <Input
                label="Senha"
                value={form.password}
                onChangeText={(value) => updateForm('password', value)}
                placeholder="Digite sua senha"
                isPassword
                leftIcon="lock-closed"
                error={errors.password}
              />

              <Input
                label="Confirmar Senha"
                value={form.confirmPassword}
                onChangeText={(value) => updateForm('confirmPassword', value)}
                placeholder="Confirme sua senha"
                isPassword
                leftIcon="lock-closed"
                error={errors.confirmPassword}
              />

              {/* Role Select */}
              <Select
                label="Tipo de Usuário"
                value={form.role}
                onValueChange={(value) => updateForm('role', value as UserRole)}
                options={[
                  { label: USER_ROLE_LABELS.aluno, value: 'aluno' },
                  { label: USER_ROLE_LABELS.funcionario, value: 'funcionario' },
                  { label: USER_ROLE_LABELS.direcao, value: 'direcao' },
                ]}
              />

              <Button
                title="Criar Conta"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
              />
            </View>

            {/* Login link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Já tem uma conta?{' '}
                <Link href="/(auth)/login" style={styles.link}>
                  Fazer login
                </Link>
              </Text>
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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});