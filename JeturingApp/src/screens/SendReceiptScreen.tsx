import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

type SendReceiptScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ params: { transactionId: string; amount: number } }, 'params'>;
};

const SendReceiptScreen: React.FC<SendReceiptScreenProps> = ({ navigation, route }) => {
  const { transactionId, amount } = route.params || { transactionId: '', amount: 0 };
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [sendingMethod, setSendingMethod] = useState<'email' | 'sms' | null>(null);

  const receiptLink = `https://jeturing.com/receipt/${transactionId}`;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const sendViaEmail = async () => {
    if (!validateEmail(email)) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setSendingMethod('email');
    // Simulate sending email
    setTimeout(() => {
      setSendingMethod(null);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('Dashboard');
      }, 2000);
    }, 1500);
  };

  const sendViaSMS = async () => {
    if (!validatePhone(phone)) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setSendingMethod('sms');
    // Simulate sending SMS
    setTimeout(() => {
      setSendingMethod(null);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('Dashboard');
      }, 2000);
    }, 1500);
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(receiptLink);
    // Show brief success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  const shareReceipt = async () => {
    try {
      await Share.share({
        message: `Tu recibo de compra está listo. Monto: $${amount.toFixed(2)}. Ver recibo: ${receiptLink}`,
        url: receiptLink,
        title: 'Recibo de Compra',
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C0E1D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enviar Recibo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transaction Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="receipt" size={32} color="#5A67D8" />
          </View>
          <Text style={styles.summaryAmount}>${amount.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Transacción #{transactionId}</Text>
        </View>

        {/* Send via Email */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#5A67D8" />
            <Text style={styles.sectionTitle}>Enviar por Correo Electrónico</Text>
          </View>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#B0B8E0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !email && styles.sendButtonDisabled]}
            onPress={sendViaEmail}
            disabled={!email || sendingMethod === 'email'}
          >
            {sendingMethod === 'email' ? (
              <>
                <MaterialCommunityIcons name="loading" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Enviando...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Enviar Email</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Send via SMS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="message-text-outline" size={20} color="#5A67D8" />
            <Text style={styles.sectionTitle}>Enviar por SMS</Text>
          </View>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="phone" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#B0B8E0"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !phone && styles.sendButtonDisabled]}
            onPress={sendViaSMS}
            disabled={!phone || sendingMethod === 'sms'}
          >
            {sendingMethod === 'sms' ? (
              <>
                <MaterialCommunityIcons name="loading" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Enviando...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Enviar SMS</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Share Options */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#5A67D8" />
            <Text style={styles.sectionTitle}>Otras Opciones</Text>
          </View>

          {/* Receipt Link */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>Enlace del recibo:</Text>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>{receiptLink}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyLink}>
                <MaterialCommunityIcons name="content-copy" size={18} color="#5A67D8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={shareReceipt}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#5A67D8" />
            <Text style={styles.shareButtonText}>Compartir Recibo</Text>
          </TouchableOpacity>
        </View>

        {/* Success/Error Messages */}
        {showSuccess && (
          <View style={styles.messageContainer}>
            <View style={[styles.message, styles.successMessage]}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#32D583" />
              <Text style={styles.successText}>
                {sendingMethod ? 'Recibo enviado correctamente' : 'Enlace copiado'}
              </Text>
            </View>
          </View>
        )}

        {showError && (
          <View style={styles.messageContainer}>
            <View style={[styles.message, styles.errorMessage]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#E25950" />
              <Text style={styles.errorText}>
                Por favor verifica el {sendingMethod === 'email' ? 'correo electrónico' : 'número de teléfono'}
              </Text>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#5A67D8" />
          <Text style={styles.infoText}>
            El cliente recibirá un enlace para ver y descargar el recibo de esta transacción.
          </Text>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.skipButtonText}>Omitir y Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8F4',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C0E1D',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6E8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0C0E1D',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C0E1D',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E8F4',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: '#0C0E1D',
  },
  sendButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#0022FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B8E0',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  linkContainer: {
    marginBottom: 12,
  },
  linkLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E6E8F4',
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: '#5A67D8',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  shareButton: {
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
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A67D8',
  },
  messageContainer: {
    marginBottom: 16,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  successMessage: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  errorMessage: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#32D583',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#E25950',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4551A1',
    lineHeight: 20,
  },
  skipButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default SendReceiptScreen;
