# Jeturing Pay Architecture Overview

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         JETURING PAY APP                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

                        App Launch
                            │
                            ▼
                   ┌────────────────┐
                   │ TerminalFragment│
                   │  (Main Screen)  │
                   └────────┬────────┘
                            │
            ┌───────────────┴────────────────┐
            │                                │
            ▼                                ▼
   ┌────────────────┐              ┌──────────────────┐
   │ Registration   │              │ Discover Readers │
   │    Button      │              │     Button       │
   └────────┬───────┘              └────────┬─────────┘
            │                                │
            ▼                                ▼
┌───────────────────────┐         ┌──────────────────────┐
│ RegistrationFragment  │         │  DiscoveryFragment   │
│                       │         │                      │
│ - Full Name          │         │ - Bluetooth Scan     │
│ - Email              │         │ - Internet Reader    │
│ - Phone              │         │ - Tap to Pay         │
│ - Business Name      │         │ - USB Reader         │
└──────────┬────────────┘         └──────────┬───────────┘
           │                                 │
           │ Submit                          │ Connect
           ▼                                 ▼
    [Create Stripe              ┌───────────────────────┐
     Connected Account]         │ConnectedReaderFragment│
           │                    │                       │
           │                    │ ┌─────────────────┐  │
           └────────────────────┼▶│ Simple Checkout │  │
                                │ └────────┬────────┘  │
                                │          │           │
                                │ ┌────────▼────────┐  │
                                │ │ Collect Payment │  │
                                │ └─────────────────┘  │
                                └───────────────────────┘
                                          │
                                          ▼
                                ┌──────────────────────┐
                                │ SimplePaymentFragment│
                                │                      │
                                │ Preset Amounts:      │
                                │ [$5] [$10] [$20]    │
                                │ [$50] [$100] [Custom]│
                                └──────────┬───────────┘
                                          │
                                          ▼
                                    [Process Payment]
                                          │
                                          ▼
                                  ┌────────────────┐
                                  │ EventFragment  │
                                  │ (Payment Flow) │
                                  └────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MainActivity                                                    │
│  ├── TerminalFragment (Entry)                                   │
│  ├── RegistrationFragment (New User)                            │
│  ├── DiscoveryFragment (Reader Connection)                      │
│  ├── ConnectedReaderFragment (Main Menu)                        │
│  ├── SimplePaymentFragment (Quick Payment)                      │
│  ├── PaymentFragment (Advanced Payment)                         │
│  └── EventFragment (Transaction Progress)                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BUSINESS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  NavigationListener (Interface)                                 │
│  ├── onRequestRegistration()                                    │
│  ├── onSelectSimplePaymentWorkflow()                           │
│  ├── onRequestPayment(...)                                      │
│  └── ... (other navigation methods)                             │
│                                                                  │
│  Models                                                          │
│  ├── User (Registration data)                                   │
│  ├── RegistrationResponse (Backend response)                    │
│  ├── ConnectionToken (Terminal auth)                            │
│  └── ... (other models)                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         NETWORK LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ApiClient (Singleton)                                           │
│  ├── connectedAccountId: String?                                │
│  ├── createConnectionToken()                                    │
│  ├── registerUser(...)                                          │
│  ├── createLocation(...)                                        │
│  ├── capturePaymentIntent(...)                                  │
│  └── cancelPaymentIntent(...)                                   │
│                                                                  │
│  BackendService (Retrofit Interface)                            │
│  ├── @Header("Stripe-Account")                                  │
│  ├── POST /connection_token                                     │
│  ├── POST /register_user                                        │
│  ├── POST /create_location                                      │
│  ├── POST /capture_payment_intent                               │
│  └── POST /cancel_payment_intent                                │
│                                                                  │
│  TokenProvider                                                   │
│  └── fetchConnectionToken(callback)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STRIPE SDK LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Terminal SDK                                                    │
│  ├── initTerminal(...)                                          │
│  ├── discoverReaders(...)                                       │
│  ├── connectReader(...)                                         │
│  ├── collectPaymentMethod(...)                                  │
│  └── processPayment(...)                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: User Registration

```
User Input                    App                    Backend               Stripe
    │                         │                        │                    │
    │  Fill Registration      │                        │                    │
    │  Form                   │                        │                    │
    ├────────────────────────▶│                        │                    │
    │                         │                        │                    │
    │  Tap "Register"         │                        │                    │
    ├────────────────────────▶│                        │                    │
    │                         │                        │                    │
    │                         │  POST /register_user   │                    │
    │                         ├───────────────────────▶│                    │
    │                         │                        │                    │
    │                         │                        │  Create Connected  │
    │                         │                        │  Account           │
    │                         │                        ├───────────────────▶│
    │                         │                        │                    │
    │                         │                        │  Account Created   │
    │                         │                        │  (acct_xxx)        │
    │                         │                        ◀───────────────────┤
    │                         │                        │                    │
    │                         │  Registration Response │                    │
    │                         │  {success, userId,     │                    │
    │                         │   stripeAccountId}     │                    │
    │                         ◀───────────────────────┤                    │
    │                         │                        │                    │
    │  Store accountId        │                        │                    │
    │  in ApiClient           │                        │                    │
    │  ◀──────────────────────┤                        │                    │
    │                         │                        │                    │
    │  Navigate to Terminal   │                        │                    │
    ◀─────────────────────────┤                        │                    │
```

## Data Flow: Simple Payment

```
User Input                    App                    Backend               Stripe
    │                         │                        │                    │
    │  Select Amount          │                        │                    │
    │  ($20)                  │                        │                    │
    ├────────────────────────▶│                        │                    │
    │                         │                        │                    │
    │  Tap "Collect Payment"  │                        │                    │
    ├────────────────────────▶│                        │                    │
    │                         │                        │                    │
    │                         │  Terminal SDK:         │                    │
    │                         │  collectPaymentMethod()│                    │
    │                         │  (with accountId)      │                    │
    │                         ├───────────────────────────────────────────▶│
    │                         │                        │                    │
    │  Insert/Tap Card        │                        │                    │
    ├────────────────────────▶│                        │                    │
    │                         │                        │                    │
    │                         │  Payment Method        │                    │
    │                         │  Collected             │                    │
    │                         ◀───────────────────────────────────────────┤
    │                         │                        │                    │
    │                         │  POST /capture_payment │                    │
    │                         │  Header: Stripe-Account│                    │
    │                         ├───────────────────────▶│                    │
    │                         │                        │                    │
    │                         │                        │  Capture Payment   │
    │                         │                        │  (on connected acct)│
    │                         │                        ├───────────────────▶│
    │                         │                        │                    │
    │                         │                        │  Payment Captured  │
    │                         │                        ◀───────────────────┤
    │                         │                        │                    │
    │                         │  Success               │                    │
    │                         ◀───────────────────────┤                    │
    │                         │                        │                    │
    │  Payment Complete       │                        │                    │
    ◀─────────────────────────┤                        │                    │
```

## Key Differences from Standard Stripe Terminal

| Aspect | Standard Terminal | Jeturing Pay |
|--------|------------------|--------------|
| **Account Model** | Direct charges to platform | Connected accounts per user |
| **Registration** | No registration flow | Full user registration |
| **Payment UI** | Advanced options | Simplified presets |
| **Backend Headers** | None | Stripe-Account required |
| **User Management** | Platform manages | Per-merchant accounts |
| **Revenue Model** | Platform receives all | Platform takes application fee |

## Security Architecture

```
┌──────────────────────────────────────────────────┐
│                  SECURITY LAYERS                  │
└──────────────────────────────────────────────────┘

1. NETWORK SECURITY
   ├── HTTPS/TLS encryption for all API calls
   ├── Certificate pinning (recommended)
   └── Secure backend endpoints

2. DATA SECURITY
   ├── No API keys stored in app
   ├── Connection tokens expire quickly
   ├── Account ID stored in memory only
   └── No sensitive data persisted

3. STRIPE SECURITY
   ├── Connected Account isolation
   ├── PCI-compliant payment handling
   ├── Stripe Terminal SDK security
   └── Platform application fees

4. BACKEND SECURITY
   ├── Account ID validation
   ├── Rate limiting
   ├── Input sanitization
   └── Webhook signature verification
```

## Technology Stack

```
┌──────────────────────────────────────────────────┐
│              TECHNOLOGY COMPONENTS                │
└──────────────────────────────────────────────────┘

MOBILE APP (Android)
├── Language: Kotlin
├── Min SDK: 26 (Android 8.0)
├── Target SDK: 35
├── Architecture: Fragment-based navigation
├── UI: Material Design 3
├── Networking: Retrofit + OkHttp
├── Coroutines: kotlinx-coroutines
└── Stripe Terminal SDK: 4.7.3

BACKEND (Example: Node.js)
├── Framework: Express.js
├── API: RESTful
├── Format: JSON + URL-encoded
├── Stripe SDK: stripe-node
└── Authentication: Connected Account headers

STRIPE SERVICES
├── Terminal API
├── Connected Accounts
├── Payment Intents
├── Locations API
└── Webhooks
```

## File Structure

```
stripe-terminal-android/
├── Example/
│   ├── kotlinapp/
│   │   └── src/main/
│   │       ├── java/com/stripe/example/
│   │       │   ├── MainActivity.kt (✨ Updated)
│   │       │   ├── NavigationListener.kt (✨ Updated)
│   │       │   ├── fragment/
│   │       │   │   ├── RegistrationFragment.kt (✨ NEW)
│   │       │   │   ├── SimplePaymentFragment.kt (✨ NEW)
│   │       │   │   ├── TerminalFragment.kt (✨ Updated)
│   │       │   │   └── ConnectedReaderFragment.kt (✨ Updated)
│   │       │   ├── model/
│   │       │   │   ├── User.kt (✨ NEW)
│   │       │   │   └── RegistrationResponse.kt (✨ NEW)
│   │       │   └── network/
│   │       │       ├── ApiClient.kt (✨ Updated)
│   │       │       └── BackendService.kt (✨ Updated)
│   │       └── res/
│   │           ├── layout/
│   │           │   ├── fragment_registration.xml (✨ NEW)
│   │           │   ├── fragment_simple_payment.xml (✨ NEW)
│   │           │   ├── fragment_terminal.xml (✨ Updated)
│   │           │   └── fragment_connected_reader.xml (✨ Updated)
│   │           └── values/
│   │               └── strings.xml (✨ Updated)
│   └── gradle.properties (✨ Updated)
├── JETURING_PAY_README.md (✨ NEW)
├── BACKEND_GUIDE.md (✨ NEW)
└── ARCHITECTURE.md (✨ NEW - This file)

Legend:
✨ NEW - Newly created file
✨ Updated - Modified existing file
```

## Deployment Workflow

```
┌────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PROCESS                       │
└────────────────────────────────────────────────────────────┘

DEVELOPMENT
    │
    ├── 1. Clone repository
    ├── 2. Configure backend URL in gradle.properties
    ├── 3. Build: ./gradlew :kotlinapp:assembleDebug
    ├── 4. Test on emulator or device
    └── 5. Iterate
    │
    ▼
BACKEND SETUP
    │
    ├── 1. Deploy backend (Heroku/AWS/GCP)
    ├── 2. Configure Stripe API keys
    ├── 3. Test endpoints
    └── 4. Set up webhooks
    │
    ▼
PRODUCTION
    │
    ├── 1. Update to production API keys
    ├── 2. Build release: ./gradlew :kotlinapp:assembleRelease
    ├── 3. Sign APK with release keystore
    ├── 4. Test thoroughly
    ├── 5. Upload to Google Play Console
    └── 6. Submit for review
    │
    ▼
MONITORING
    │
    ├── Monitor crash reports
    ├── Track payment success rates
    ├── Watch connected account metrics
    └── Gather user feedback
```

## Future Enhancements

Potential features to add:

1. **User Authentication**
   - Login/logout functionality
   - Password recovery
   - Session management

2. **Transaction History**
   - View past payments
   - Generate receipts
   - Export reports

3. **Multi-location Support**
   - Manage multiple locations
   - Location-based reporting
   - Location switching

4. **Offline Mode**
   - Store transactions offline
   - Sync when online
   - Conflict resolution

5. **Analytics Dashboard**
   - Sales metrics
   - Performance graphs
   - Revenue tracking

6. **Notifications**
   - Payment confirmations
   - Reader status alerts
   - Account updates

7. **Settings**
   - App preferences
   - Receipt customization
   - Tax configuration

8. **Multi-language Support**
   - Spanish (importante para Jeturing)
   - Portuguese
   - Other languages
