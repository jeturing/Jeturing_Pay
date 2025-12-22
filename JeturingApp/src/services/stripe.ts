/**
 * Stripe Service
 * Handles all Stripe Connect operations with 1% Jeturing fee
 */

import axios from 'axios';
import { Alert } from 'react-native';

const API_URL = 'https://api.jeturing.com';
const JETURING_FEE_PERCENT = 0.01; // 1% platform fee

export interface ConnectedAccount {
  id: string;
  email: string;
  business_name: string;
  created: number;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  application_fee_amount: number;
}

export interface PaymentLink {
  id: string;
  url: string;
  amount: number;
  currency: string;
  active: boolean;
}

/**
 * Create a new Stripe Connected Account
 * Automatically sets up 1% platform fee for Jeturing
 */
export const createConnectedAccount = async (
  email: string,
  businessName: string,
  metadata?: Record<string, string>
): Promise<ConnectedAccount> => {
  try {
    const response = await axios.post(`${API_URL}/api/stripe/connect`, {
      email,
      business_name: businessName,
      metadata: {
        platform: 'jeturing',
        ...metadata
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
        tap_to_pay: { requested: true }
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating connected account:', error);
    Alert.alert('Error', 'No se pudo crear la cuenta. Intenta nuevamente.');
    throw error;
  }
};

/**
 * Process a payment with automatic 1% fee to Jeturing
 */
export const processPayment = async (
  amount: number,
  accountId: string,
  currency: string = 'USD',
  metadata?: Record<string, string>
): Promise<PaymentIntent> => {
  try {
    // Calculate 1% application fee
    const applicationFeeAmount = Math.round(amount * JETURING_FEE_PERCENT);

    const response = await axios.post(`${API_URL}/api/payments/${accountId}`, {
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      metadata: {
        jeturing_fee: applicationFeeAmount.toString(),
        ...metadata
      },
      payment_method_types: ['card'],
      capture_method: 'automatic'
    });

    return response.data;
  } catch (error: any) {
    console.error('Error processing payment:', error);
    Alert.alert('Error de Pago', 'No se pudo procesar el pago. Verifica los datos.');
    throw error;
  }
};

/**
 * Create a payment link that can be shared
 */
export const createPaymentLink = async (
  amount: number,
  accountId: string,
  currency: string = 'USD',
  description?: string
): Promise<PaymentLink> => {
  try {
    const applicationFeeAmount = Math.round(amount * JETURING_FEE_PERCENT);

    const response = await axios.post(`${API_URL}/api/payment-links/${accountId}`, {
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      description: description || `Pago de $${(amount / 100).toFixed(2)}`,
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'jeturing://payment-success'
        }
      },
      metadata: {
        jeturing_fee: applicationFeeAmount.toString()
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    Alert.alert('Error', 'No se pudo crear el link de pago.');
    throw error;
  }
};

/**
 * Process a refund
 */
export const createRefund = async (
  paymentIntentId: string,
  accountId: string,
  amount?: number
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/api/refunds/${accountId}`, {
      payment_intent: paymentIntentId,
      amount, // Optional: partial refund
      reverse_transfer: true // Reverses the application fee
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating refund:', error);
    Alert.alert('Error', 'No se pudo procesar el reembolso.');
    throw error;
  }
};

/**
 * Get account balance and fee summary
 */
export const getAccountSummary = async (accountId: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/api/accounts/${accountId}/summary`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching account summary:', error);
    throw error;
  }
};

/**
 * Handle disputes
 */
export const updateDispute = async (
  disputeId: string,
  accountId: string,
  evidence: any
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/api/disputes/${accountId}/${disputeId}`, {
      evidence
    });

    return response.data;
  } catch (error: any) {
    console.error('Error updating dispute:', error);
    Alert.alert('Error', 'No se pudo actualizar la disputa.');
    throw error;
  }
};

export default {
  createConnectedAccount,
  processPayment,
  createPaymentLink,
  createRefund,
  getAccountSummary,
  updateDispute,
  JETURING_FEE_PERCENT
};
