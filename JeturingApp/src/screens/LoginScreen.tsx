/**
 * Login Screen with Biometric Authentication
 * - Quick login with FaceID/Fingerprint for returning users
 * - Search by business name + phone for new devices
 * - Fallback to Account ID for manual login
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
import { loginWithStripeAccount, setApiKey, searchAccountByBusiness } from '../services/stripe';
import {
  biometricLogin,
  checkBiometricAvailability,
  getBiometricDisplayName,
  hasStoredCredentials,
  registerDeviceWithBiometrics,
  BiometricStatus,
} from '../services/biometricAuth';
import AnimationProvider from '../components/AnimationProvider';
import Constants from 'expo-constants';

// Get API key from environment
const DEFAULT_API_KEY = Constants.expoConfig?.extra?.apiKey || process.env.EXPO_PUBLIC_API_KEY || '';

type LoginMode = 'biometric' | 'business' | 'account_id';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setAccount } = useStripeAccount();

  // UI State
  const [loginMode, setLoginMode] = useState<LoginMode>('biometric');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);

  // Biometric state
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);

  // Form inputs
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [accountId, setAccountId] = useState('');

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    setIsCheckingBiometric(true);
    try {
      const status = await checkBiometricAvailability();
      const stored = await hasStoredCredentials();
      
      setBiometricStatus(status);
      setHasCredentials(stored);
      
      // If user has stored credentials and biometrics available, show biometric option
      if (stored && status.isAvailable && status.isEnrolled) {
        setLoginMode('biometric');
      } else {
        // Otherwise default to business search
        setLoginMode('business');
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
      setLoginMode('business');
    } finally {
      setIsCheckingBiometric(false);
    }
  };

  // Handle biometric login
  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      const credentials = await biometricLogin();
      
      if (credentials) {
        // Verify account still exists in Stripe
        await setApiKey(DEFAULT_API_KEY);
        const account = await loginWithStripeAccount(credentials.accountId, DEFAULT_API_KEY);
        
        if (account) {
          setShowSuccess(true);
          setTimeout(() => {
            setAccount({
              id: account.id,
              email: account.email || credentials.email,
              business_name: account.business_profile?.name || credentials.businessName,
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
            });
          }, 2000);
        } else {
          Alert.alert('Error', 'No se pudo verificar tu cuenta. Intenta con otro método.');
          setLoginMode('business');
        }
      } else {
        Alert.alert('Autenticación fallida', 'No se pudo verificar tu identidad.');
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle business search login
  const handleBusinessLogin = async () => {
    if (!businessName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre de tu negocio');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Ingresa tu número de teléfono');
      return;
    }

    setIsLoading(true);
    try {
      await setApiKey(DEFAULT_API_KEY);
      
      // Search for account by business name and phone
      const result = await searchAccountByBusiness(businessName.trim(), phone.trim());
      
      if (result && result.accountId) {
        // Found account, verify with Stripe
        const account = await loginWithStripeAccount(result.accountId, DEFAULT_API_KEY);
        
        if (account) {
          // Register this device with biometrics
          await registerDeviceWithBiometrics({
            accountId: account.id,
            businessName: account.business_profile?.name || businessName,
            phone: phone,
            email: account.email || '',
          });
          
          setShowSuccess(true);
          setTimeout(() => {
            setAccount({
              id: account.id,
              email: account.email || '',
              business_name: account.business_profile?.name || businessName,
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
            });
          }, 2000);
        }
      } else {
        Alert.alert(
          'Cuenta no encontrada',
          '¿Deseas crear una nueva cuenta con estos datos?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Crear cuenta', 
              onPress: () => navigation.navigate('ConnectAccount' as never) 
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Business login error:', error);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account ID login (fallback)
  const handleAccountIdLogin = async () => {
    if (!accountId.trim()) {
      Alert.alert('Error', 'Ingresa tu ID de cuenta Stripe');
      return;
    }

    if (!accountId.startsWith('acct_')) {
      Alert.alert('Formato inválido', 'El ID debe comenzar con "acct_"');
      return;
    }

    setIsLoading(true);
    try {
      await setApiKey(DEFAULT_API_KEY);
      const account = await loginWithStripeAccount(accountId.trim(), DEFAULT_API_KEY);

      if (account) {
        // Register this device with biometrics
        await registerDeviceWithBiometrics({
          accountId: account.id,
          businessName: account.business_profile?.name || 'Mi Negocio',
          phone: account.business_profile?.support_phone || '',
          email: account.email || '',
        });
        
        setShowSuccess(true);
        setTimeout(() => {
          setAccount({
            id: account.id,
            email: account.email || '',
            business_name: account.business_profile?.name || 'Mi Negocio',
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Account ID login error:', error);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error: any) => {
    const errorDetail = error.response?.data?.detail || '';
    let errorMessage = 'No se pudo verificar la cuenta. Intenta nuevamente.';
    
    if (error.response?.status === 404) {
      errorMessage = 'Cuenta no encontrada. Verifica los datos.';
    } else if (error.response?.status === 400 && errorDetail.includes('does not have access')) {
      errorMessage = 'Esta cuenta no está conectada a Jeturing Pay.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Error de autenticación. Contacta al administrador.';
    }
    
    Alert.alert('Error', errorMessage);
  };

  // Success screen
  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <AnimationProvider
          name="payment-success"
          visible={true}
          loop={false}
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.successTitle}>¡Bienvenido!</Text>
        <Text style={styles.successText}>
          Tu cuenta ha sido verificada exitosamente
        </Text>
      </View>
    );
  }

  // Loading screen while checking biometrics
  if (isCheckingBiometric) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Verificando opciones de acceso...</Text>
      </View>
    );
  }

  const biometricName = biometricStatus ? getBiometricDisplayName(biometricStatus.biometricType) : 'Biometría';

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
                Accede a tu cuenta de Jeturing Pay
              </Text>
            </View>

            {/* Mode Selector */}
            <View style={styles.modeSelector}>
              {hasCredentials && biometricStatus?.isAvailable && (
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    loginMode === 'biometric' && styles.modeButtonActive
                  ]}
                  onPress={() => setLoginMode('biometric')}
                >
                  <Text style={[
                    styles.modeButtonText,
                    loginMode === 'biometric' && styles.modeButtonTextActive
                  ]}>
                    🔐 {biometricName}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  loginMode === 'business' && styles.modeButtonActive
                ]}
                onPress={() => setLoginMode('business')}
              >
                <Text style={[
                  styles.modeButtonText,
                  loginMode === 'business' && styles.modeButtonTextActive
                ]}>
                  🏢 Negocio
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  loginMode === 'account_id' && styles.modeButtonActive
                ]}
                onPress={() => setLoginMode('account_id')}
              >
                <Text style={[
                  styles.modeButtonText,
                  loginMode === 'account_id' && styles.modeButtonTextActive
                ]}>
                  🔑 ID Cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Biometric Login */}
            {loginMode === 'biometric' && (
              <View style={styles.biometricSection}>
                <View style={styles.biometricIcon}>
                  <Text style={styles.biometricEmoji}>
                    {biometricStatus?.biometricType === 'facial' ? '👤' : '👆'}
                  </Text>
                </View>
                <Text style={styles.biometricTitle}>
                  Acceso rápido con {biometricName}
                </Text>
                <Text style={styles.biometricSubtitle}>
                  Usa tu {biometricName.toLowerCase()} para acceder instantáneamente
                </Text>
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleBiometricLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Usar {biometricName}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Business Search Login */}
            {loginMode === 'business' && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre del Negocio</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Mi Restaurante"
                    placeholderTextColor="#9ca3af"
                    value={businessName}
                    onChangeText={setBusinessName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor="#9ca3af"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                  <Text style={styles.hint}>
                    El teléfono registrado en tu cuenta Stripe
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleBusinessLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Buscar mi cuenta</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Account ID Login (Fallback) */}
            {loginMode === 'account_id' && (
              <View style={styles.form}>
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
                  onPress={handleAccountIdLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Verificar cuenta</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#6366f1',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  biometricSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  biometricIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  biometricEmoji: {
    fontSize: 48,
  },
  biometricTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  biometricSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
    marginTop: 8,
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
    paddingBottom: 40,
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
