/**
 * Onboarding Screen
 * Welcome screen with Lottie animation and Jeturing Pay branding
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimationProvider from '../components/AnimationProvider';

const OnboardingScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <AnimationProvider
            name="onboarding"
            visible={true}
            loop={true}
            style={{ width: 300, height: 300 }}
          />
        </View>

        <Text style={styles.title}>Bienvenido a Jeturing Pay</Text>
        <Text style={styles.subtitle}>
          La forma más simple de recibir pagos con tu negocio
        </Text>

        <View style={styles.features}>
          <FeatureItem text="✓ Cobra con tarjeta sin contacto (Tap to Pay)" />
          <FeatureItem text="✓ Genera links de pago compartibles" />
          <FeatureItem text="✓ Historial completo de transacciones" />
          <FeatureItem text="✓ Comisión plataforma solo 1%" />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ConnectAccount' as never)}
        >
          <Text style={styles.buttonText}>Activar cuenta Jeturing Pay</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          Al continuar, aceptas los Términos y Condiciones
        </Text>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <Text style={styles.featureText}>{text}</Text>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  features: {
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
