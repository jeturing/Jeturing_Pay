/**
 * FeatureFlagsDebugPanel
 * 
 * Panel de debug para visualizar y modificar feature flags en desarrollo
 * Solo visible cuando showDebugInfo está habilitado
 * 
 * Uso:
 *   <FeatureGate flag="showDebugInfo">
 *     <FeatureFlagsDebugPanel />
 *   </FeatureGate>
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  featureFlagService,
  FeatureFlagKey,
} from '../services/featureFlags';

const FLAG_DESCRIPTIONS: Record<FeatureFlagKey, string> = {
  enableTapToPay: 'Pagos Tap to Pay',
  enablePaymentLinks: 'Enlaces de pago',
  enableQRPayments: 'Pagos por QR',
  enableRefunds: 'Reembolsos',
  enableAnalytics: 'Dashboard de analíticas',
  enableMPOS: 'Modo MPOS',
  enableTerminal: 'Terminales físicas',
  showDebugInfo: 'Panel de debug',
  maintenanceMode: 'Modo mantenimiento',
  enableBetaFeatures: 'Funciones beta',
};

const ALL_FLAGS: FeatureFlagKey[] = [
  'enableTapToPay',
  'enablePaymentLinks',
  'enableQRPayments',
  'enableRefunds',
  'enableAnalytics',
  'enableMPOS',
  'enableTerminal',
  'showDebugInfo',
  'maintenanceMode',
  'enableBetaFeatures',
];

export function FeatureFlagsDebugPanel() {
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>({} as any);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar flags iniciales
  useEffect(() => {
    loadFlags();

    // Suscribirse a cambios
    const unsubscribe = featureFlagService.subscribeToChanges(() => {
      loadFlags();
    });

    return () => unsubscribe();
  }, []);

  const loadFlags = () => {
    const currentFlags: Record<FeatureFlagKey, boolean> = {} as any;
    for (const flag of ALL_FLAGS) {
      currentFlags[flag] = featureFlagService.getFlag(flag);
    }
    setFlags(currentFlags);
  };

  const handleToggle = async (flag: FeatureFlagKey, value: boolean) => {
    try {
      await featureFlagService.setLocalOverride(flag, value);
      setFlags((prev) => ({ ...prev, [flag]: value }));
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el flag');
    }
  };

  const handleRefreshFromRemote = async () => {
    setIsRefreshing(true);
    try {
      await featureFlagService.refreshFromRemote();
      loadFlags();
      Alert.alert('Éxito', 'Flags actualizados desde el servidor');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar los flags');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚩 Feature Flags</Text>
        <TouchableOpacity
          style={[styles.refreshButton, isRefreshing && styles.refreshButtonDisabled]}
          onPress={handleRefreshFromRemote}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? '⏳' : '🔄'} Sync
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {ALL_FLAGS.map((flag) => (
          <View key={flag} style={styles.flagRow}>
            <View style={styles.flagInfo}>
              <Text style={styles.flagName}>{FLAG_DESCRIPTIONS[flag]}</Text>
              <Text style={styles.flagKey}>{flag}</Text>
            </View>
            <Switch
              value={flags[flag] || false}
              onValueChange={(value) => handleToggle(flag, value)}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={flags[flag] ? '#4caf50' : '#f5f5f5'}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ⚠️ Los cambios locales se guardan en este dispositivo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    maxHeight: 380,
  },
  flagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  flagInfo: {
    flex: 1,
    marginRight: 16,
  },
  flagName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  flagKey: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fffbeb',
  },
  footerText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
});

export default FeatureFlagsDebugPanel;
