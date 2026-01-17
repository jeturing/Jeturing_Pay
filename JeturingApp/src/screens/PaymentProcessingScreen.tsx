import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type PaymentProcessingScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ params: { amount: number; paymentMethod: string } }, 'params'>;
};

type PaymentStatus = 'processing' | 'success' | 'error';

const PaymentProcessingScreen: React.FC<PaymentProcessingScreenProps> = ({ navigation, route }) => {
  const { amount, paymentMethod } = route.params || { amount: 0, paymentMethod: 'Card' };
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('processing');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    // Simulate payment processing
    const processingTimer = setTimeout(() => {
      // 80% success rate for demo
      const isSuccess = Math.random() > 0.2;
      setPaymentStatus(isSuccess ? 'success' : 'error');
      if (isSuccess) {
        // Generate mock transaction ID
        setTransactionId(`TXN${Date.now().toString().slice(-8)}`);
      }
    }, 3000);

    return () => clearTimeout(processingTimer);
  }, []);

  const handleRetry = () => {
    setPaymentStatus('processing');
    const retryTimer = setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      setPaymentStatus(isSuccess ? 'success' : 'error');
      if (isSuccess) {
        setTransactionId(`TXN${Date.now().toString().slice(-8)}`);
      }
    }, 3000);
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.iconContainer}>
              <ActivityIndicator size={80} color="#5A67D8" />
            </View>
            <Text style={styles.statusTitle}>Procesando pago...</Text>
            <Text style={styles.statusSubtitle}>Por favor espera un momento</Text>
            <View style={styles.pulseCircle} />
          </View>
        );

      case 'success':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.iconContainer, styles.successIconContainer]}>
              <MaterialCommunityIcons name="check-circle" size={80} color="#32D583" />
            </View>
            <Text style={[styles.statusTitle, styles.successTitle]}>¡Pago Exitoso!</Text>
            <Text style={styles.statusSubtitle}>La transacción se completó correctamente</Text>
            
            {/* Transaction Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Monto</Text>
                <Text style={styles.detailValue}>${amount.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Método</Text>
                <Text style={styles.detailValue}>{paymentMethod}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Referencia</Text>
                <Text style={[styles.detailValue, styles.monospace]}>{transactionId}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{new Date().toLocaleString('es-ES')}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('SendReceipt', { transactionId, amount })}
              >
                <MaterialCommunityIcons name="email-outline" size={20} color="#5A67D8" />
                <Text style={styles.secondaryButtonText}>Enviar Recibo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Nuevo Cobro</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'error':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.iconContainer, styles.errorIconContainer]}>
              <MaterialCommunityIcons name="alert-circle" size={80} color="#E25950" />
            </View>
            <Text style={[styles.statusTitle, styles.errorTitle]}>Pago Rechazado</Text>
            <Text style={styles.statusSubtitle}>
              No se pudo procesar la transacción
            </Text>

            {/* Error Details */}
            <View style={[styles.detailsCard, styles.errorCard]}>
              <View style={styles.errorContent}>
                <MaterialCommunityIcons name="information-outline" size={24} color="#E25950" />
                <View style={styles.errorTextContainer}>
                  <Text style={styles.errorReasonTitle}>Motivo del rechazo:</Text>
                  <Text style={styles.errorReason}>
                    Fondos insuficientes o tarjeta inválida. Por favor, intenta con otro método de pago.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#64748B" />
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRetry}
              >
                <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {paymentStatus !== 'processing' && (
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <MaterialCommunityIcons name="close" size={24} color="#0C0E1D" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.brandingContainer}>
          <Text style={styles.poweredBy}>Powered by</Text>
          <Text style={styles.brandName}>Jeturing CORE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statusContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  successIconContainer: {
    backgroundColor: 'rgba(50, 213, 131, 0.1)',
  },
  errorIconContainer: {
    backgroundColor: 'rgba(226, 89, 80, 0.1)',
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#5A67D8',
    opacity: 0.3,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C0E1D',
    marginBottom: 12,
    textAlign: 'center',
  },
  successTitle: {
    color: '#32D583',
  },
  errorTitle: {
    color: '#E25950',
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#0C0E1D',
    fontWeight: '600',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E8F4',
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE',
  },
  errorContent: {
    flexDirection: 'row',
    gap: 16,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorReasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E25950',
    marginBottom: 8,
  },
  errorReason: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#0022FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E6E8F4',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A67D8',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  poweredBy: {
    fontSize: 12,
    color: '#B0B8E0',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A67D8',
  },
});

export default PaymentProcessingScreen;
