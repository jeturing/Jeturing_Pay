/**
 * Dashboard Screen
 * Main screen showing account summary and quick actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStripeAccount } from '../contexts/StripeAccountContext';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { account } = useStripeAccount();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Jeturing Pay</Text>
          <Text style={styles.subtitle}>{account?.business_name}</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Payment' as never)}
          >
            <Text style={styles.actionText}>💳 Cobrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PaymentLink' as never)}
          >
            <Text style={styles.actionText}>🔗 Link de Pago</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <Text style={styles.sectionText}>Ventas hoy: $0.00</Text>
          <Text style={styles.sectionText}>Comisión Jeturing (1%): $0.00</Text>
        </View>
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
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  summary: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default DashboardScreen;
