/**
 * Jeturing Pay Backend Hub
 * Express server with Stripe Connect integration
 * 
 * @module JeturingPayBackend
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const JETURING_FEE_PERCENT = 0.01; // 1% platform fee
const PORT = process.env.PORT || 4567;
const API_KEY = process.env.API_KEY || process.env.X_API_KEY;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Helper: Get Stripe Account from header
const getStripeAccount = (req: Request): string | undefined => {
  return req.headers['stripe-account'] as string;
};

// Helper: Get connected account id from query or header
const getConnectedAccountId = (req: Request): string | undefined => {
  return (req.query.connected_account_id as string) || getStripeAccount(req);
};

// API Key middleware aligned to OpenAPI security schemes
const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  if (!API_KEY) return next(); // allow if not configured
  const provided = req.header('x-api-key');
  if (provided !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

// In-memory stores for config and MPOS demo data
type StripeConfig = {
  id: number;
  name_domain: string;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  jeturing_fee_percentage: number;
  active: boolean;
};

type MposTransaction = {
  id: string;
  session_id: string;
  pos_reference: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
};

const stripeConfigs: StripeConfig[] = [];
const mposTransactions: MposTransaction[] = [];

// In-memory feature flags store
type FeatureFlags = {
  enableTapToPay: boolean;
  enablePaymentLinks: boolean;
  enableQrPayments: boolean;
  enableRecurringPayments: boolean;
  enableTipping: boolean;
  enableTerminalReaders: boolean;
  enableSimulatedReaders: boolean;
  enableCustomerLookup: boolean;
  enableCustomerInvoices: boolean;
  enableDarkMode: boolean;
  enableAnimations: boolean;
  enableBiometricAuth: boolean;
  enableSentry: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enableDebugMode: boolean;
  enableMockData: boolean;
  enableApiLogging: boolean;
  enableSelfOnboarding: boolean;
  enableExpressOnboarding: boolean;
  enableMposTransactions: boolean;
  enableMposRefunds: boolean;
  apiVersion: string;
  minAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

const defaultFeatureFlags: FeatureFlags = {
  enableTapToPay: true,
  enablePaymentLinks: true,
  enableQrPayments: true,
  enableRecurringPayments: false,
  enableTipping: true,
  enableTerminalReaders: true,
  enableSimulatedReaders: false,
  enableCustomerLookup: true,
  enableCustomerInvoices: true,
  enableDarkMode: false,
  enableAnimations: true,
  enableBiometricAuth: true,
  enableSentry: true,
  enableAnalytics: true,
  enableCrashReporting: true,
  enableDebugMode: false,
  enableMockData: false,
  enableApiLogging: false,
  enableSelfOnboarding: true,
  enableExpressOnboarding: true,
  enableMposTransactions: true,
  enableMposRefunds: true,
  apiVersion: '2.5.0',
  minAppVersion: '1.0.0',
  maintenanceMode: false,
  maintenanceMessage: '',
};

let featureFlags: FeatureFlags = { ...defaultFeatureFlags };

// Feature Flags endpoints
app.get('/feature-flags', requireApiKey, (_req: Request, res: Response) => {
  res.json(featureFlags);
});

app.put('/feature-flags', requireApiKey, (req: Request, res: Response) => {
  featureFlags = { ...featureFlags, ...req.body };
  res.json(featureFlags);
});

app.patch('/feature-flags/:flag', requireApiKey, (req: Request, res: Response) => {
  const { flag } = req.params;
  const { value } = req.body;
  
  if (!(flag in featureFlags)) {
    return res.status(404).json({ error: `Feature flag '${flag}' not found` });
  }
  
  (featureFlags as any)[flag] = value;
  res.json({ [flag]: value });
});

app.delete('/feature-flags', requireApiKey, (_req: Request, res: Response) => {
  featureFlags = { ...defaultFeatureFlags };
  res.json({ message: 'Feature flags reset to defaults', flags: featureFlags });
});

// ============================================
// OpenAPI-aligned endpoints (spec 2.5.0)
// ============================================

// Connected Customers CRUD
app.post('/connected_customers/', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    if (!connectedAccountId) return res.status(400).json({ error: 'connected_account_id is required' });

    const { email, name, phone, metadata } = req.body;
    if (!email) return res.status(422).json({ error: 'email is required' });

    const customer = await stripe.customers.create(
      { email, name, phone, metadata },
      { stripeAccount: connectedAccountId }
    );

    res.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      metadata: customer.metadata,
    });
  } catch (error: any) {
    console.error('Create connected customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/connected_customers/:customer_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    if (!connectedAccountId) return res.status(400).json({ error: 'connected_account_id is required' });

    const { customer_id } = req.params;
    const customer = await stripe.customers.retrieve(customer_id, { stripeAccount: connectedAccountId });
    res.json({
      id: (customer as any).id,
      email: (customer as any).email,
      name: (customer as any).name,
      phone: (customer as any).phone,
      metadata: (customer as any).metadata,
    });
  } catch (error: any) {
    console.error('Get connected customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/connected_customers/:customer_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    if (!connectedAccountId) return res.status(400).json({ error: 'connected_account_id is required' });

    const { customer_id } = req.params;
    const { email, name, phone, metadata } = req.body;

    const customer = await stripe.customers.update(
      customer_id,
      { email, name, phone, metadata },
      { stripeAccount: connectedAccountId }
    );

    res.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      metadata: customer.metadata,
    });
  } catch (error: any) {
    console.error('Update connected customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/connected_customers/:customer_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    if (!connectedAccountId) return res.status(400).json({ error: 'connected_account_id is required' });

    const { customer_id } = req.params;
    await stripe.customers.del(customer_id, { stripeAccount: connectedAccountId });
    res.json({ success: true, customer_id });
  } catch (error: any) {
    console.error('Delete connected customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Platform Customers CRUD
app.post('/customers/', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { email, name, phone, metadata } = req.body;
    if (!email) return res.status(422).json({ error: 'email is required' });
    const customer = await stripe.customers.create({ email, name, phone, metadata });
    res.json(customer);
  } catch (error: any) {
    console.error('Create customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/customers/:customer_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const customer = await stripe.customers.retrieve(req.params.customer_id);
    res.json(customer);
  } catch (error: any) {
    console.error('Get customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/customers/:customer_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const customer = await stripe.customers.update(req.params.customer_id, req.body);
    res.json(customer);
  } catch (error: any) {
    console.error('Update customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/customers/:customer_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    await stripe.customers.del(req.params.customer_id);
    res.json({ success: true, customer_id: req.params.customer_id });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Products CRUD
app.post('/products/', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { name, description, active = true, metadata } = req.body;
    if (!name) return res.status(422).json({ error: 'name is required' });
    const product = await stripe.products.create({ name, description, active, metadata });
    res.json(product);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/products/:product_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const product = await stripe.products.retrieve(req.params.product_id);
    res.json(product);
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/products/:product_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const product = await stripe.products.update(req.params.product_id, req.body);
    res.json(product);
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/products/:product_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const product = await stripe.products.del(req.params.product_id);
    res.json(product);
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Prices CRUD
app.post('/prices/', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { unit_amount, currency, product, recurring, metadata } = req.body;
    if (!unit_amount || !currency || !product) {
      return res.status(422).json({ error: 'unit_amount, currency and product are required' });
    }
    const price = await stripe.prices.create({ unit_amount, currency, product, recurring, metadata });
    res.json(price);
  } catch (error: any) {
    console.error('Create price error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/prices/:price_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const price = await stripe.prices.retrieve(req.params.price_id);
    res.json(price);
  } catch (error: any) {
    console.error('Get price error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/prices/:price_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const price = await stripe.prices.update(req.params.price_id, { metadata: req.body });
    res.json(price);
  } catch (error: any) {
    console.error('Update price error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Stripe Configs (in-memory demo)
app.get('/stripe/config/', requireApiKey, (req: Request, res: Response) => {
  res.json({ configs: stripeConfigs });
});

app.post('/stripe/config/', requireApiKey, (req: Request, res: Response) => {
  const { name_domain, stripe_publishable_key, stripe_secret_key, jeturing_fee_percentage = 1, active = true } = req.body;
  if (!name_domain || !stripe_publishable_key || !stripe_secret_key) {
    return res.status(422).json({ error: 'name_domain, stripe_publishable_key and stripe_secret_key are required' });
  }
  const config: StripeConfig = {
    id: stripeConfigs.length + 1,
    name_domain,
    stripe_publishable_key,
    stripe_secret_key,
    jeturing_fee_percentage,
    active,
  };
  stripeConfigs.push(config);
  res.json(config);
});

app.put('/stripe/config/:config_id', requireApiKey, (req: Request, res: Response) => {
  const configId = parseInt(req.params.config_id, 10);
  const idx = stripeConfigs.findIndex(c => c.id === configId);
  if (idx === -1) return res.status(404).json({ error: 'Config not found' });
  stripeConfigs[idx] = { ...stripeConfigs[idx], ...req.body };
  res.json(stripeConfigs[idx]);
});

app.delete('/stripe/config/:config_id', requireApiKey, (req: Request, res: Response) => {
  const configId = parseInt(req.params.config_id, 10);
  const idx = stripeConfigs.findIndex(c => c.id === configId);
  if (idx === -1) return res.status(404).json({ error: 'Config not found' });
  stripeConfigs[idx].active = false;
  res.json({ success: true, config_id: configId, active: false });
});

// Onboarding endpoints
app.post('/stripe/onboarding/create-link', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { account, refresh_url, return_url, type = 'account_onboarding' } = req.body;
    if (!refresh_url || !return_url) {
      return res.status(422).json({ error: 'refresh_url and return_url are required' });
    }

    let accountId = account;
    if (!accountId) {
      const newAccount = await stripe.accounts.create({ type: 'express', country: 'US' });
      accountId = newAccount.id;
    }

    const link = await stripe.accountLinks.create({ account: accountId, refresh_url, return_url, type });
    res.json({ object: 'account_link', created: Date.now(), expires_at: Date.now() + 3600, url: link.url });
  } catch (error: any) {
    console.error('Create onboarding link error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/stripe/onboarding/accounts/:account_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const account = await stripe.accounts.retrieve(req.params.account_id);
    res.json(account);
  } catch (error: any) {
    console.error('Get connected account error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/stripe/onboarding/accounts/:account_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const account = await stripe.accounts.update(req.params.account_id, req.body);
    res.json(account);
  } catch (error: any) {
    console.error('Update connected account error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/stripe/onboarding/accounts/:account_id', requireApiKey, async (req: Request, res: Response) => {
  try {
    // Stripe does not support hard delete; mark as inactive via metadata
    const account = await stripe.accounts.update(req.params.account_id, { metadata: { deleted: 'true' } });
    res.json({ success: true, account_id: account.id, deleted: true });
  } catch (error: any) {
    console.error('Delete connected account error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Terminal endpoints
app.post('/stripe/terminal/connection_token', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    const token = await stripe.terminal.connectionTokens.create({}, connectedAccountId ? { stripeAccount: connectedAccountId } : undefined);
    res.json({ secret: token.secret });
  } catch (error: any) {
    console.error('Create connection token error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/stripe/terminal/locations', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    const locations = await stripe.terminal.locations.list({}, connectedAccountId ? { stripeAccount: connectedAccountId } : undefined);
    res.json(locations.data);
  } catch (error: any) {
    console.error('Get locations error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/stripe/terminal/locations', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    const { name, address } = req.body;
    if (!name || !address) return res.status(422).json({ error: 'name and address are required' });
    const location = await stripe.terminal.locations.create(
      { display_name: name, address },
      connectedAccountId ? { stripeAccount: connectedAccountId } : undefined
    );
    res.json(location);
  } catch (error: any) {
    console.error('Create location error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/stripe/terminal/readers', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    const readers = await stripe.terminal.readers.list({}, connectedAccountId ? { stripeAccount: connectedAccountId } : undefined);
    res.json(readers.data);
  } catch (error: any) {
    console.error('Get readers error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/stripe/terminal/readers', requireApiKey, async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getConnectedAccountId(req);
    const { registration_code, label, location } = req.body;
    if (!registration_code || !label || !location) {
      return res.status(422).json({ error: 'registration_code, label, and location are required' });
    }
    const reader = await stripe.terminal.readers.create(
      { registration_code, label, location },
      connectedAccountId ? { stripeAccount: connectedAccountId } : undefined
    );
    res.json(reader);
  } catch (error: any) {
    console.error('Register reader error:', error);
    res.status(400).json({ error: error.message });
  }
});

const runTerminalPayment = async (
  readerId: string,
  amount: number,
  currency: string,
  stripeAccount?: string,
) => {
  const paymentIntent = await stripe.paymentIntents.create(
    { amount, currency: currency.toLowerCase(), payment_method_types: ['card_present'] },
    stripeAccount ? { stripeAccount } : undefined
  );
  const processed = await stripe.terminal.readers.processPaymentIntent(
    readerId,
    { payment_intent: paymentIntent.id },
    stripeAccount ? { stripeAccount } : undefined
  );
  return processed;
};

app.post('/stripe/terminal/complete_payment_flow', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { reader_id, amount, currency = 'usd' } = req.query;
    if (!reader_id || !amount) return res.status(422).json({ error: 'reader_id and amount are required' });
    const processed = await runTerminalPayment(reader_id as string, parseInt(amount as string, 10), currency as string, getConnectedAccountId(req));
    res.json(processed);
  } catch (error: any) {
    console.error('Complete payment flow error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/stripe/terminal/complete_payment_flow_with_tip', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { reader_id, amount, currency = 'usd', tip_amount = 0 } = req.query;
    if (!reader_id || !amount) return res.status(422).json({ error: 'reader_id and amount are required' });
    const totalAmount = parseInt(amount as string, 10) + parseInt(tip_amount as string, 10);
    const processed = await runTerminalPayment(reader_id as string, totalAmount, currency as string, getConnectedAccountId(req));
    res.json(processed);
  } catch (error: any) {
    console.error('Complete payment flow with tip error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Webhooks stubs
app.post('/webhook', async (_req: Request, res: Response) => res.json({ received: true }));
app.post('/webhook/stripe', async (_req: Request, res: Response) => res.json({ received: true }));
app.post('/webhook/mpos', async (_req: Request, res: Response) => res.json({ received: true }));

// MPOS endpoints (in-memory demo)
app.get('/mpos/transactions', requireApiKey, (req: Request, res: Response) => {
  const { pos_config_id } = req.query;
  const data = pos_config_id ? mposTransactions.filter(t => t.pos_reference === pos_config_id) : mposTransactions;
  res.json(data);
});

app.get('/mpos/transaction/:transaction_id', requireApiKey, (req: Request, res: Response) => {
  const tx = mposTransactions.find(t => t.id === req.params.transaction_id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json(tx);
});

app.post('/mpos/transaction/refund', requireApiKey, (req: Request, res: Response) => {
  const { transaction_id, amount } = req.body;
  if (!transaction_id) return res.status(422).json({ error: 'transaction_id is required' });
  const idx = mposTransactions.findIndex(t => t.id === transaction_id);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });
  mposTransactions[idx].payment_status = 'refunded';
  if (amount) mposTransactions[idx].amount = amount;
  res.json({ success: true, transaction_id, refunded_amount: amount || mposTransactions[idx].amount });
});

// Env test
app.get('/env-test', requireApiKey, (_req: Request, res: Response) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// ============================================
// ENDPOINT 1: Payment Links with QR Generation
// ============================================

/**
 * Create a payment link with QR code data
 * POST /api/payment-links/:accountId
 */
app.post('/api/payment-links/:accountId', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { 
      amount, 
      currency = 'USD', 
      description,
      customer_email,
      expires_at,
      metadata 
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be positive' });
    }

    const applicationFeeAmount = Math.round(amount * JETURING_FEE_PERCENT);

    // Create a product for this payment
    const product = await stripe.products.create(
      {
        name: description || `Pago de $${(amount / 100).toFixed(2)}`,
        metadata: {
          payment_type: 'one_time',
          source: 'jeturing_pay',
        },
      },
      { stripeAccount: accountId }
    );

    // Create a price for the product
    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: amount,
        currency: currency.toLowerCase(),
      },
      { stripeAccount: accountId }
    );

    // Create payment link with application fee
    const paymentLinkParams: Stripe.PaymentLinkCreateParams = {
      line_items: [{ price: price.id, quantity: 1 }],
      application_fee_percent: JETURING_FEE_PERCENT * 100,
      after_completion: {
        type: 'redirect',
        redirect: { url: `${process.env.APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}` },
      },
      metadata: {
        jeturing_fee: applicationFeeAmount.toString(),
        source: 'jeturing_pay_mobile',
        ...metadata,
      },
    };

    // Add customer email if provided
    if (customer_email) {
      paymentLinkParams.customer_creation = 'always';
    }

    const paymentLink = await stripe.paymentLinks.create(
      paymentLinkParams,
      { stripeAccount: accountId }
    );

    res.json({
      id: paymentLink.id,
      url: paymentLink.url,
      amount,
      currency,
      active: paymentLink.active,
      qr_data: paymentLink.url, // URL for QR code generation
      application_fee_amount: applicationFeeAmount,
      created: Math.floor(Date.now() / 1000),
    });
  } catch (error: any) {
    console.error('Payment link creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Deactivate a payment link
 * DELETE /api/payment-links/:accountId/:linkId
 */
app.delete('/api/payment-links/:accountId/:linkId', async (req: Request, res: Response) => {
  try {
    const { accountId, linkId } = req.params;

    const paymentLink = await stripe.paymentLinks.update(
      linkId,
      { active: false },
      { stripeAccount: accountId }
    );

    res.json({ 
      id: paymentLink.id, 
      active: paymentLink.active,
      message: 'Payment link deactivated successfully' 
    });
  } catch (error: any) {
    console.error('Payment link deactivation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// ENDPOINT 2: Transaction History with Pagination
// ============================================

/**
 * Get paginated transaction history
 * GET /api/transactions/:accountId
 */
app.get('/api/transactions/:accountId', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { 
      limit = '10', 
      starting_after,
      ending_before,
      status,
      created_gte,
      created_lte,
    } = req.query;

    const params: Stripe.PaymentIntentListParams = {
      limit: Math.min(parseInt(limit as string) || 10, 100),
    };

    // Pagination cursors
    if (starting_after) {
      params.starting_after = starting_after as string;
    }
    if (ending_before) {
      params.ending_before = ending_before as string;
    }

    // Date filters
    if (created_gte || created_lte) {
      params.created = {};
      if (created_gte) params.created.gte = parseInt(created_gte as string);
      if (created_lte) params.created.lte = parseInt(created_lte as string);
    }

    const paymentIntents = await stripe.paymentIntents.list(
      params,
      { stripeAccount: accountId }
    );

    // Filter by status if provided
    let filteredData = paymentIntents.data;
    if (status) {
      filteredData = filteredData.filter(pi => pi.status === status);
    }

    // Transform data for mobile app
    const transactions = filteredData.map(pi => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: pi.created,
      description: pi.description,
      customer: pi.customer,
      metadata: pi.metadata,
      payment_method_types: pi.payment_method_types,
      receipt_url: pi.charges?.data[0]?.receipt_url,
      application_fee_amount: pi.application_fee_amount,
    }));

    res.json({
      data: transactions,
      has_more: paymentIntents.has_more,
      total_count: transactions.length,
      pagination: {
        first_id: transactions[0]?.id,
        last_id: transactions[transactions.length - 1]?.id,
      }
    });
  } catch (error: any) {
    console.error('Transaction history error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get transaction statistics summary
 * GET /api/transactions/:accountId/summary
 */
app.get('/api/transactions/:accountId/summary', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { period = 'day' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // day
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const paymentIntents = await stripe.paymentIntents.list(
      {
        limit: 100,
        created: { gte: Math.floor(startDate.getTime() / 1000) },
      },
      { stripeAccount: accountId }
    );

    const summary = {
      total_transactions: paymentIntents.data.length,
      total_amount: 0,
      successful_amount: 0,
      successful_count: 0,
      failed_count: 0,
      pending_count: 0,
      total_fees: 0,
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
    };

    paymentIntents.data.forEach(pi => {
      summary.total_amount += pi.amount;
      
      if (pi.status === 'succeeded') {
        summary.successful_amount += pi.amount;
        summary.successful_count++;
        summary.total_fees += pi.application_fee_amount || 0;
      } else if (pi.status === 'canceled' || pi.status === 'requires_payment_method') {
        summary.failed_count++;
      } else {
        summary.pending_count++;
      }
    });

    res.json(summary);
  } catch (error: any) {
    console.error('Transaction summary error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// ENDPOINT 3: Analytics Dashboard Data
// ============================================

/**
 * Get comprehensive analytics data
 * GET /api/analytics/:accountId
 */
app.get('/api/analytics/:accountId', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { period = 'month' } = req.query;

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Fetch current period data
    const currentPayments = await stripe.paymentIntents.list(
      {
        limit: 100,
        created: { gte: Math.floor(startDate.getTime() / 1000) },
      },
      { stripeAccount: accountId }
    );

    // Fetch previous period data for comparison
    const previousPayments = await stripe.paymentIntents.list(
      {
        limit: 100,
        created: { 
          gte: Math.floor(previousStartDate.getTime() / 1000),
          lt: Math.floor(startDate.getTime() / 1000)
        },
      },
      { stripeAccount: accountId }
    );

    // Calculate current period metrics
    const currentMetrics = calculateMetrics(currentPayments.data);
    const previousMetrics = calculateMetrics(previousPayments.data);

    // Calculate growth percentages
    const revenueGrowth = previousMetrics.revenue > 0 
      ? ((currentMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100 
      : 0;
    
    const transactionGrowth = previousMetrics.count > 0
      ? ((currentMetrics.count - previousMetrics.count) / previousMetrics.count) * 100
      : 0;

    // Group by day for chart data
    const dailyData = groupByDay(currentPayments.data);

    // Get top payment methods
    const paymentMethods = getPaymentMethodStats(currentPayments.data);

    res.json({
      period,
      current: {
        revenue: currentMetrics.revenue,
        transaction_count: currentMetrics.count,
        average_transaction: currentMetrics.average,
        success_rate: currentMetrics.successRate,
        total_fees: currentMetrics.fees,
      },
      previous: {
        revenue: previousMetrics.revenue,
        transaction_count: previousMetrics.count,
      },
      growth: {
        revenue_percent: revenueGrowth.toFixed(2),
        transactions_percent: transactionGrowth.toFixed(2),
      },
      chart_data: dailyData,
      payment_methods: paymentMethods,
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Helper functions for analytics
function calculateMetrics(paymentIntents: Stripe.PaymentIntent[]) {
  const succeeded = paymentIntents.filter(pi => pi.status === 'succeeded');
  const revenue = succeeded.reduce((sum, pi) => sum + pi.amount, 0);
  const fees = succeeded.reduce((sum, pi) => sum + (pi.application_fee_amount || 0), 0);
  
  return {
    revenue,
    count: succeeded.length,
    average: succeeded.length > 0 ? Math.round(revenue / succeeded.length) : 0,
    successRate: paymentIntents.length > 0 
      ? ((succeeded.length / paymentIntents.length) * 100).toFixed(1)
      : '0',
    fees,
  };
}

function groupByDay(paymentIntents: Stripe.PaymentIntent[]) {
  const grouped: Record<string, { date: string; amount: number; count: number }> = {};
  
  paymentIntents.forEach(pi => {
    if (pi.status === 'succeeded') {
      const date = new Date(pi.created * 1000).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, amount: 0, count: 0 };
      }
      grouped[date].amount += pi.amount;
      grouped[date].count++;
    }
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

function getPaymentMethodStats(paymentIntents: Stripe.PaymentIntent[]) {
  const methods: Record<string, number> = {};
  
  paymentIntents.forEach(pi => {
    if (pi.status === 'succeeded') {
      const type = pi.payment_method_types[0] || 'unknown';
      methods[type] = (methods[type] || 0) + 1;
    }
  });

  return Object.entries(methods).map(([type, count]) => ({
    type,
    count,
    percentage: ((count / paymentIntents.length) * 100).toFixed(1),
  }));
}

// ============================================
// EXISTING ENDPOINTS (Enhanced)
// ============================================

/**
 * User Registration - Creates Stripe Connected Account
 * POST /register_user
 */
app.post('/register_user', async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, business_name } = req.body;

    if (!full_name || !email || !phone || !business_name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const nameParts = full_name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      business_type: 'individual',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      },
      business_profile: {
        name: business_name,
        mcc: '5734', // Computer Software Stores
        url: `https://jeturing.com/merchant/${Date.now()}`,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        platform: 'jeturing_pay',
        source: 'mobile_app',
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.APP_URL}/onboarding-refresh`,
      return_url: `${process.env.APP_URL}/onboarding-complete`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      message: 'Registration successful',
      userId: `user_${Date.now()}`,
      stripeAccountId: account.id,
      onboarding_url: accountLink.url,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      userId: null,
      stripeAccountId: null,
    });
  }
});

/**
 * Connection Token - For Stripe Terminal
 * POST /connection_token
 */
app.post('/connection_token', async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getStripeAccount(req);
    
    if (!connectedAccountId) {
      return res.status(400).json({ error: 'Stripe-Account header is required' });
    }

    const connectionToken = await stripe.terminal.connectionTokens.create(
      {},
      { stripeAccount: connectedAccountId }
    );

    res.json({ secret: connectionToken.secret });
  } catch (error: any) {
    console.error('Connection token error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create Location - For Terminal readers
 * POST /create_location
 */
app.post('/create_location', async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getStripeAccount(req);
    const { display_name, address } = req.body;

    if (!connectedAccountId) {
      return res.status(400).json({ error: 'Stripe-Account header is required' });
    }

    const location = await stripe.terminal.locations.create(
      { display_name, address },
      { stripeAccount: connectedAccountId }
    );

    res.json({ 
      success: true, 
      location_id: location.id,
      display_name: location.display_name,
    });
  } catch (error: any) {
    console.error('Create location error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Create Payment Intent
 * POST /api/payments/:accountId
 */
app.post('/api/payments/:accountId', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { 
      amount, 
      currency = 'USD', 
      payment_method_types = ['card'],
      customer,
      metadata 
    } = req.body;

    const applicationFeeAmount = Math.round(amount * JETURING_FEE_PERCENT);

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: currency.toLowerCase(),
        payment_method_types,
        customer,
        application_fee_amount: applicationFeeAmount,
        metadata: {
          jeturing_fee: applicationFeeAmount.toString(),
          ...metadata,
        },
      },
      { stripeAccount: accountId }
    );

    res.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret,
      application_fee_amount: applicationFeeAmount,
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Capture Payment Intent
 * POST /capture_payment_intent
 */
app.post('/capture_payment_intent', async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getStripeAccount(req);
    const { payment_intent_id } = req.body;

    if (!connectedAccountId) {
      return res.status(400).json({ error: 'Stripe-Account header is required' });
    }

    const paymentIntent = await stripe.paymentIntents.capture(
      payment_intent_id,
      {},
      { stripeAccount: connectedAccountId }
    );

    res.json({ 
      success: true,
      status: paymentIntent.status,
      amount_captured: paymentIntent.amount_received,
    });
  } catch (error: any) {
    console.error('Capture payment error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Cancel Payment Intent
 * POST /cancel_payment_intent
 */
app.post('/cancel_payment_intent', async (req: Request, res: Response) => {
  try {
    const connectedAccountId = getStripeAccount(req);
    const { payment_intent_id } = req.body;

    if (!connectedAccountId) {
      return res.status(400).json({ error: 'Stripe-Account header is required' });
    }

    const paymentIntent = await stripe.paymentIntents.cancel(
      payment_intent_id,
      {},
      { stripeAccount: connectedAccountId }
    );

    res.json({ 
      success: true,
      status: paymentIntent.status,
    });
  } catch (error: any) {
    console.error('Cancel payment error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Refund Payment
 * POST /api/refunds/:accountId
 */
app.post('/api/refunds/:accountId', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { payment_intent, amount, reason } = req.body;

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent,
      reverse_transfer: true,
      refund_application_fee: true,
    };

    if (amount) {
      refundParams.amount = amount;
    }
    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(
      refundParams,
      { stripeAccount: accountId }
    );

    res.json({
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
      payment_intent: refund.payment_intent,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get Account Summary
 * GET /api/accounts/:accountId/summary
 */
app.get('/api/accounts/:accountId/summary', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;

    const account = await stripe.accounts.retrieve(accountId);
    const balance = await stripe.balance.retrieve(
      {},
      { stripeAccount: accountId }
    );

    res.json({
      account_id: account.id,
      email: account.email,
      business_name: account.business_profile?.name,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      balance: {
        available: balance.available,
        pending: balance.pending,
      },
      country: account.country,
      created: account.created,
    });
  } catch (error: any) {
    console.error('Account summary error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Jeturing Pay Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
