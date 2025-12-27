/**
 * Payment Link Screen
 * Create, share, and manage payment links with QR codes
 * 
 * @module PaymentLinkScreen
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useStripeAccount } from '../contexts/StripeAccountContext';
import { createPaymentLink } from '../services/stripe';

interface PaymentLinkData {
  id: string;
  url: string;
  amount: number;
  currency: string;
  qr_data: string;
  created: number;
}

const PRESET_AMOUNTS = [
  { label: '$5', value: 500 },
  { label: '$10', value: 1000 },
  { label: '$25', value: 2500 },
  { label: '$50', value: 5000 },
  { label: '$100', value: 10000 },
  { label: '$500', value: 50000 },
];

const PaymentLinkScreen: React.FC = () => {
  const { account } = useStripeAccount();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<PaymentLinkData | null>(null);
  const [copied, setCopied] = useState(false);
  
  const qrRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const getAmountInCents = (): number => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  };

  const selectPresetAmount = (value: number) => {
    setAmount((value / 100).toFixed(2));
  };

  const animateSuccess = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCreateLink = async () => {
    const amountInCents = getAmountInCents();
    
    if (amountInCents < 50) {
      Alert.alert('Monto Inválido', 'El monto mínimo es $0.50');
      return;
    }

    if (!account?.id) {
      Alert.alert('Error', 'No hay cuenta conectada');
      return;
    }

    setLoading(true);
    try {
      const link = await createPaymentLink(
        amountInCents,
        account.id,
        'USD',
        description || undefined
      );

      setPaymentLink({
        id: link.id,
        url: link.url,
        amount: amountInCents,
        currency: 'USD',
        qr_data: link.url,
        created: Date.now() / 1000,
      });

      animateSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el link de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!paymentLink?.url) return;
    
    await Clipboard.setStringAsync(paymentLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    if (!paymentLink?.url) return;

    try {
      await Share.share({
        message: `Realiza tu pago de ${formatCurrency(paymentLink.amount)} usando este link: ${paymentLink.url}`,
        url: paymentLink.url,
        title: 'Link de Pago - Jeturing Pay',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleShareQR = async () => {
    if (!qrRef.current) return;
    
    try {
      qrRef.current.toDataURL(async (dataURL: string) => {
        // In a real implementation, you would save and share the image
        Alert.alert('QR Compartido', 'El código QR ha sido guardado');
      });
    } catch (error) {
      console.error('QR share error:', error);
    }
  };

  const handleNewLink = () => {
    setPaymentLink(null);
    setAmount('');
    setDescription('');
    setCustomerEmail('');
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
  };

  // Render QR Code and link info after creation
  if (paymentLink) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.successCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.successHeader}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>¡Link Creado!</Text>
            <Text style={styles.successAmount}>{formatCurrency(paymentLink.amount)}</Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={paymentLink.qr_data}
                size={200}
                color="#1f2937"
                backgroundColor="#ffffff"
                getRef={(ref) => (qrRef.current = ref)}
                logoSize={40}
                logoBackgroundColor="#ffffff"
                logoBorderRadius={8}
              />
            </View>
            <Text style={styles.qrHint}>Escanea para pagar</Text>
          </View>

          {/* Link URL */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>Link de Pago</Text>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>
                {paymentLink.url}
              </Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyLink}
              >
                <Text style={styles.copyButtonText}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Share Actions */}
          <View style={styles.shareActions}>
            <TouchableOpacity 
              style={[styles.shareButton, styles.sharePrimary]}
              onPress={handleShareLink}
            >
              <Text style={styles.shareButtonIcon}>📤</Text>
              <Text style={styles.shareButtonText}>Compartir Link</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.shareButton, styles.shareSecondary]}
              onPress={handleShareQR}
            >
              <Text style={styles.shareButtonIcon}>📱</Text>
              <Text style={[styles.shareButtonText, styles.shareSecondaryText]}>
                Guardar QR
              </Text>
            </TouchableOpacity>
          </View>

          {/* Link Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Detalles</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monto</Text>
              <Text style={styles.detailValue}>{formatCurrency(paymentLink.amount)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Comisión Jeturing</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(Math.round(paymentLink.amount * 0.01))} (1%)
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recibirás</Text>
              <Text style={[styles.detailValue, styles.detailValueBold]}>
                {formatCurrency(paymentLink.amount - Math.round(paymentLink.amount * 0.01))}
              </Text>
            </View>
            {description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Descripción</Text>
                <Text style={styles.detailValue}>{description}</Text>
              </View>
            )}
          </View>

          {/* Create New */}
          <TouchableOpacity 
            style={styles.newLinkButton}
            onPress={handleNewLink}
          >
            <Text style={styles.newLinkButtonText}>Crear Nuevo Link</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    );
  }

  // Render creation form
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear Link de Pago</Text>
          <Text style={styles.subtitle}>
            Genera un link único para recibir pagos
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.inputLabel}>Monto a cobrar</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              maxLength={10}
            />
            <Text style={styles.currencyCode}>USD</Text>
          </View>
        </View>

        {/* Preset Amounts */}
        <View style={styles.presetContainer}>
          <Text style={styles.presetLabel}>Montos rápidos</Text>
          <View style={styles.presetGrid}>
            {PRESET_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.presetButton,
                  getAmountInCents() === preset.value && styles.presetButtonActive,
                ]}
                onPress={() => selectPresetAmount(preset.value)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    getAmountInCents() === preset.value && styles.presetButtonTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Descripción (opcional)</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Servicio de consultoría"
            placeholderTextColor="#9ca3af"
            maxLength={100}
          />
        </View>

        {/* Customer Email */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email del cliente (opcional)</Text>
          <TextInput
            style={styles.textInput}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="cliente@email.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Fee Info */}
        <View style={styles.feeInfo}>
          <Text style={styles.feeInfoText}>
            💡 Comisión de 1% aplicable. 
            {getAmountInCents() > 0 && (
              <Text style={styles.feeHighlight}>
                {` Recibirás ${formatCurrency(getAmountInCents() - Math.round(getAmountInCents() * 0.01))}`}
              </Text>
            )}
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (loading || getAmountInCents() < 50) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateLink}
          disabled={loading || getAmountInCents() < 50}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>
              Crear Link de Pago
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 20,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },

  // Amount Section
  amountSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#6366f1',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },

  // Preset Amounts
  presetContainer: {
    marginBottom: 24,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  presetButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  presetButtonTextActive: {
    color: '#ffffff',
  },

  // Text Inputs
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },

  // Fee Info
  feeInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  feeInfoText: {
    fontSize: 14,
    color: '#0369a1',
  },
  feeHighlight: {
    fontWeight: '600',
    color: '#059669',
  },

  // Create Button
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Success Card
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6366f1',
  },

  // QR Container
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  qrHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },

  // Link Container
  linkContainer: {
    marginBottom: 20,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingLeft: 16,
    overflow: 'hidden',
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  copyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Share Actions
  shareActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  sharePrimary: {
    backgroundColor: '#10b981',
  },
  shareSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  shareButtonIcon: {
    fontSize: 18,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  shareSecondaryText: {
    color: '#374151',
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  detailValueBold: {
    fontWeight: '700',
    color: '#10b981',
  },

  // New Link Button
  newLinkButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newLinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});

export default PaymentLinkScreen;
