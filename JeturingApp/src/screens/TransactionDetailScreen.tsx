/**
 * Transaction Detail Screen
 * Detailed view of a single transaction with actions
 * 
 * @module TransactionDetailScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStripeAccount } from '../contexts/StripeAccountContext';
import { createRefund } from '../services/stripe';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
  customer?: string;
  receipt_url?: string;
  payment_method_types: string[];
  application_fee_amount?: number;
  metadata?: Record<string, string>;
}

type RouteParams = {
  TransactionDetail: { transaction: Transaction };
};

const TransactionDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'TransactionDetail'>>();
  const navigation = useNavigation();
  const { account } = useStripeAccount();
  const { transaction } = route.params;
  
  const [refunding, setRefunding] = useState(false);

  // Format currency
  const formatCurrency = (cents: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status info
  const getStatusInfo = (status: string): { color: string; label: string; bgColor: string; icon: string } => {
    switch (status) {
      case 'succeeded':
        return { color: '#059669', label: 'Pago Exitoso', bgColor: '#d1fae5', icon: '✓' };
      case 'pending':
      case 'processing':
        return { color: '#d97706', label: 'Pendiente', bgColor: '#fef3c7', icon: '⏳' };
      case 'canceled':
        return { color: '#dc2626', label: 'Cancelado', bgColor: '#fee2e2', icon: '✕' };
      case 'requires_payment_method':
        return { color: '#6b7280', label: 'Incompleto', bgColor: '#f3f4f6', icon: '!' };
      default:
        return { color: '#6b7280', label: status, bgColor: '#f3f4f6', icon: '?' };
    }
  };

  // Handle refund
  const handleRefund = async () => {
    Alert.alert(
      'Confirmar Reembolso',
      `¿Estás seguro de que deseas reembolsar ${formatCurrency(transaction.amount, transaction.currency)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reembolsar',
          style: 'destructive',
          onPress: async () => {
            if (!account?.id) return;
            
            setRefunding(true);
            try {
              await createRefund(transaction.id, account.id);
              Alert.alert('Éxito', 'El reembolso ha sido procesado');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo procesar el reembolso');
            } finally {
              setRefunding(false);
            }
          },
        },
      ]
    );
  };

  // Open receipt
  const handleOpenReceipt = () => {
    if (transaction.receipt_url) {
      Linking.openURL(transaction.receipt_url);
    }
  };

  const statusInfo = getStatusInfo(transaction.status);
  const netAmount = transaction.amount - (transaction.application_fee_amount || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: statusInfo.bgColor }]}>
        <View style={[styles.statusIcon, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusIconText}>{statusInfo.icon}</Text>
        </View>
        <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
        <Text style={styles.amount}>
          {formatCurrency(transaction.amount, transaction.currency)}
        </Text>
        <Text style={styles.dateText}>{formatDate(transaction.created)}</Text>
      </View>

      {/* Transaction Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles de la Transacción</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID de Transacción</Text>
          <Text style={styles.detailValue} selectable>{transaction.id}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Método de Pago</Text>
          <Text style={styles.detailValue}>
            {transaction.payment_method_types[0]?.replace('_', ' ') || 'Tarjeta'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Moneda</Text>
          <Text style={styles.detailValue}>{transaction.currency.toUpperCase()}</Text>
        </View>

        {transaction.description && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descripción</Text>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>
          </>
        )}

        {transaction.customer && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cliente</Text>
              <Text style={styles.detailValue} selectable>{transaction.customer}</Text>
            </View>
          </>
        )}
      </View>

      {/* Financial Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Desglose Financiero</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Monto Cobrado</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(transaction.amount, transaction.currency)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Comisión Jeturing (1%)</Text>
          <Text style={[styles.detailValue, styles.feeValue]}>
            -{formatCurrency(transaction.application_fee_amount || 0, transaction.currency)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, styles.netLabel]}>Monto Neto</Text>
          <Text style={[styles.detailValue, styles.netValue]}>
            {formatCurrency(netAmount, transaction.currency)}
          </Text>
        </View>
      </View>

      {/* Metadata */}
      {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Adicional</Text>
          {Object.entries(transaction.metadata).map(([key, value], index) => (
            <React.Fragment key={key}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{key}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {transaction.receipt_url && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenReceipt}
          >
            <Text style={styles.actionButtonIcon}>🧾</Text>
            <Text style={styles.actionButtonText}>Ver Recibo</Text>
          </TouchableOpacity>
        )}

        {transaction.status === 'succeeded' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.refundButton]}
            onPress={handleRefund}
            disabled={refunding}
          >
            {refunding ? (
              <ActivityIndicator color="#dc2626" size="small" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>↩️</Text>
                <Text style={[styles.actionButtonText, styles.refundButtonText]}>
                  Reembolsar
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          ¿Tienes problemas con esta transacción?{' '}
          <Text 
            style={styles.helpLink}
            onPress={() => Linking.openURL('mailto:soporte@jeturing.com')}
          >
            Contacta soporte
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingBottom: 40,
  },

  // Status Header
  statusHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusIconText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },

  // Financial
  feeValue: {
    color: '#dc2626',
  },
  netLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  netValue: {
    fontWeight: '700',
    color: '#059669',
    fontSize: 16,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  refundButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  refundButtonText: {
    color: '#dc2626',
  },

  // Help
  helpContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  helpLink: {
    color: '#6366f1',
    fontWeight: '600',
  },
});

export default TransactionDetailScreen;
