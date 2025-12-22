/**
 * Customer Service
 * Manages Stripe Customer creation and invoice generation
 * Using Jeturing API v2.5.0
 */

import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.jeturing.com';
const API_KEY_STORAGE = '@jeturing_api_key';

// Note: In production, this should come from secure environment config
// For now, it should be set by the user or configured during onboarding
let API_KEY: string | null = null;

/**
 * Set API Key for Jeturing API
 * Should be called during app initialization or onboarding
 */
export const setApiKey = async (key: string) => {
  API_KEY = key;
  await AsyncStorage.setItem(API_KEY_STORAGE, key);
};

/**
 * Load API Key from storage
 */
export const loadApiKey = async () => {
  const key = await AsyncStorage.getItem(API_KEY_STORAGE);
  if (key) {
    API_KEY = key;
  }
  return key;
};

/**
 * Connected Customer Response from Jeturing API
 */
export interface ConnectedCustomerResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  description?: string;
  metadata: Record<string, string>;
  created: number;
  livemode: boolean;
}

// Legacy interface for backward compatibility
export interface Customer {
  id: string;
  email: string;
  phone: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CustomerLookup {
  exists: boolean;
  customer?: ConnectedCustomerResponse;
}

export interface InvoiceData {
  id: string;
  pdf_url: string;
  customer_email: string;
  amount: number;
  status: string;
}

/**
 * Check if a customer exists by phone number
 * NOTE: Jeturing API doesn't have direct phone lookup
 * This is a workaround that requires maintaining local mapping
 * OR requesting customer_id from user
 */
export const lookupCustomerByPhone = async (
  phone: string,
  accountId: string
): Promise<CustomerLookup> => {
  try {
    // TODO: Implement proper lookup strategy
    // Option 1: Store customer_id → phone mapping locally
    // Option 2: Request Jeturing API team to add search endpoint
    // Option 3: Use metadata to store phone and search

    console.warn('Phone lookup not directly supported by Jeturing API');
    console.warn('Returning exists: false - implement local mapping or use customer_id');
    
    return { exists: false };
  } catch (error: any) {
    console.error('Error looking up customer:', error);
    return { exists: false };
  }
};

/**
 * Get customer by ID using Jeturing API
 */
export const getCustomerById = async (
  customerId: string,
  accountId: string
): Promise<ConnectedCustomerResponse | null> => {
  try {
    if (!API_KEY) {
      await loadApiKey();
      if (!API_KEY) {
        throw new Error('API Key not configured');
      }
    }

    const response = await axios.get(
      `${API_URL}/connected_customers/${customerId}`,
      {
        params: { connected_account_id: accountId },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error getting customer:', error);
    Alert.alert('Error', 'No se pudo obtener información del cliente');
    return null;
  }
};

/**
 * Create a new Stripe Customer using Jeturing API
 */
export const createCustomer = async (
  email: string,
  phone: string,
  name: string,
  accountId: string,
  metadata?: Record<string, string>
): Promise<ConnectedCustomerResponse> => {
  try {
    if (!API_KEY) {
      await loadApiKey();
      if (!API_KEY) {
        throw new Error('API Key not configured');
      }
    }

    const response = await axios.post(
      `${API_URL}/connected_customers/`,
      {
        email,
        phone,
        name,
        metadata: {
          source: 'jeturing_pay_mobile',
          ...metadata
        }
      },
      {
        params: { connected_account_id: accountId },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating customer:', error);
    
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.detail;
      if (validationErrors && validationErrors.length > 0) {
        Alert.alert('Error de validación', validationErrors[0].msg);
      } else {
        Alert.alert('Error', 'Datos inválidos. Verifica la información.');
      }
    } else {
      Alert.alert('Error', 'No se pudo registrar el cliente');
    }
    
    throw error;
  }
};

/**
 * Update an existing customer using Jeturing API
 */
export const updateCustomer = async (
  customerId: string,
  accountId: string,
  updates: {
    email?: string;
    phone?: string;
    name?: string;
    description?: string;
    metadata?: Record<string, string>;
  }
): Promise<ConnectedCustomerResponse> => {
  try {
    if (!API_KEY) {
      await loadApiKey();
      if (!API_KEY) {
        throw new Error('API Key not configured');
      }
    }

    const response = await axios.put(
      `${API_URL}/connected_customers/${customerId}`,
      updates,
      {
        params: { connected_account_id: accountId },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error updating customer:', error);
    Alert.alert('Error', 'No se pudo actualizar el cliente');
    throw error;
  }
};

/**
 * Generate and send invoice to customer
 * NOTE: This endpoint may not be available in Jeturing API yet
 * TODO: Confirm invoice endpoint with Jeturing API team
 */
export const generateInvoice = async (
  paymentIntentId: string,
  customerId: string,
  accountId: string
): Promise<InvoiceData> => {
  try {
    if (!API_KEY) {
      await loadApiKey();
      if (!API_KEY) {
        throw new Error('API Key not configured');
      }
    }

    // TODO: Update with actual Jeturing invoice endpoint when available
    const response = await axios.post(
      `${API_URL}/invoices`,
      {
        payment_intent: paymentIntentId,
        customer: customerId,
        auto_send_email: true
      },
      {
        params: { connected_account_id: accountId },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    Alert.alert('Error', 'No se pudo generar la factura');
    throw error;
  }
};

/**
 * Generate QR data for customer registration
 * Returns URL that customer can scan to fill their data
 */
export const generateCustomerRegistrationQR = (
  paymentIntentId: string,
  accountId: string,
  amount: number
): string => {
  // Generate deep link that opens web form or app screen
  const baseUrl = 'https://pay.jeturing.com/customer-register';
  const params = new URLSearchParams({
    payment_intent: paymentIntentId,
    account: accountId,
    amount: amount.toString()
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Send invoice to existing customer by phone lookup
 */
export const sendInvoiceToCustomer = async (
  paymentIntentId: string,
  phone: string,
  accountId: string
): Promise<boolean> => {
  try {
    // Lookup customer
    const lookup = await lookupCustomerByPhone(phone, accountId);

    if (!lookup.exists || !lookup.customer) {
      Alert.alert('Cliente no encontrado', 'Este número no está registrado');
      return false;
    }

    // Generate and send invoice
    await generateInvoice(paymentIntentId, lookup.customer.id, accountId);

    Alert.alert(
      'Factura enviada',
      `Se envió la factura a ${lookup.customer.email}`
    );

    return true;
  } catch (error) {
    return false;
  }
};

export default {
  setApiKey,
  loadApiKey,
  lookupCustomerByPhone,
  getCustomerById,
  createCustomer,
  updateCustomer,
  generateInvoice,
  generateCustomerRegistrationQR,
  sendInvoiceToCustomer
};
