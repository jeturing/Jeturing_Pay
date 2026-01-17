import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'OnboardingTapToPay'>;

export default function OnboardingTapToPayScreen({ navigation }: Props) {
  const [tapToPayEnabled, setTapToPayEnabled] = useState(false);

  const handleFinish = () => {
    // Complete onboarding
    navigation.navigate('ConnectAccount');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <Text style={styles.progressText}>Paso 3 de 4</Text>
        <Text style={styles.title}>Configurar Tap to Pay</Text>
        <Text style={styles.subtitle}>
          Permite pagos con NFC directamente desde tu dispositivo
        </Text>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="contactless-payment" size={80} color="#0022FF" />
        </View>

        {/* Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleTitle}>Habilitar Tap to Pay</Text>
            <Text style={styles.toggleSubtitle}>
              Acepta pagos contactless con tu teléfono
            </Text>
          </View>
          <Switch
            value={tapToPayEnabled}
            onValueChange={setTapToPayEnabled}
            trackColor={{ false: '#E2E8F0', true: '#0022FF' }}
            thumbColor="#FFF"
          />
        </View>

        {/* Requirements */}
        {tapToPayEnabled && (
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Permisos requeridos:</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#32D583" />
                <Text style={styles.requirementText}>Acceso a NFC</Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#32D583" />
                <Text style={styles.requirementText}>Ubicación (requerido por Stripe)</Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#32D583" />
                <Text style={styles.requirementText}>Conectividad a internet</Text>
              </View>
            </View>
            
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information" size={20} color="#4551A1" />
              <Text style={styles.infoText}>
                Tu dispositivo debe tener capacidad NFC habilitada
              </Text>
            </View>
          </View>
        )}

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
          <Text style={styles.nextButtonText}>Finalizar</Text>
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  toggleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  requirementsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  requirementsList: {
    gap: 12,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#475569',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0F4FF',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4551A1',
    lineHeight: 18,
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
