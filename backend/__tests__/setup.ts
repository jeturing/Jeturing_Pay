/**
 * Jest Test Setup
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Stripe for testing
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    accounts: {
      create: jest.fn().mockResolvedValue({
        id: 'acct_test_12345',
        email: 'test@test.com',
        charges_enabled: true,
        payouts_enabled: true,
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'acct_test_12345',
        email: 'test@test.com',
        business_profile: { name: 'Test Business' },
        charges_enabled: true,
        payouts_enabled: true,
        country: 'US',
        created: Date.now() / 1000,
      }),
    },
    accountLinks: {
      create: jest.fn().mockResolvedValue({
        url: 'https://connect.stripe.com/setup/c/test',
      }),
    },
    terminal: {
      connectionTokens: {
        create: jest.fn().mockResolvedValue({
          secret: 'pst_test_secret',
        }),
      },
      locations: {
        create: jest.fn().mockResolvedValue({
          id: 'tml_test_location',
          display_name: 'Test Location',
        }),
      },
    },
    products: {
      create: jest.fn().mockResolvedValue({
        id: 'prod_test_123',
        name: 'Test Product',
      }),
    },
    prices: {
      create: jest.fn().mockResolvedValue({
        id: 'price_test_123',
        unit_amount: 2500,
      }),
    },
    paymentLinks: {
      create: jest.fn().mockResolvedValue({
        id: 'plink_test_123',
        url: 'https://buy.stripe.com/test_123',
        active: true,
      }),
      update: jest.fn().mockResolvedValue({
        id: 'plink_test_123',
        active: false,
      }),
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        amount: 5000,
        currency: 'usd',
        status: 'requires_payment_method',
        client_secret: 'pi_test_secret',
        application_fee_amount: 50,
      }),
      list: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'pi_test_1',
            amount: 2500,
            currency: 'usd',
            status: 'succeeded',
            created: Date.now() / 1000,
            payment_method_types: ['card'],
            application_fee_amount: 25,
            charges: { data: [{ receipt_url: 'https://receipt.test' }] },
          },
          {
            id: 'pi_test_2',
            amount: 5000,
            currency: 'usd',
            status: 'succeeded',
            created: Date.now() / 1000 - 86400,
            payment_method_types: ['card'],
            application_fee_amount: 50,
            charges: { data: [{ receipt_url: 'https://receipt.test' }] },
          },
        ],
        has_more: false,
      }),
      capture: jest.fn().mockResolvedValue({
        status: 'succeeded',
        amount_received: 5000,
      }),
      cancel: jest.fn().mockResolvedValue({
        status: 'canceled',
      }),
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_test_123',
        amount: 500,
        status: 'succeeded',
        payment_intent: 'pi_test_123',
      }),
    },
    balance: {
      retrieve: jest.fn().mockResolvedValue({
        available: [{ amount: 10000, currency: 'usd' }],
        pending: [{ amount: 5000, currency: 'usd' }],
      }),
    },
  }));
});

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Add cleanup logic if needed
});
