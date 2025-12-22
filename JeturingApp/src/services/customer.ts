/**
 * Customer Service
 * Manages Stripe Customer creation and invoice generation
 */

import axios from 'axios';
import { Alert } from 'react-native';

const API_URL = 'https://api.jeturing.com';

export interface Customer {
  id: string;
  email: string;
  phone: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CustomerLookup {
  exists: boolean;
  customer?: Customer;
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
 */
export const lookupCustomerByPhone = async (
  phone: string,
  accountId: string
): Promise<CustomerLookup> => {
  try {
    const response = await axios.get(`${API_URL}/api/customers/lookup`, {
      params: { phone },
      headers: { 'Stripe-Account': accountId }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error looking up customer:', error);
    return { exists: false };
  }
};

/**
 * Create a new Stripe Customer
 */
export const createCustomer = async (
  email: string,
  phone: string,
  name: string,
  accountId: string,
  metadata?: Record<string, string>
): Promise<Customer> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/customers/${accountId}`,
      {
        email,
        phone,
        name,
        metadata: {
          source: 'jeturing_pay_mobile',
          ...metadata
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating customer:', error);
    Alert.alert('Error', 'No se pudo registrar el cliente');
    throw error;
  }
};

/**
 * Generate and send invoice to customer
 */
export const generateInvoice = async (
  paymentIntentId: string,
  customerId: string,
  accountId: string
): Promise<InvoiceData> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/invoices/${accountId}`,
      {
        payment_intent: paymentIntentId,
        customer: customerId,
        auto_send_email: true
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
  lookupCustomerByPhone,
  createCustomer,
  generateInvoice,
  generateCustomerRegistrationQR,
  sendInvoiceToCustomer
};
