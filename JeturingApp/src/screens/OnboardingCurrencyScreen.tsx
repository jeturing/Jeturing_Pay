import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'OnboardingCurrency'>;

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
];

export default function OnboardingCurrencyScreen({ navigation }: Props) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const handleNext = () => {
    // Save selected currency
    navigation.navigate('OnboardingTapToPay');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <TouchableOpacity
      style={[
        styles.currencyCard,
        selectedCurrency === item.code && styles.currencyCardSelected,
      ]}
      onPress={() => setSelectedCurrency(item.code)}
    >
      <View style={styles.currencyContent}>
        <Text style={styles.currencyFlag}>{item.flag}</Text>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyCode}>{item.code}</Text>
          <Text style={styles.currencyName}>{item.name}</Text>
        </View>
      </View>
      <MaterialCommunityIcons
        name={selectedCurrency === item.code ? 'radiobox-marked' : 'radiobox-blank'}
        size={24}
        color={selectedCurrency === item.code ? '#0022FF' : '#CBD5E1'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.skipText}>Skip &gt;</Text>
        </View>

        {/* Progress */}
        <Text style={styles.progressText}>Paso 2 de 4</Text>
        <Text style={styles.title}>Selecciona tu moneda</Text>
        <Text style={styles.subtitle}>
          Elige la moneda principal para tus transacciones
        </Text>

        {/* Currency List */}
        <FlatList
          data={CURRENCIES}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item.code}
          scrollEnabled={false}
          contentContainerStyle={styles.currencyList}
        />

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Siguiente</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5A67D8',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    lineHeight: 24,
  },
  currencyList: {
    gap: 12,
  },
  currencyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  currencyCardSelected: {
    borderColor: '#0022FF',
    backgroundColor: '#F0F4FF',
  },
  currencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currencyFlag: {
    fontSize: 32,
  },
  currencyInfo: {
    gap: 4,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  currencyName: {
    fontSize: 14,
    color: '#64748B',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#0F172A',
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#0022FF',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
