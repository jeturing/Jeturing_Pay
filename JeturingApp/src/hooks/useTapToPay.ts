/**
 * Tap to Pay Hook
 * React hook for handling Tap to Pay functionality on iOS and Android
 */

import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { useStripeTerminal } from '@stripe/stripe-react-native';
import { processPayment } from '@services/stripe';

export interface TapToPayResult {
  success: boolean;
  paymentIntentId?: string;
  amount?: number;
  error?: string;
}

/**
 * Custom hook for Tap to Pay operations
 * Handles NFC-based contactless payments
 */
export const useTapToPay = (accountId: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TapToPayResult | null>(null);
  
  const { initTerminal, collectPaymentMethod, confirmPaymentIntent } = useStripeTerminal();

  /**
   * Initialize Tap to Pay
   * Must be called before processing payments
   */
  const initialize = useCallback(async () => {
    try {
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        throw new Error('Tap to Pay solo disponible en iOS y Android');
      }

      await initTerminal({
        fetchConnectionToken: async () => {
          // Fetch connection token from backend
          const response = await fetch(`https://api.jeturing.com/api/terminal/token/${accountId}`);
          const data = await response.json();
          return data.secret;
        },
        onUnexpectedReaderDisconnect: () => {
          Alert.alert('Desconectado', 'El lector se desconectó inesperadamente');
        }
      });

      return true;
    } catch (error: any) {
      console.error('Error initializing Tap to Pay:', error);
      Alert.alert('Error', 'No se pudo inicializar Tap to Pay');
      return false;
    }
  }, [accountId, initTerminal]);

  /**
   * Process a Tap to Pay transaction
   * @param amount - Amount in cents (e.g., 1000 = $10.00)
   * @param currency - Currency code (default: USD)
   */
  const processTap = useCallback(async (
    amount: number,
    currency: string = 'USD'
  ): Promise<TapToPayResult> => {
    setIsProcessing(true);
    
    try {
      // Step 1: Create payment intent on backend
      const paymentIntent = await processPayment(amount, accountId, currency, {
        payment_method: 'tap_to_pay'
      });

      // Step 2: Collect payment method via NFC
      const { error: collectError, paymentIntent: collectedIntent } = await collectPaymentMethod({
        paymentIntent: paymentIntent.client_secret,
      });

      if (collectError) {
        throw new Error(collectError.message);
      }

      // Step 3: Confirm the payment
      const { error: confirmError, paymentIntent: confirmedIntent } = await confirmPaymentIntent({
        paymentIntent: collectedIntent!
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      const result: TapToPayResult = {
        success: true,
        paymentIntentId: confirmedIntent!.id,
        amount
      };

      setLastTransaction(result);
      Alert.alert('¡Éxito!', `Pago de $${(amount / 100).toFixed(2)} procesado correctamente`);
      
      return result;
    } catch (error: any) {
      console.error('Error processing Tap to Pay:', error);
      
      const result: TapToPayResult = {
        success: false,
        error: error.message || 'Error desconocido'
      };

      setLastTransaction(result);
      Alert.alert('Error de Pago', error.message || 'No se pudo procesar el pago');
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [accountId, collectPaymentMethod, confirmPaymentIntent]);

  /**
   * Cancel an in-progress payment
   */
  const cancelPayment = useCallback(async () => {
    try {
      // Cancel the payment collection
      setIsProcessing(false);
      Alert.alert('Cancelado', 'Pago cancelado por el usuario');
    } catch (error: any) {
      console.error('Error canceling payment:', error);
    }
  }, []);

  return {
    initialize,
    processTap,
    cancelPayment,
    isProcessing,
    lastTransaction
  };
};

export default useTapToPay;
