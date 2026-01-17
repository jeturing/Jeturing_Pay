import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Numpad'>;

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 80) / 3;

export default function NumpadScreen({ navigation }: Props) {
  const [amount, setAmount] = useState('0');

  const handleNumberPress = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      const parts = amount.split('.');
      if (num === '.' && parts.length > 1) return;
      if (parts.length > 1 && parts[1].length >= 2) return;
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleContinue = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0) {
      navigation.navigate('PaymentModeSelection', { amount: amountNum });
    }
  };

  const formatDisplayAmount = () => {
    const num = parseFloat(amount);
    return num.toFixed(2);
  };

  const renderButton = (value: string) => (
    <TouchableOpacity
      key={value}
      style={styles.numpadButton}
      onPress={() => handleNumberPress(value)}
    >
      <Text style={styles.numpadButtonText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <MaterialCommunityIcons name="credit-card-settings" size={24} color="#94A3B8" />
          <Text style={styles.brandText}>Jeturing</Text>
        </View>

        <Text style={styles.label}>Monto a cobrar</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>USD</Text>
          <Text style={styles.amount}>{formatDisplayAmount()}</Text>
        </View>
      </View>

      {/* Numpad Grid */}
      <View style={styles.numpadContainer}>
        <View style={styles.numpadRow}>
          {renderButton('1')}
          {renderButton('2')}
          {renderButton('3')}
        </View>
        <View style={styles.numpadRow}>
          {renderButton('4')}
          {renderButton('5')}
          {renderButton('6')}
        </View>
        <View style={styles.numpadRow}>
          {renderButton('7')}
          {renderButton('8')}
          {renderButton('9')}
        </View>
        <View style={styles.numpadRow}>
          {renderButton('.')}
          {renderButton('0')}
          <TouchableOpacity
            style={styles.numpadButton}
            onPress={handleBackspace}
          >
            <MaterialCommunityIcons name="backspace" size={30} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            parseFloat(amount) === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={parseFloat(amount) === 0}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  header: {
    flex: 1,
    paddingTop: 48,
    paddingBottom: 48,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  label: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currency: {
    fontSize: 28,
    fontWeight: '500',
    color: '#94A3B8',
  },
  amount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  numpadContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numpadButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BUTTON_SIZE / 2,
  },
  numpadButtonText: {
    fontSize: 30,
    fontWeight: '500',
    color: '#0F172A',
  },
  footer: {
    paddingVertical: 24,
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 20,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
