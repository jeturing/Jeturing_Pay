/**
 * Connect Account Screen
 * Creates Jeturing Pay connected account (no Stripe branding visible)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStripeAccount } from '../contexts/StripeAccountContext';
import { createConnectedAccount } from '../services/stripe';
import AnimationProvider from '../components/AnimationProvider';

const ConnectAccountScreen = () => {
  const navigation = useNavigation();
  const { setAccount } = useStripeAccount();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConnect = async () => {
    if (!businessName || !email || !phone) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      const account = await createConnectedAccount(email, businessName, {
        phone,
        platform: 'jeturing_pay_mobile',
      });

      setShowSuccess(true);

      // Wait for animation, then save account
      setTimeout(() => {
        setAccount({
          id: account.id,
          email: email,
          business_name: businessName,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        });
      }, 2000);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        'Error',
        'No se pudo activar tu cuenta. Intenta nuevamente.'
      );
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
        <Text style={styles.successTitle}>¡Cuenta activada!</Text>
        <Text style={styles.successText}>
          Tu cuenta Jeturing Pay está lista para recibir pagos
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Activa tu cuenta</Text>
            <Text style={styles.subtitle}>
              Ingresa los datos de tu negocio para comenzar
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre del negocio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Tienda El Sol"
                value={businessName}
                onChangeText={setBusinessName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 234 567 8900"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <AnimationProvider
                name="loading-spin"
                visible={true}
                loop={true}
                style={{ width: 80, height: 80 }}
              />
              <Text style={styles.loadingText}>Activando cuenta...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Procesando...' : 'Activar cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  backText: {
    fontSize: 16,
    color: '#6366f1',
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ConnectAccountScreen;
