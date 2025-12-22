# Jeturing API Integration Guide

## API Base URL
```
https://api.jeturing.com
```

## Authentication
All requests require an API key in the header:
```
X-API-Key: your_api_key_here
```

## Connected Customers Endpoints

### 1. Create Connected Customer

**Endpoint**: `POST /connected_customers/`

**Query Parameters**:
- `connected_account_id` (required): ID de la cuenta conectada de Stripe

**Request Body** (`ConnectedCustomerCreate`):
```json
{
  "email": "string",
  "name": "string",
  "phone": "string",
  "description": "string (optional)",
  "metadata": {
    "key": "value"
  }
}
```

**Response** (`ConnectedCustomerResponse`):
```json
{
  "id": "cus_xxx",
  "email": "customer@example.com",
  "name": "Customer Name",
  "phone": "+1234567890",
  "description": "string",
  "metadata": {},
  "created": 1234567890,
  "livemode": false
}
```

**Status Codes**:
- 200: Successful Response
- 422: Validation Error

### 2. Get Connected Customer

**Endpoint**: `GET /connected_customers/{customer_id}`

**Path Parameters**:
- `customer_id` (required): Stripe Customer ID

**Query Parameters**:
- `connected_account_id` (required): ID de la cuenta conectada de Stripe

**Response** (`ConnectedCustomerResponse`):
Same as Create response

**Status Codes**:
- 200: Successful Response
- 422: Validation Error

### 3. Update Connected Customer

**Endpoint**: `PUT /connected_customers/{customer_id}`

**Path Parameters**:
- `customer_id` (required): Stripe Customer ID

**Query Parameters**:
- `connected_account_id` (required): ID de la cuenta conectada de Stripe

**Request Body** (`ConnectedCustomerUpdate`):
```json
{
  "email": "string (optional)",
  "name": "string (optional)",
  "phone": "string (optional)",
  "description": "string (optional)",
  "metadata": {
    "key": "value"
  }
}
```

**Response** (`ConnectedCustomerResponse`):
Same as Create response

**Status Codes**:
- 200: Successful Response
- 422: Validation Error

## Key Differences from Initial Implementation

### 1. Query Parameters vs Headers
- **Actual API**: Uses `connected_account_id` as **query parameter**
- **Initial Implementation**: Used `Stripe-Account` header

### 2. Endpoint Structure
- **Actual API**: `/connected_customers/`
- **Initial Implementation**: `/api/customers/{accountId}`

### 3. Phone Lookup
- **Actual API**: Not directly available - need to list/search customers
- **Workaround**: Use GET with customer_id or implement search logic

## Implementation Updates Needed

### customer.ts Service

#### Before:
```typescript
const response = await axios.post(`${API_URL}/api/customers/${accountId}`, {
  email, phone, name
});
```

#### After:
```typescript
const response = await axios.post(`${API_URL}/connected_customers/`, {
  email, phone, name, metadata
}, {
  params: { connected_account_id: accountId },
  headers: { 'X-API-Key': API_KEY }
});
```

### Customer Lookup Strategy

Since the API doesn't have a direct phone lookup endpoint, we have two options:

1. **Store mapping locally**: Save customer_id → phone mapping in app state
2. **Backend enhancement**: Request Jeturing team to add `/connected_customers/search` endpoint
3. **Workaround**: Use metadata to store identifiers and retrieve by customer_id

## Example Usage

### Create Customer with Jeturing API

```typescript
import axios from 'axios';

const API_URL = 'https://api.jeturing.com';
const API_KEY = process.env.JETURING_API_KEY;

export const createConnectedCustomer = async (
  email: string,
  phone: string,
  name: string,
  connected_account_id: string,
  metadata?: Record<string, string>
) => {
  try {
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
        params: { connected_account_id },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};
```

### Get Customer by ID

```typescript
export const getConnectedCustomer = async (
  customer_id: string,
  connected_account_id: string
) => {
  try {
    const response = await axios.get(
      `${API_URL}/connected_customers/${customer_id}`,
      {
        params: { connected_account_id },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};
```

### Update Customer

```typescript
export const updateConnectedCustomer = async (
  customer_id: string,
  connected_account_id: string,
  updates: {
    email?: string;
    phone?: string;
    name?: string;
    description?: string;
    metadata?: Record<string, string>;
  }
) => {
  try {
    const response = await axios.put(
      `${API_URL}/connected_customers/${customer_id}`,
      updates,
      {
        params: { connected_account_id },
        headers: { 'X-API-Key': API_KEY }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};
```

## Schema Definitions

### ConnectedCustomerCreate
```typescript
interface ConnectedCustomerCreate {
  email: string;
  name: string;
  phone: string;
  description?: string;
  metadata?: Record<string, string>;
}
```

### ConnectedCustomerUpdate
```typescript
interface ConnectedCustomerUpdate {
  email?: string;
  name?: string;
  phone?: string;
  description?: string;
  metadata?: Record<string, string>;
}
```

### ConnectedCustomerResponse
```typescript
interface ConnectedCustomerResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  description?: string;
  metadata: Record<string, string>;
  created: number;
  livemode: boolean;
}
```

### HTTPValidationError
```typescript
interface HTTPValidationError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}
```

## Security Considerations

1. **API Key Management**:
   - Store API key securely (environment variables, secure storage)
   - Never commit API keys to repository
   - Use different keys for development/production

2. **Connected Account ID**:
   - Always validate account ownership
   - Don't expose account IDs in client-side code unnecessarily

3. **Customer Data**:
   - Handle PII (email, phone) according to privacy regulations
   - Implement proper data retention policies

## Next Steps

1. Update `customer.ts` service to use correct endpoints
2. Update API_KEY configuration (environment variable)
3. Implement customer lookup workaround (store mapping or request new endpoint)
4. Test with actual Jeturing API
5. Update error handling for 422 validation errors
6. Document any additional endpoints needed (invoices, payments, etc.)

## Support

For additional endpoint information or API enhancements, contact Jeturing API team.
