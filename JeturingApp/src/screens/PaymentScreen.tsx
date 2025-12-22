/**
 * Payment Screen  
 * Main payment processing screen with Tap to Pay
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStripeAccount } from '../contexts/StripeAccountContext';
import { useTapToPay } from '../hooks/useTapToPay';
import AnimationProvider from '../components/AnimationProvider';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const { account } = useStripeAccount();
  const { processTap, isProcessing } = useTapToPay(account?.id || '');

  const [amount, setAmount] = useState('');

  const handlePayment = async () => {
    const amountCents = parseFloat(amount) * 100;

    if (!amountCents || amountCents <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      const result = await processTap(amountCents);

      if (result.success) {
        navigation.navigate('PaymentSuccess' as never, {
          paymentIntentId: result.paymentIntentId,
          amount: amountCents,
          currency: 'USD',
        } as never);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el pago');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cobrar con Tap to Pay</Text>

        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!isProcessing}
        />

        {isProcessing && (
          <AnimationProvider
            name="loading-spin"
            visible={true}
            loop={true}
            style={{ width: 100, height: 100 }}
          />
        )}

        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Procesando...' : 'Cobrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1f2937',
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    textAlign: 'center',
    width: '100%',
    marginBottom: 48,
  },
  button: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default PaymentScreen;
