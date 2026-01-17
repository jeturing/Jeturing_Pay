import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'PaymentModeSelection'>;

interface PaymentMode {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const PAYMENT_MODES: PaymentMode[] = [
  {
    id: 'manual',
    title: 'Entrada Manual',
    description: 'Ingresa los datos de la tarjeta manualmente',
    icon: 'keyboard',
  },
  {
    id: 'tap_to_pay',
    title: 'Tap to Pay',
    description: 'Usa NFC para pagos sin contacto',
    icon: 'contactless-payment',
  },
  {
    id: 'qr_code',
    title: 'Código QR',
    description: 'Genera un código QR para que el cliente escanee',
    icon: 'qrcode',
  },
  {
    id: 'payment_link',
    title: 'Link de Pago',
    description: 'Envía un enlace al cliente',
    icon: 'link',
  },
];

export default function PaymentModeSelectionScreen({ navigation, route }: Props) {
  const { amount } = route.params || { amount: 0 };
  const [selectedMode, setSelectedMode] = useState('manual');

  const handleContinue = () => {
    switch (selectedMode) {
      case 'manual':
        navigation.navigate('Payment', { amount });
        break;
      case 'tap_to_pay':
        // Navigate to Tap to Pay screen
        navigation.navigate('Payment', { amount, mode: 'tap_to_pay' });
        break;
      case 'qr_code':
        // Navigate to QR code generation
        navigation.navigate('PaymentLink', { amount, mode: 'qr' });
        break;
      case 'payment_link':
        // Navigate to payment link screen
        navigation.navigate('PaymentLink', { amount });
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Selecciona modo de cobro</Text>
        <Text style={styles.subtitle}>
          Monto: <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        </Text>

        {/* Payment Modes */}
        <View style={styles.modesContainer}>
          {PAYMENT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                selectedMode === mode.id && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode(mode.id)}
            >
              <View style={styles.modeContent}>
                <View style={[
                  styles.iconContainer,
                  selectedMode === mode.id && styles.iconContainerSelected,
                ]}>
                  <MaterialCommunityIcons
                    name={mode.icon as any}
                    size={28}
                    color={selectedMode === mode.id ? '#0022FF' : '#64748B'}
                  />
                </View>
                <View style={styles.modeTextContainer}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={selectedMode === mode.id ? 'radiobox-marked' : 'radiobox-blank'}
                size={24}
                color={selectedMode === mode.id ? '#0022FF' : '#CBD5E1'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
  },
  amount: {
    fontWeight: '600',
    color: '#0F172A',
  },
  modesContainer: {
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  modeCardSelected: {
    borderColor: '#0022FF',
    backgroundColor: '#F0F4FF',
  },
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#EEF2FF',
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  continueButton: {
    backgroundColor: '#0022FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
