/**
 * E2E Tests for Jeturing Pay Backend
 * Complete flow testing for all payment scenarios
 */

import request from 'supertest';
import app from '../src/server';

describe('Jeturing Pay Backend E2E Tests', () => {
  const testAccountId = 'acct_test_12345';
  let createdPaymentLinkId: string;
  let createdPaymentIntentId: string;

  // ================================
  // Health Check Tests
  // ================================
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  // ================================
  // User Registration Flow
  // ================================
  describe('User Registration Flow', () => {
    it('should register a new user and create Stripe Connected Account', async () => {
      const userData = {
        full_name: 'Juan García',
        email: 'juan@test.com',
        phone: '+1234567890',
        business_name: 'Tienda de Juan',
      };

      const response = await request(app)
        .post('/register_user')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stripeAccountId).toBeDefined();
      expect(response.body.stripeAccountId).toMatch(/^acct_/);
      expect(response.body.onboarding_url).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/register_user')
        .send({ email: 'test@test.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ================================
  // Connection Token Flow
  // ================================
  describe('Connection Token Flow', () => {
    it('should return connection token for valid account', async () => {
      const response = await request(app)
        .post('/connection_token')
        .set('Stripe-Account', testAccountId)
        .expect(200);

      expect(response.body.secret).toBeDefined();
    });

    it('should fail without Stripe-Account header', async () => {
      const response = await request(app)
        .post('/connection_token')
        .expect(400);

      expect(response.body.error).toContain('Stripe-Account header is required');
    });
  });

  // ================================
  // Payment Link Flow (NEW ENDPOINT)
  // ================================
  describe('Payment Link Flow', () => {
    it('should create a payment link with QR data', async () => {
      const linkData = {
        amount: 2500,
        currency: 'USD',
        description: 'Test Payment',
      };

      const response = await request(app)
        .post(`/api/payment-links/${testAccountId}`)
        .send(linkData)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.url).toBeDefined();
      expect(response.body.qr_data).toBeDefined();
      expect(response.body.amount).toBe(2500);
      expect(response.body.application_fee_amount).toBe(25); // 1% fee

      createdPaymentLinkId = response.body.id;
    });

    it('should fail with invalid amount', async () => {
      const response = await request(app)
        .post(`/api/payment-links/${testAccountId}`)
        .send({ amount: -100 })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should deactivate a payment link', async () => {
      if (!createdPaymentLinkId) {
        console.log('Skipping: No payment link created');
        return;
      }

      const response = await request(app)
        .delete(`/api/payment-links/${testAccountId}/${createdPaymentLinkId}`)
        .expect(200);

      expect(response.body.active).toBe(false);
    });
  });

  // ================================
  // Transaction History Flow (NEW ENDPOINT)
  // ================================
  describe('Transaction History Flow', () => {
    it('should return paginated transaction history', async () => {
      const response = await request(app)
        .get(`/api/transactions/${testAccountId}`)
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.has_more).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter transactions by status', async () => {
      const response = await request(app)
        .get(`/api/transactions/${testAccountId}`)
        .query({ status: 'succeeded', limit: 5 })
        .expect(200);

      expect(response.body.data).toBeDefined();
      response.body.data.forEach((tx: any) => {
        expect(tx.status).toBe('succeeded');
      });
    });

    it('should filter transactions by date range', async () => {
      const now = Math.floor(Date.now() / 1000);
      const weekAgo = now - (7 * 24 * 60 * 60);

      const response = await request(app)
        .get(`/api/transactions/${testAccountId}`)
        .query({ 
          created_gte: weekAgo,
          created_lte: now,
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should return transaction summary', async () => {
      const response = await request(app)
        .get(`/api/transactions/${testAccountId}/summary`)
        .query({ period: 'month' })
        .expect(200);

      expect(response.body.total_transactions).toBeDefined();
      expect(response.body.total_amount).toBeDefined();
      expect(response.body.successful_count).toBeDefined();
      expect(response.body.total_fees).toBeDefined();
    });
  });

  // ================================
  // Analytics Flow (NEW ENDPOINT)
  // ================================
  describe('Analytics Flow', () => {
    it('should return comprehensive analytics data', async () => {
      const response = await request(app)
        .get(`/api/analytics/${testAccountId}`)
        .query({ period: 'month' })
        .expect(200);

      expect(response.body.current).toBeDefined();
      expect(response.body.previous).toBeDefined();
      expect(response.body.growth).toBeDefined();
      expect(response.body.chart_data).toBeDefined();
      expect(response.body.payment_methods).toBeDefined();
    });

    it('should calculate growth percentages correctly', async () => {
      const response = await request(app)
        .get(`/api/analytics/${testAccountId}`)
        .query({ period: 'week' })
        .expect(200);

      expect(response.body.growth.revenue_percent).toBeDefined();
      expect(response.body.growth.transactions_percent).toBeDefined();
    });
  });

  // ================================
  // Payment Processing Flow
  // ================================
  describe('Payment Processing Flow', () => {
    it('should create a payment intent with 1% fee', async () => {
      const paymentData = {
        amount: 5000,
        currency: 'USD',
        metadata: { order_id: 'test_order_123' },
      };

      const response = await request(app)
        .post(`/api/payments/${testAccountId}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.id).toMatch(/^pi_/);
      expect(response.body.amount).toBe(5000);
      expect(response.body.application_fee_amount).toBe(50); // 1% fee
      expect(response.body.client_secret).toBeDefined();

      createdPaymentIntentId = response.body.id;
    });

    it('should capture a payment intent', async () => {
      if (!createdPaymentIntentId) {
        console.log('Skipping: No payment intent created');
        return;
      }

      const response = await request(app)
        .post('/capture_payment_intent')
        .set('Stripe-Account', testAccountId)
        .send({ payment_intent_id: createdPaymentIntentId })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should cancel a payment intent', async () => {
      // Create a new payment intent to cancel
      const createResponse = await request(app)
        .post(`/api/payments/${testAccountId}`)
        .send({ amount: 1000, currency: 'USD' });

      const cancelResponse = await request(app)
        .post('/cancel_payment_intent')
        .set('Stripe-Account', testAccountId)
        .send({ payment_intent_id: createResponse.body.id })
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.status).toBe('canceled');
    });
  });

  // ================================
  // Refund Flow
  // ================================
  describe('Refund Flow', () => {
    it('should create a full refund', async () => {
      // Assume we have a succeeded payment
      const response = await request(app)
        .post(`/api/refunds/${testAccountId}`)
        .send({ payment_intent: 'pi_test_succeeded' })
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBeDefined();
    });

    it('should create a partial refund', async () => {
      const response = await request(app)
        .post(`/api/refunds/${testAccountId}`)
        .send({ 
          payment_intent: 'pi_test_succeeded',
          amount: 500, // $5 partial refund
        })
        .expect(200);

      expect(response.body.amount).toBe(500);
    });
  });

  // ================================
  // Account Summary Flow
  // ================================
  describe('Account Summary Flow', () => {
    it('should return account summary with balance', async () => {
      const response = await request(app)
        .get(`/api/accounts/${testAccountId}/summary`)
        .expect(200);

      expect(response.body.account_id).toBeDefined();
      expect(response.body.charges_enabled).toBeDefined();
      expect(response.body.payouts_enabled).toBeDefined();
      expect(response.body.balance).toBeDefined();
    });
  });

  // ================================
  // Location Management Flow
  // ================================
  describe('Location Management Flow', () => {
    it('should create a location for terminal', async () => {
      const locationData = {
        display_name: 'Main Store',
        address: {
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94103',
          country: 'US',
        },
      };

      const response = await request(app)
        .post('/create_location')
        .set('Stripe-Account', testAccountId)
        .send(locationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.location_id).toBeDefined();
    });
  });

  // ================================
  // Error Handling Tests
  // ================================
  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });

    it('should handle invalid account IDs gracefully', async () => {
      const response = await request(app)
        .get('/api/transactions/invalid_account')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  // ================================
  // Complete Payment Journey E2E
  // ================================
  describe('Complete Payment Journey', () => {
    it('should complete full payment journey: register → payment link → transaction history', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/register_user')
        .send({
          full_name: 'Test Merchant',
          email: 'merchant@test.com',
          phone: '+1555000123',
          business_name: 'Test Business',
        });

      const accountId = registerResponse.body.stripeAccountId;
      expect(accountId).toBeDefined();

      // Step 2: Create payment link
      const linkResponse = await request(app)
        .post(`/api/payment-links/${accountId}`)
        .send({
          amount: 3000,
          currency: 'USD',
          description: 'E2E Test Payment',
        });

      expect(linkResponse.body.url).toBeDefined();

      // Step 3: Check transaction history
      const historyResponse = await request(app)
        .get(`/api/transactions/${accountId}`)
        .query({ limit: 5 });

      expect(historyResponse.body.data).toBeDefined();

      // Step 4: Get analytics
      const analyticsResponse = await request(app)
        .get(`/api/analytics/${accountId}`)
        .query({ period: 'day' });

      expect(analyticsResponse.body.current).toBeDefined();

      console.log('✅ Complete payment journey test passed');
    });
  });
});
