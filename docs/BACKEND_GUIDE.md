# Jeturing Pay Backend Implementation Guide

This guide explains how to implement a backend service that supports the Jeturing Pay mobile app with Stripe Connected Accounts.

## Overview

The Jeturing Pay app requires a backend that:
1. Handles user registration and creates Stripe Connected Accounts
2. Issues connection tokens for Stripe Terminal on behalf of connected accounts
3. Manages payment intents and locations for connected accounts

## Prerequisites

- Node.js, Python, Ruby, or any backend framework
- Stripe account with Connected Accounts enabled
- SSL certificate (required for production)

## Environment Setup

```bash
# Install Stripe SDK (Node.js example)
npm install stripe express body-parser

# Set environment variables
export STRIPE_SECRET_KEY="sk_test_..."
export PORT=4567
```

## Required Endpoints

### 1. User Registration Endpoint

Creates a new Stripe Connected Account when a user registers.

**Endpoint**: `POST /register_user`

**Request Body**:
```
full_name: String
email: String
phone: String
business_name: String
```

**Example Implementation (Node.js)**:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();

app.post('/register_user', async (req, res) => {
  try {
    const { full_name, email, phone, business_name } = req.body;

    // Create a Stripe Connected Account
    const account = await stripe.accounts.create({
      type: 'standard', // or 'express' depending on your integration
      country: 'US',
      email: email,
      business_type: 'individual',
      individual: {
        first_name: full_name.split(' ')[0],
        last_name: full_name.split(' ').slice(1).join(' '),
        email: email,
        phone: phone,
      },
      business_profile: {
        name: business_name,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Store user in your database
    // await db.users.create({
    //   fullName: full_name,
    //   email: email,
    //   phone: phone,
    //   businessName: business_name,
    //   stripeAccountId: account.id
    // });

    res.json({
      success: true,
      message: 'Registration successful',
      userId: `user_${Date.now()}`, // Replace with actual user ID from your DB
      stripeAccountId: account.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      userId: null,
      stripeAccountId: null,
    });
  }
});
```

### 2. Connection Token Endpoint

Issues connection tokens for Stripe Terminal, scoped to the connected account.

**Endpoint**: `POST /connection_token`

**Headers**: `Stripe-Account: acct_xxx`

**Example Implementation**:
```javascript
app.post('/connection_token', async (req, res) => {
  try {
    const connectedAccountId = req.headers['stripe-account'];
    
    if (!connectedAccountId) {
      throw new Error('Stripe-Account header is required');
    }

    // Create connection token on behalf of connected account
    const connectionToken = await stripe.terminal.connectionTokens.create(
      {},
      {
        stripeAccount: connectedAccountId,
      }
    );

    res.json({
      secret: connectionToken.secret,
    });
  } catch (error) {
    console.error('Connection token error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Create Location Endpoint

Creates a location for reader registration.

**Endpoint**: `POST /create_location`

**Headers**: `Stripe-Account: acct_xxx`

**Request Body**:
```
display_name: String
address[line1]: String
address[line2]: String (optional)
address[city]: String
address[postal_code]: String
address[state]: String
address[country]: String
```

**Example Implementation**:
```javascript
app.post('/create_location', async (req, res) => {
  try {
    const connectedAccountId = req.headers['stripe-account'];
    const {
      display_name,
      'address[line1]': line1,
      'address[line2]': line2,
      'address[city]': city,
      'address[postal_code]': postal_code,
      'address[state]': state,
      'address[country]': country,
    } = req.body;

    const location = await stripe.terminal.locations.create(
      {
        display_name: display_name,
        address: {
          line1: line1,
          line2: line2,
          city: city,
          postal_code: postal_code,
          state: state,
          country: country,
        },
      },
      {
        stripeAccount: connectedAccountId,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

### 4. Capture Payment Intent Endpoint

Captures a payment intent.

**Endpoint**: `POST /capture_payment_intent`

**Headers**: `Stripe-Account: acct_xxx`

**Request Body**:
```
payment_intent_id: String
```

**Example Implementation**:
```javascript
app.post('/capture_payment_intent', async (req, res) => {
  try {
    const connectedAccountId = req.headers['stripe-account'];
    const { payment_intent_id } = req.body;

    await stripe.paymentIntents.capture(
      payment_intent_id,
      {},
      {
        stripeAccount: connectedAccountId,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Capture payment error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

### 5. Cancel Payment Intent Endpoint

Cancels a payment intent.

**Endpoint**: `POST /cancel_payment_intent`

**Headers**: `Stripe-Account: acct_xxx`

**Request Body**:
```
payment_intent_id: String
```

**Example Implementation**:
```javascript
app.post('/cancel_payment_intent', async (req, res) => {
  try {
    const connectedAccountId = req.headers['stripe-account'];
    const { payment_intent_id } = req.body;

    await stripe.paymentIntents.cancel(
      payment_intent_id,
      {},
      {
        stripeAccount: connectedAccountId,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

## Complete Server Example

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add all endpoints here (from above)

const PORT = process.env.PORT || 4567;
app.listen(PORT, () => {
  console.log(`Jeturing Pay backend running on port ${PORT}`);
});
```

## Database Schema

Recommended database schema for user management:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_account ON users(stripe_account_id);
```

## Security Considerations

1. **API Keys**: Never expose Stripe secret keys in client code
2. **HTTPS Only**: All production endpoints must use HTTPS
3. **Input Validation**: Validate all input parameters
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Authentication**: Consider adding user authentication for production
6. **Account Verification**: Implement Stripe Connected Account verification flows
7. **Webhook Handling**: Set up webhooks for account and payment events

## Testing

### Test with cURL

```bash
# Register user
curl -X POST http://localhost:4567/register_user \
  -d "full_name=John Doe" \
  -d "email=john@example.com" \
  -d "phone=+1234567890" \
  -d "business_name=John's Business"

# Get connection token
curl -X POST http://localhost:4567/connection_token \
  -H "Stripe-Account: acct_xxx"

# Create location
curl -X POST http://localhost:4567/create_location \
  -H "Stripe-Account: acct_xxx" \
  -d "display_name=Main Office" \
  -d "address[line1]=123 Main St" \
  -d "address[city]=San Francisco" \
  -d "address[state]=CA" \
  -d "address[postal_code]=94103" \
  -d "address[country]=US"
```

## Deployment

### Using Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create jeturing-pay-backend

# Set config
heroku config:set STRIPE_SECRET_KEY=sk_test_...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Using Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4567
CMD ["node", "server.js"]
```

## Monitoring

- Monitor Stripe Dashboard for connected account activity
- Log all registration attempts
- Track payment success/failure rates
- Set up alerts for errors
- Monitor API response times

## Support Resources

- [Stripe Terminal Documentation](https://stripe.com/docs/terminal)
- [Stripe Connected Accounts Guide](https://stripe.com/docs/connect)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Express.js Documentation](https://expressjs.com/)

## Troubleshooting

### Common Issues

1. **"Stripe-Account header is required"**
   - Ensure the app is passing the connected account ID after registration

2. **"No such account"**
   - Verify the account ID is valid and the account exists

3. **"This account cannot access terminal"**
   - Ensure the connected account has terminal capabilities enabled

4. **Connection token creation fails**
   - Check that the connected account is properly onboarded
   - Verify API keys are correct

## Production Checklist

- [ ] Use production Stripe API keys
- [ ] Enable HTTPS/SSL
- [ ] Implement proper error handling
- [ ] Add request logging
- [ ] Set up monitoring and alerts
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Implement user authentication
- [ ] Set up database backups
- [ ] Configure webhooks
- [ ] Test all endpoints thoroughly
- [ ] Document API for your team
