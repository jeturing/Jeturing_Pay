/**
 * Jeturing API Client
 * Auto-generated from OpenAPI spec v2.5.0
 * Base URL: https://api-001.sajet.us
 *
 * All endpoints require header: x-api-key
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api-001.sajet.us';
const API_KEY_STORAGE = '@jeturing_api_key';

// Types aligned with OpenAPI spec

export interface ConnectedCustomerCreate {
  email: string;
  name?: string | null;
  phone?: string | null;
  metadata?: Record<string, string> | null;
}

export interface ConnectedCustomerResponse {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  metadata?: Record<string, string> | null;
}

export interface CustomerCreate {
  email: string;
  name?: string | null;
  phone?: string | null;
  metadata?: Record<string, string> | null;
}

export interface CustomerResponse {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  metadata?: Record<string, string> | null;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  active?: boolean | null;
  metadata?: Record<string, string> | null;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  metadata?: Record<string, string> | null;
}

export interface PriceCreate {
  unit_amount: number;
  currency: string;
  product: string;
  recurring?: Record<string, any> | null;
  metadata?: Record<string, string> | null;
}

export interface PriceResponse {
  id: string;
  unit_amount: number;
  currency: string;
  product: string;
  recurring?: Record<string, any> | null;
  metadata?: Record<string, string> | null;
}

export interface OnboardingLinkCreate {
  account?: string | null;
  refresh_url: string;
  return_url: string;
  type?: string;
}

export interface OnboardingLinkResponse {
  object: string;
  created: number;
  expires_at: number;
  url: string;
}

export interface ConnectedAccountResponse {
  id: string;
  object: string;
  business_type?: string | null;
  charges_enabled: boolean;
  country: string;
  email?: string | null;
  payouts_enabled: boolean;
  type: string;
}

export interface StripeConfigCreate {
  name_domain: string;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  jeturing_fee_percentage?: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  session_id: string;
  pos_reference: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
}

export interface RefundRequest {
  transaction_id: string;
  amount?: number | null;
}

export interface TerminalLocationCreate {
  name: string;
  address: Record<string, string>;
}

export interface TerminalReaderCreate {
  registration_code: string;
  label: string;
  location: string;
}

class JeturingApiClient {
  private client: AxiosInstance;
  private apiKey: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    this.client.interceptors.request.use(async (config) => {
      if (!this.apiKey) {
        await this.loadApiKey();
      }
      if (this.apiKey) {
        config.headers['x-api-key'] = this.apiKey;
      }
      return config;
    });
  }

  async setApiKey(key: string) {
    this.apiKey = key;
    await AsyncStorage.setItem(API_KEY_STORAGE, key);
  }

  async loadApiKey(): Promise<string | null> {
    const key = await AsyncStorage.getItem(API_KEY_STORAGE);
    if (key) {
      this.apiKey = key;
    }
    return key;
  }

  // ===========================
  // Connected Customers (on connected accounts)
  // ===========================

  async createConnectedCustomer(
    connectedAccountId: string,
    data: ConnectedCustomerCreate
  ): Promise<ConnectedCustomerResponse> {
    const response = await this.client.post('/connected_customers/', data, {
      params: { connected_account_id: connectedAccountId },
    });
    return response.data;
  }

  async getConnectedCustomer(
    customerId: string,
    connectedAccountId: string
  ): Promise<ConnectedCustomerResponse> {
    const response = await this.client.get(`/connected_customers/${customerId}`, {
      params: { connected_account_id: connectedAccountId },
    });
    return response.data;
  }

  async updateConnectedCustomer(
    customerId: string,
    connectedAccountId: string,
    data: ConnectedCustomerCreate
  ): Promise<ConnectedCustomerResponse> {
    const response = await this.client.put(`/connected_customers/${customerId}`, data, {
      params: { connected_account_id: connectedAccountId },
    });
    return response.data;
  }

  async deleteConnectedCustomer(
    customerId: string,
    connectedAccountId: string
  ): Promise<any> {
    const response = await this.client.delete(`/connected_customers/${customerId}`, {
      params: { connected_account_id: connectedAccountId },
    });
    return response.data;
  }

  // ===========================
  // Platform Customers
  // ===========================

  async createCustomer(data: CustomerCreate): Promise<CustomerResponse> {
    const response = await this.client.post('/customers/', data);
    return response.data;
  }

  async getCustomer(customerId: string): Promise<CustomerResponse> {
    const response = await this.client.get(`/customers/${customerId}`);
    return response.data;
  }

  async updateCustomer(customerId: string, data: CustomerCreate): Promise<CustomerResponse> {
    const response = await this.client.put(`/customers/${customerId}`, data);
    return response.data;
  }

  async deleteCustomer(customerId: string): Promise<any> {
    const response = await this.client.delete(`/customers/${customerId}`);
    return response.data;
  }

  // ===========================
  // Products
  // ===========================

  async createProduct(data: ProductCreate): Promise<ProductResponse> {
    const response = await this.client.post('/products/', data);
    return response.data;
  }

  async getProduct(productId: string): Promise<ProductResponse> {
    const response = await this.client.get(`/products/${productId}`);
    return response.data;
  }

  async updateProduct(productId: string, data: ProductCreate): Promise<ProductResponse> {
    const response = await this.client.put(`/products/${productId}`, data);
    return response.data;
  }

  async deleteProduct(productId: string): Promise<ProductResponse> {
    const response = await this.client.delete(`/products/${productId}`);
    return response.data;
  }

  // ===========================
  // Prices
  // ===========================

  async createPrice(data: PriceCreate): Promise<PriceResponse> {
    const response = await this.client.post('/prices/', data);
    return response.data;
  }

  async getPrice(priceId: string): Promise<PriceResponse> {
    const response = await this.client.get(`/prices/${priceId}`);
    return response.data;
  }

  async updatePriceMetadata(priceId: string, metadata: Record<string, string>): Promise<PriceResponse> {
    const response = await this.client.put(`/prices/${priceId}`, metadata);
    return response.data;
  }

  // ===========================
  // Stripe Terminal
  // ===========================

  async createConnectionToken(): Promise<{ secret: string }> {
    const response = await this.client.post('/stripe/terminal/connection_token');
    return response.data;
  }

  async getTerminalLocations(): Promise<any[]> {
    const response = await this.client.get('/stripe/terminal/locations');
    return response.data;
  }

  async createTerminalLocation(data: TerminalLocationCreate): Promise<any> {
    const response = await this.client.post('/stripe/terminal/locations', data);
    return response.data;
  }

  async getTerminalReaders(): Promise<any[]> {
    const response = await this.client.get('/stripe/terminal/readers');
    return response.data;
  }

  async registerTerminalReader(data: TerminalReaderCreate): Promise<any> {
    const response = await this.client.post('/stripe/terminal/readers', data);
    return response.data;
  }

  async completePaymentFlow(
    readerId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<any> {
    const response = await this.client.post('/stripe/terminal/complete_payment_flow', null, {
      params: { reader_id: readerId, amount, currency },
    });
    return response.data;
  }

  async completePaymentFlowWithTip(
    readerId: string,
    amount: number,
    currency: string = 'usd',
    tipAmount: number = 0,
    connectedAccountId?: string
  ): Promise<any> {
    const response = await this.client.post('/stripe/terminal/complete_payment_flow_with_tip', null, {
      params: {
        reader_id: readerId,
        amount,
        currency,
        tip_amount: tipAmount,
        connected_account_id: connectedAccountId,
      },
    });
    return response.data;
  }

  // ===========================
  // Onboarding
  // ===========================

  async createOnboardingLink(data: OnboardingLinkCreate): Promise<OnboardingLinkResponse> {
    const response = await this.client.post('/stripe/onboarding/create-link', data);
    return response.data;
  }

  async getConnectedAccount(accountId: string): Promise<ConnectedAccountResponse> {
    const response = await this.client.get(`/stripe/onboarding/accounts/${accountId}`);
    return response.data;
  }

  async updateConnectedAccount(accountId: string, data: Record<string, any>): Promise<ConnectedAccountResponse> {
    const response = await this.client.put(`/stripe/onboarding/accounts/${accountId}`, data);
    return response.data;
  }

  async deleteConnectedAccount(accountId: string): Promise<any> {
    const response = await this.client.delete(`/stripe/onboarding/accounts/${accountId}`);
    return response.data;
  }

  // ===========================
  // Stripe Config
  // ===========================

  async getStripeConfigs(): Promise<any> {
    const response = await this.client.get('/stripe/config/');
    return response.data;
  }

  async createStripeConfig(data: StripeConfigCreate): Promise<any> {
    const response = await this.client.post('/stripe/config/', data);
    return response.data;
  }

  async updateStripeConfig(configId: number, data: StripeConfigCreate): Promise<any> {
    const response = await this.client.put(`/stripe/config/${configId}`, data);
    return response.data;
  }

  async deleteStripeConfig(configId: number): Promise<any> {
    const response = await this.client.delete(`/stripe/config/${configId}`);
    return response.data;
  }

  // ===========================
  // MPOS Transactions
  // ===========================

  async listMposTransactions(posConfigId?: string): Promise<Transaction[]> {
    const response = await this.client.get('/mpos/transactions', {
      params: posConfigId ? { pos_config_id: posConfigId } : undefined,
    });
    return response.data;
  }

  async getMposTransaction(transactionId: string): Promise<Transaction> {
    const response = await this.client.get(`/mpos/transaction/${transactionId}`);
    return response.data;
  }

  async refundMposTransaction(data: RefundRequest): Promise<any> {
    const response = await this.client.post('/mpos/transaction/refund', data);
    return response.data;
  }

  // ===========================
  // Utility
  // ===========================

  async envTest(): Promise<any> {
    const response = await this.client.get('/env-test');
    return response.data;
  }
}

// Export singleton instance
export const jeturingApi = new JeturingApiClient();
export default jeturingApi;
