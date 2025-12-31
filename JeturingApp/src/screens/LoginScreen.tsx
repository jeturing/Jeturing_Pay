/**
 * Login Screen
 * Authenticate with existing Stripe Connected Account
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStripeAccount } from '../contexts/StripeAccountContext';
import { loginWithStripeAccount, setApiKey } from '../services/stripe';
import AnimationProvider from '../components/AnimationProvider';
import Constants from 'expo-constants';

// Get default values from environment
const DEFAULT_API_KEY = Constants.expoConfig?.extra?.apiKey || process.env.EXPO_PUBLIC_API_KEY || '';
const DEFAULT_ACCOUNT_ID = Constants.expoConfig?.extra?.defaultAccountId || process.env.EXPO_PUBLIC_DEFAULT_ACCOUNT_ID || '';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setAccount } = useStripeAccount();

  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [apiKey, setApiKeyValue] = useState(DEFAULT_API_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleLogin = async () => {
    if (!accountId.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu ID de cuenta Stripe');
      return;
    }

    if (!apiKey.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu API Key');
      return;
    }

    // Validate format (acct_xxx)
    if (!accountId.startsWith('acct_')) {
      Alert.alert(
        'Formato inválido',
        'El ID de cuenta debe comenzar con "acct_". Por ejemplo: acct_1234567890'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Save API key first
      await setApiKey(apiKey.trim());
      
      const account = await loginWithStripeAccount(accountId.trim());

      if (account) {
        setShowSuccess(true);

        // Wait for animation, then save account
        setTimeout(() => {
          setAccount({
            id: account.id,
            email: account.email || '',
            business_name: account.business_profile?.name || 'Mi Negocio',
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
          });
        }, 2000);
      } else {
        Alert.alert(
          'Cuenta no encontrada',
          'No se pudo encontrar una cuenta con ese ID. Verifica que el ID sea correcto.'
        );
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error de autenticación',
        error.response?.status === 404
          ? 'Cuenta no encontrada. Verifica el ID.'
          : 'No se pudo verificar la cuenta. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <AnimationProvider
          name="payment-success"
          visible={true}
          loop={false}
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.successTitle}>¡Bienvenido de vuelta!</Text>
        <Text style={styles.successText}>
          Tu cuenta ha sido verificada exitosamente
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Iniciar Sesión</Text>
              <Text style={styles.subtitle}>
                Ingresa tus credenciales de Jeturing Pay
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>API Key</Text>
                  <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                    <Text style={styles.toggleText}>
                      {showApiKey ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Tu API key de Jeturing"
                  placeholderTextColor="#9ca3af"
                  value={apiKey}
                  onChangeText={setApiKeyValue}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showApiKey}
                />
                <Text style={styles.hint}>
                  Proporcionada por el administrador de Jeturing
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>ID de Cuenta Stripe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="acct_xxxxxxxxxx"
                  placeholderTextColor="#9ca3af"
                  value={accountId}
                  onChangeText={setAccountId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.hint}>
                  Puedes encontrar tu ID en el dashboard de Stripe
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Verificar cuenta</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>¿No tienes una cuenta?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ConnectAccount' as never)}
              >
                <Text style={styles.helpLink}>Crear cuenta nueva →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  toggleText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  helpTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  helpLink: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 24,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoginScreen;
