/**
 * Generate PlantUML and Mermaid Diagrams
 * Auto-generates architecture diagrams from source code
 * 
 * @module DiagramGenerator
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '../docs/diagrams');
const SRC_DIR = path.join(__dirname, '../src');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate component diagram from screens
 */
function generateComponentDiagram() {
  const screensDir = path.join(SRC_DIR, 'screens');
  const screens = fs.readdirSync(screensDir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => f.replace('.tsx', ''));

  const mermaidContent = `
flowchart TB
    subgraph AuthStack["🔐 Auth Stack"]
        Onboarding[OnboardingScreen]
        ConnectAccount[ConnectAccountScreen]
    end

    subgraph AppStack["📱 App Stack"]
        subgraph TabNavigator["Tab Navigator"]
            Dashboard[DashboardScreen]
            Payment[PaymentScreen]
            History[TransactionHistoryScreen]
            Settings[SettingsScreen]
        end
        
        subgraph ModalScreens["Modal Screens"]
            PaymentLink[PaymentLinkScreen]
            PaymentSuccess[PaymentSuccessScreen]
            CustomerReg[CustomerRegistrationScreen]
            TransactionDetail[TransactionDetailScreen]
        end
    end

    Onboarding --> ConnectAccount
    ConnectAccount --> Dashboard
    Dashboard --> Payment
    Dashboard --> PaymentLink
    Payment --> PaymentSuccess
    PaymentSuccess --> CustomerReg
    History --> TransactionDetail

    classDef auth fill:#fef3c7,stroke:#d97706,color:#92400e
    classDef app fill:#dbeafe,stroke:#3b82f6,color:#1e40af
    classDef modal fill:#f3e8ff,stroke:#9333ea,color:#6b21a8
    
    class Onboarding,ConnectAccount auth
    class Dashboard,Payment,History,Settings app
    class PaymentLink,PaymentSuccess,CustomerReg,TransactionDetail modal
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'component-diagram.mmd'),
    mermaidContent.trim()
  );
  console.log('✅ Generated component-diagram.mmd');
}

/**
 * Generate service architecture diagram
 */
function generateServiceDiagram() {
  const mermaidContent = `
flowchart LR
    subgraph Mobile["📱 Jeturing Pay Mobile"]
        App[React Native App]
        StripeSDK[Stripe React Native SDK]
    end

    subgraph Backend["☁️ Backend Hub"]
        API[Express API Server]
        Auth[Auth Middleware]
        RateLimiter[Rate Limiter]
    end

    subgraph Stripe["💳 Stripe Services"]
        Connect[Stripe Connect]
        Terminal[Stripe Terminal]
        PaymentLinks[Payment Links]
        PaymentIntents[Payment Intents]
    end

    subgraph Storage["💾 Data Storage"]
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end

    App --> StripeSDK
    App <-->|REST API| API
    API --> Auth
    API --> RateLimiter
    
    API <-->|Stripe API| Connect
    API <-->|Stripe API| Terminal
    API <-->|Stripe API| PaymentLinks
    API <-->|Stripe API| PaymentIntents
    
    API --> DB
    API --> Cache
    
    StripeSDK <-->|Direct SDK| Terminal

    classDef mobile fill:#10b981,stroke:#059669,color:#fff
    classDef backend fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef stripe fill:#635bff,stroke:#4f46e5,color:#fff
    classDef storage fill:#f59e0b,stroke:#d97706,color:#fff
    
    class App,StripeSDK mobile
    class API,Auth,RateLimiter backend
    class Connect,Terminal,PaymentLinks,PaymentIntents stripe
    class DB,Cache storage
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'service-architecture.mmd'),
    mermaidContent.trim()
  );
  console.log('✅ Generated service-architecture.mmd');
}

/**
 * Generate payment flow sequence diagram
 */
function generatePaymentFlowDiagram() {
  const mermaidContent = `
sequenceDiagram
    autonumber
    participant User as 👤 Usuario
    participant App as 📱 App
    participant Backend as ☁️ Backend
    participant Stripe as 💳 Stripe

    rect rgb(240, 253, 244)
        Note over User,Stripe: Flujo de Payment Link
        User->>App: Ingresa monto
        App->>Backend: POST /api/payment-links/:accountId
        Backend->>Stripe: Create Product & Price
        Stripe-->>Backend: product_id, price_id
        Backend->>Stripe: Create Payment Link
        Stripe-->>Backend: payment_link_url
        Backend-->>App: { url, qr_data, id }
        App->>App: Genera código QR
        App-->>User: Muestra QR + Link
    end

    rect rgb(254, 249, 195)
        Note over User,Stripe: Cliente Paga
        User->>User: Comparte link
        Note right of User: Cliente escanea QR
        User->>Stripe: Abre checkout
        Stripe->>Stripe: Procesa pago
        Stripe-->>Backend: Webhook: payment_intent.succeeded
        Backend->>Backend: Actualiza BD
    end

    rect rgb(239, 246, 255)
        Note over User,Stripe: Consulta Historial
        User->>App: Abre historial
        App->>Backend: GET /api/transactions/:accountId
        Backend->>Stripe: List Payment Intents
        Stripe-->>Backend: transactions[]
        Backend-->>App: { data, has_more, pagination }
        App-->>User: Lista paginada
    end
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'payment-flow.mmd'),
    mermaidContent.trim()
  );
  console.log('✅ Generated payment-flow.mmd');
}

/**
 * Generate PlantUML class diagram for services
 */
function generateClassDiagram() {
  const plantUMLContent = `
@startuml JeturingPayClasses

skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false

package "Services" {
  class StripeService {
    +JETURING_FEE_PERCENT: number
    +createConnectedAccount(email, businessName): Promise<ConnectedAccount>
    +processPayment(amount, accountId, currency): Promise<PaymentIntent>
    +createPaymentLink(amount, accountId, currency, description): Promise<PaymentLink>
    +createRefund(paymentIntentId, accountId, amount?): Promise<Refund>
    +getAccountSummary(accountId): Promise<AccountSummary>
  }
  
  class CustomerService {
    +lookupCustomerByPhone(phone, accountId): Promise<CustomerLookup>
    +createCustomer(email, phone, name, accountId): Promise<Customer>
    +generateInvoice(paymentIntentId, customerId, accountId): Promise<InvoiceData>
  }
}

package "Contexts" {
  class StripeAccountContext {
    +account: ConnectedAccount
    +isLoading: boolean
    +setAccount(account): void
    +clearAccount(): void
  }
}

package "Hooks" {
  class usePaymentLink {
    +createLink(amount, description): Promise<PaymentLink>
    +loading: boolean
    +error: string
  }
  
  class useTapToPay {
    +initializeReader(): Promise<void>
    +collectPayment(amount): Promise<PaymentIntent>
    +isConnected: boolean
  }
}

package "Models" {
  interface ConnectedAccount {
    id: string
    email: string
    business_name: string
    charges_enabled: boolean
    payouts_enabled: boolean
  }
  
  interface PaymentIntent {
    id: string
    amount: number
    currency: string
    status: string
    client_secret: string
    application_fee_amount: number
  }
  
  interface PaymentLink {
    id: string
    url: string
    amount: number
    currency: string
    active: boolean
  }
  
  interface Transaction {
    id: string
    amount: number
    currency: string
    status: string
    created: number
    description: string
  }
}

StripeService ..> PaymentIntent
StripeService ..> PaymentLink
StripeService ..> ConnectedAccount
CustomerService ..> ConnectedAccount
usePaymentLink --> StripeService
useTapToPay --> StripeService
StripeAccountContext --> ConnectedAccount

@enduml
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'class-diagram.puml'),
    plantUMLContent.trim()
  );
  console.log('✅ Generated class-diagram.puml');
}

/**
 * Generate entity relationship diagram
 */
function generateERDiagram() {
  const mermaidContent = `
erDiagram
    USER ||--o{ CONNECTED_ACCOUNT : has
    CONNECTED_ACCOUNT ||--o{ PAYMENT_INTENT : processes
    CONNECTED_ACCOUNT ||--o{ PAYMENT_LINK : creates
    CONNECTED_ACCOUNT ||--o{ CUSTOMER : registers
    CUSTOMER ||--o{ INVOICE : receives
    PAYMENT_INTENT ||--o| INVOICE : generates

    USER {
        string id PK
        string full_name
        string email
        string phone
        timestamp created_at
    }

    CONNECTED_ACCOUNT {
        string id PK
        string user_id FK
        string stripe_account_id
        string business_name
        boolean charges_enabled
        boolean payouts_enabled
        timestamp created_at
    }

    PAYMENT_INTENT {
        string id PK
        string account_id FK
        int amount
        string currency
        string status
        int application_fee
        timestamp created_at
    }

    PAYMENT_LINK {
        string id PK
        string account_id FK
        string url
        int amount
        string currency
        boolean active
        timestamp created_at
        timestamp expires_at
    }

    CUSTOMER {
        string id PK
        string account_id FK
        string email
        string phone
        string name
        timestamp created_at
    }

    INVOICE {
        string id PK
        string customer_id FK
        string payment_intent_id FK
        string pdf_url
        int amount
        string status
        timestamp created_at
    }
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'er-diagram.mmd'),
    mermaidContent.trim()
  );
  console.log('✅ Generated er-diagram.mmd');
}

/**
 * Generate state machine diagram for payment flow
 */
function generateStateDiagram() {
  const mermaidContent = `
stateDiagram-v2
    [*] --> Idle: App Launched

    state "Payment Flow" as PaymentFlow {
        Idle --> AmountEntry: Start Payment
        AmountEntry --> Creating: Submit Amount
        Creating --> LinkGenerated: Success
        Creating --> Error: Failed
        
        LinkGenerated --> Shared: Share Link
        LinkGenerated --> QRDisplayed: Show QR
        
        Shared --> Pending: Awaiting Payment
        QRDisplayed --> Pending: Customer Scanned
        
        Pending --> Processing: Payment Started
        Processing --> Succeeded: Payment Complete
        Processing --> Failed: Payment Declined
        
        Succeeded --> InvoiceSent: Send Invoice
        InvoiceSent --> [*]: Complete
        
        Failed --> AmountEntry: Retry
        Error --> Idle: Reset
    }

    state "Transaction History" as History {
        [*] --> Loading
        Loading --> Loaded: Fetch Success
        Loading --> ErrorState: Fetch Failed
        Loaded --> Refreshing: Pull to Refresh
        Refreshing --> Loaded: Refresh Complete
        Loaded --> LoadingMore: Scroll to Bottom
        LoadingMore --> Loaded: More Loaded
        Loaded --> DetailView: Select Transaction
        DetailView --> Loaded: Go Back
        ErrorState --> Loading: Retry
    }
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'state-diagram.mmd'),
    mermaidContent.trim()
  );
  console.log('✅ Generated state-diagram.mmd');
}

/**
 * Generate API endpoint documentation
 */
function generateAPIDocumentation() {
  const apiDocs = `
# Jeturing Pay API Reference

## Base URL
\`\`\`
Production: https://api.jeturing.com
Staging: https://staging-api.jeturing.com
\`\`\`

## Authentication
All endpoints require the \`Stripe-Account\` header for connected account operations.

---

## Endpoints

### 1. Payment Links

#### Create Payment Link
\`\`\`
POST /api/payment-links/:accountId
\`\`\`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | ✅ | Amount in cents |
| currency | string | ❌ | Currency code (default: USD) |
| description | string | ❌ | Payment description |
| customer_email | string | ❌ | Customer email for receipt |
| metadata | object | ❌ | Additional metadata |

**Response:**
\`\`\`json
{
  "id": "plink_xxx",
  "url": "https://buy.stripe.com/xxx",
  "amount": 2500,
  "currency": "USD",
  "qr_data": "https://buy.stripe.com/xxx",
  "application_fee_amount": 25,
  "created": 1703203200
}
\`\`\`

#### Deactivate Payment Link
\`\`\`
DELETE /api/payment-links/:accountId/:linkId
\`\`\`

---

### 2. Transactions

#### Get Transaction History
\`\`\`
GET /api/transactions/:accountId
\`\`\`

**Query Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| limit | number | Max results (1-100, default: 10) |
| starting_after | string | Cursor for pagination |
| ending_before | string | Cursor for pagination |
| status | string | Filter by status |
| created_gte | number | Filter by date (Unix timestamp) |
| created_lte | number | Filter by date (Unix timestamp) |

**Response:**
\`\`\`json
{
  "data": [...],
  "has_more": true,
  "total_count": 50,
  "pagination": {
    "first_id": "pi_xxx",
    "last_id": "pi_yyy"
  }
}
\`\`\`

#### Get Transaction Summary
\`\`\`
GET /api/transactions/:accountId/summary
\`\`\`

**Query Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| period | string | day, week, month, year |

---

### 3. Analytics

#### Get Analytics Dashboard
\`\`\`
GET /api/analytics/:accountId
\`\`\`

**Query Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| period | string | week, month, year |

**Response:**
\`\`\`json
{
  "current": {
    "revenue": 250000,
    "transaction_count": 42,
    "average_transaction": 5952,
    "success_rate": "95.5",
    "total_fees": 2500
  },
  "previous": {
    "revenue": 180000,
    "transaction_count": 35
  },
  "growth": {
    "revenue_percent": "38.89",
    "transactions_percent": "20.00"
  },
  "chart_data": [...],
  "payment_methods": [...]
}
\`\`\`

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - No access to resource |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limits

- 100 requests per 15 minutes per IP
- Responses include \`X-RateLimit-Remaining\` header

---

## Webhooks

Configure webhooks in Stripe Dashboard to receive:
- \`payment_intent.succeeded\`
- \`payment_intent.payment_failed\`
- \`payment_link.created\`
- \`account.updated\`
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'api-reference.md'),
    apiDocs.trim()
  );
  console.log('✅ Generated api-reference.md');
}

/**
 * Convert Mermaid files to SVG
 */
async function convertMermaidToSVG() {
  const mermaidFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.mmd'));
  
  for (const file of mermaidFiles) {
    const inputPath = path.join(OUTPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace('.mmd', '.svg'));
    
    try {
      execSync(`npx mmdc -i "${inputPath}" -o "${outputPath}" -b transparent`, {
        stdio: 'inherit'
      });
      console.log(`✅ Converted ${file} to SVG`);
    } catch (error) {
      console.warn(`⚠️ Could not convert ${file} to SVG (mmdc not available)`);
    }
  }
}

/**
 * Generate index HTML for diagrams
 */
function generateDiagramIndex() {
  const files = fs.readdirSync(OUTPUT_DIR);
  const diagrams = files.filter(f => f.endsWith('.svg') || f.endsWith('.mmd') || f.endsWith('.puml'));

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jeturing Pay - Diagramas de Arquitectura</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    h1 { color: #1f2937; }
    h2 { color: #374151; margin-top: 40px; }
    .diagram-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .diagram-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .diagram-card h3 { margin-top: 0; color: #6366f1; }
    .diagram-card a {
      color: #6366f1;
      text-decoration: none;
    }
    .diagram-card a:hover { text-decoration: underline; }
    img.preview {
      max-width: 100%;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <h1>📊 Jeturing Pay - Diagramas</h1>
  <p>Documentación visual generada automáticamente</p>
  
  <h2>Diagramas de Arquitectura</h2>
  <div class="diagram-grid">
    ${diagrams.map(d => `
    <div class="diagram-card">
      <h3>${d.replace(/\.(svg|mmd|puml)$/, '').replace(/-/g, ' ')}</h3>
      <a href="${d}" target="_blank">Ver diagrama →</a>
    </div>
    `).join('')}
  </div>
  
  <h2>Recursos Adicionales</h2>
  <ul>
    <li><a href="api-reference.md">Documentación de API</a></li>
    <li><a href="../api-reference/index.html">TypeDoc API Reference</a></li>
  </ul>
  
  <footer style="margin-top: 60px; color: #6b7280; font-size: 14px;">
    Generado el ${new Date().toLocaleDateString('es-ES')} - Jeturing Pay v1.0.0
  </footer>
</body>
</html>
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html.trim());
  console.log('✅ Generated index.html');
}

// Main execution
async function main() {
  console.log('🎨 Generating Jeturing Pay diagrams...\n');
  
  generateComponentDiagram();
  generateServiceDiagram();
  generatePaymentFlowDiagram();
  generateClassDiagram();
  generateERDiagram();
  generateStateDiagram();
  generateAPIDocumentation();
  
  console.log('\n📄 Converting to SVG...\n');
  await convertMermaidToSVG();
  
  console.log('\n📚 Generating index...\n');
  generateDiagramIndex();
  
  console.log('\n✨ Done! Diagrams available in docs/diagrams/');
}

main().catch(console.error);
