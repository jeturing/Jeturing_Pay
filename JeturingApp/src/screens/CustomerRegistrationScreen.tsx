/**
 * Customer Registration Screen
 * Form for customers to register via QR code scan
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
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { createCustomer, generateInvoice } from '../services/customer';
import AnimationProvider from '../components/AnimationProvider';

type RouteParams = {
  CustomerRegistration: {
    payment_intent: string;
    account: string;
    amount: string;
  };
};

const CustomerRegistrationScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'CustomerRegistration'>>();
  const navigation = useNavigation();

  const { payment_intent, account, amount } = route.params || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    // Validate inputs
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!payment_intent || !account) {
      Alert.alert('Error', 'Datos de pago incompletos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create customer
      const customer = await createCustomer(
        email,
        phone,
        name,
        account,
        {
          payment_intent: payment_intent,
          amount: amount
        }
      );

      // Generate and send invoice
      await generateInvoice(payment_intent, customer.id, account);

      setIsSuccess(true);

      Alert.alert(
        '¡Listo!',
        `Gracias ${name}. Se ha enviado la factura a ${email}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Could redirect to a thank you page
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        'No se pudo procesar tu registro. Intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formatAmount = (cents: string) => {
    const amount = parseInt(cents || '0');
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <AnimationProvider
          name="payment-success"
          visible={true}
          loop={false}
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.successTitle}>¡Registro Exitoso!</Text>
        <Text style={styles.successText}>
          Hemos enviado tu factura a{'\n'}
          {email}
        </Text>
        <Text style={styles.successAmount}>
          Monto: {formatAmount(amount)}
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
            <Text style={styles.logo}>Jeturing Pay</Text>
            <Text style={styles.title}>Registro de Cliente</Text>
            <Text style={styles.subtitle}>
              Ingresa tus datos para recibir tu factura
            </Text>
            {amount && (
              <Text style={styles.amountText}>
                Monto: {formatAmount(amount)}
              </Text>
            )}
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
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
                editable={!isSubmitting}
              />
            </View>
          </View>

          {isSubmitting && (
            <View style={styles.loadingContainer}>
              <AnimationProvider
                name="loading-spin"
                visible={true}
                loop={true}
                style={{ width: 80, height: 80 }}
              />
              <Text style={styles.loadingText}>Procesando...</Text>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Enviando...' : 'Recibir Factura'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.privacy}>
              Tu información será utilizada únicamente para enviarte la factura.
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  form: {
    gap: 24,
    marginBottom: 32,
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
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  footer: {
    gap: 16,
  },
  button: {
    backgroundColor: '#10b981',
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
  privacy: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 16,
  },
  successAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
});

export default CustomerRegistrationScreen;
