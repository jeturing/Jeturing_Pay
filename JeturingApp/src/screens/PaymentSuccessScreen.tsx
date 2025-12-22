/**
 * Payment Success Screen
 * Shows QR for customer registration or phone input for existing customers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import AnimationProvider from '../components/AnimationProvider';
import {
  generateCustomerRegistrationQR,
  lookupCustomerByPhone,
  sendInvoiceToCustomer,
} from '../services/customer';
import { useStripeAccount } from '../contexts/StripeAccountContext';

type RouteParams = {
  PaymentSuccess: {
    paymentIntentId: string;
    amount: number;
    currency: string;
  };
};

const PaymentSuccessScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'PaymentSuccess'>>();
  const navigation = useNavigation();
  const { account } = useStripeAccount();

  const { paymentIntentId, amount, currency } = route.params;

  const [showQR, setShowQR] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    if (account) {
      // Generate QR data on mount
      const url = generateCustomerRegistrationQR(
        paymentIntentId,
        account.id,
        amount
      );
      setQrData(url);
    }
  }, [paymentIntentId, amount, account]);

  const handleShowQR = () => {
    setShowQR(true);
    setShowPhoneInput(false);
  };

  const handleShowPhoneInput = () => {
    setShowPhoneInput(true);
    setShowQR(false);
  };

  const handleSendInvoice = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono');
      return;
    }

    if (!account) return;

    setIsProcessing(true);

    try {
      const success = await sendInvoiceToCustomer(
        paymentIntentId,
        phone,
        account.id
      );

      if (success) {
        setTimeout(() => {
          navigation.navigate('Dashboard' as never);
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la factura');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (cents: number, curr: string) => {
    const symbol = curr === 'USD' ? '$' : curr;
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Animation */}
        <AnimationProvider
          name="payment-success"
          visible={true}
          loop={false}
          style={{ width: 150, height: 150 }}
        />

        <Text style={styles.title}>¡Pago Exitoso!</Text>
        <Text style={styles.amount}>{formatAmount(amount, currency)}</Text>

        <Text style={styles.subtitle}>
          ¿Deseas enviar la factura al cliente?
        </Text>

        {/* Option Buttons */}
        {!showQR && !showPhoneInput && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleShowQR}
            >
              <Text style={styles.optionTitle}>📱 Cliente Nuevo</Text>
              <Text style={styles.optionDescription}>
                Genera un QR para que el cliente registre sus datos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleShowPhoneInput}
            >
              <Text style={styles.optionTitle}>👤 Cliente Existente</Text>
              <Text style={styles.optionDescription}>
                Ingresa el teléfono del cliente para enviar la factura
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('Dashboard' as never)}
            >
              <Text style={styles.skipText}>Omitir y continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* QR Code Display */}
        {showQR && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>
              El cliente debe escanear este QR
            </Text>

            <View style={styles.qrWrapper}>
              {qrData ? (
                <QRCode value={qrData} size={250} />
              ) : (
                <Text>Generando QR...</Text>
              )}
            </View>

            <Text style={styles.qrInstructions}>
              El cliente podrá ingresar su correo y teléfono.{'\n'}
              La factura se enviará automáticamente.
            </Text>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.navigate('Dashboard' as never)}
            >
              <Text style={styles.doneButtonText}>Finalizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowQR(false)}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phone Input */}
        {showPhoneInput && (
          <View style={styles.phoneContainer}>
            <Text style={styles.phoneTitle}>
              Ingresa el teléfono del cliente
            </Text>

            <TextInput
              style={styles.phoneInput}
              placeholder="+1 234 567 8900"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isProcessing}
            />

            {isProcessing && (
              <AnimationProvider
                name="loading-spin"
                visible={true}
                loop={true}
                style={{ width: 60, height: 60 }}
              />
            )}

            <TouchableOpacity
              style={[
                styles.sendButton,
                isProcessing && styles.sendButtonDisabled,
              ]}
              onPress={handleSendInvoice}
              disabled={isProcessing}
            >
              <Text style={styles.sendButtonText}>
                {isProcessing ? 'Enviando...' : 'Enviar Factura'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowPhoneInput(false)}
              disabled={isProcessing}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6366f1',
  },
  qrContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  phoneContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  phoneTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  phoneInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    textAlign: 'center',
  },
  sendButton: {
    width: '100%',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
  },
});

export default PaymentSuccessScreen;
