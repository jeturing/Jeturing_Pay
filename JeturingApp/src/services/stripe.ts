/**
 * Stripe Service
 * Handles all Stripe Connect operations with 1% Jeturing fee
 */

import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api-001.sajet.us';
const JETURING_FEE_PERCENT = 0.01; // 1% platform fee
const API_KEY_STORAGE = '@jeturing_api_key';

// Helper to get API key
const getApiKey = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(API_KEY_STORAGE);
};

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
 * Uses the onboarding endpoint to create an Express account
 * Automatically sets up 1% platform fee for Jeturing
 */
export const createConnectedAccount = async (
  email: string,
  businessName: string,
  metadata?: Record<string, string>
): Promise<ConnectedAccount> => {
  try {
    const apiKey = await getApiKey();
    
    // Use the correct endpoint: /stripe/onboarding/create-link
    // This endpoint creates a new account if 'account' is not provided
    const response = await axios.post(
      `${API_URL}/stripe/onboarding/create-link`,
      {
        // Don't pass account - this will create a new one
        refresh_url: 'jeturingpay://onboarding/refresh',
        return_url: 'jeturingpay://onboarding/complete',
        type: 'account_onboarding',
      },
      {
        headers: {
          'x-api-key': apiKey || '',
          'Content-Type': 'application/json',
        },
      }
    );

    // The response contains the onboarding URL and account info
    // Extract account ID from the URL (format: /v1/accounts/acct_xxx/...)
    const onboardingUrl = response.data.url;
    const accountIdMatch = onboardingUrl?.match(/acct_[a-zA-Z0-9]+/);
    const accountId = accountIdMatch ? accountIdMatch[0] : `acct_temp_${Date.now()}`;

    // Return a connected account object
    return {
      id: accountId,
      email: email,
      business_name: businessName,
      created: Math.floor(Date.now() / 1000),
      charges_enabled: false, // Will be enabled after onboarding
      payouts_enabled: false, // Will be enabled after onboarding
    };
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
