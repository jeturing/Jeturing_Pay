# Jeturing Pay - Stripe Terminal Android App

This is a customized version of the Stripe Terminal Android SDK example app, specifically configured for Jeturing Pay with support for Stripe Connected Accounts and simplified payment flows.

## Features

### 1. **Jeturing Pay Branding**
- App name: "Jeturing Pay"
- Customized UI and strings for Jeturing branding

### 2. **User Registration**
- New user registration flow with form validation
- Collects: Full Name, Email, Phone Number, and Business Name
- Automatically creates and stores Stripe Connected Account ID
- Registration accessible from the main Terminal screen

### 3. **Stripe Connected Accounts Support**
- All API calls now support Stripe Connected Accounts via `Stripe-Account` header
- Connected account ID is stored after registration and used for all subsequent operations
- Backend service methods updated to include account context

### 4. **Simplified Payment Flow**
- Quick payment interface with preset amounts ($5, $10, $20, $50, $100)
- Custom amount input option
- Removes advanced options (extended auth, incremental auth) for streamlined checkout
- One-tap payment processing
- Accessible from the Connected Reader screen

## Implementation Details

### New Files Created

1. **Models**
   - `User.kt` - User data model for registration
   - `RegistrationResponse.kt` - Response model from registration endpoint

2. **Fragments**
   - `RegistrationFragment.kt` - User registration screen
   - `SimplePaymentFragment.kt` - Simplified payment interface

3. **Layouts**
   - `fragment_registration.xml` - Registration form layout
   - `fragment_simple_payment.xml` - Simple payment interface layout

### Modified Files

1. **Network Layer**
   - `BackendService.kt` - Added registration endpoint and connected account headers
   - `ApiClient.kt` - Added user registration method and connected account ID storage
   
2. **Navigation**
   - `NavigationListener.kt` - Added registration and simple payment navigation methods
   - `MainActivity.kt` - Implemented new navigation handlers

3. **UI**
   - `strings.xml` - Updated app name and added Jeturing Pay specific strings
   - `fragment_terminal.xml` - Added registration button
   - `fragment_connected_reader.xml` - Added simple payment button
   - `TerminalFragment.kt` - Added registration button handler
   - `ConnectedReaderFragment.kt` - Added simple payment button handler

4. **Configuration**
   - `gradle.properties` - Set backend URL to `https://api.jeturing.com`

## Backend Requirements

The backend must support the following endpoints:

### 1. Registration Endpoint
```
POST /register_user
Content-Type: application/x-www-form-urlencoded

Parameters:
- full_name: String
- email: String
- phone: String
- business_name: String

Response:
{
  "success": true,
  "message": "Registration successful",
  "userId": "user_xxx",
  "stripeAccountId": "acct_xxx"
}
```

### 2. Connection Token with Connected Account
```
POST /connection_token
Headers:
  Stripe-Account: acct_xxx

Response:
{
  "secret": "pst_xxx"
}
```

### 3. Other Endpoints
All existing endpoints should support the `Stripe-Account` header:
- `/create_location`
- `/capture_payment_intent`
- `/cancel_payment_intent`

## Configuration

1. **Backend URL**: Update `EXAMPLE_BACKEND_URL` in `gradle.properties` to point to your Jeturing backend
   ```properties
   EXAMPLE_BACKEND_URL="https://api.jeturing.com"
   ```

2. **Build the app**:
   ```bash
   cd Example
   ./gradlew :kotlinapp:assembleDebug
   ```

3. **Install on device**:
   ```bash
   adb install kotlinapp/build/outputs/apk/debug/kotlinapp-debug.apk
   ```

## User Flow

### First Time User
1. Launch app → See Terminal screen
2. Tap "Register" button
3. Fill in registration form (name, email, phone, business name)
4. Tap "Register" → Account created with Stripe Connected Account
5. Automatically navigated to reader discovery/connection

### Existing User
1. Launch app → Terminal screen
2. Connect to reader via "Discover Readers"
3. Once connected, tap "Simple Checkout" for quick payments

### Making a Payment
1. From Connected Reader screen, tap "Simple Checkout"
2. Select preset amount or enter custom amount
3. Tap "Collect Payment"
4. Follow on-screen prompts to complete payment
5. Payment processed with connected account context

## Key Differences from Standard Stripe Terminal App

| Feature | Standard App | Jeturing Pay |
|---------|-------------|--------------|
| Branding | "Terminal" | "Jeturing Pay" |
| Account Type | Direct | Connected Accounts |
| Registration | Not available | Required for new users |
| Payment Flow | Advanced options | Simplified with presets |
| Backend Headers | None | Stripe-Account header |

## Security Notes

- All sensitive operations use HTTPS
- Connected account ID is stored in memory only
- No credentials stored locally
- Backend must validate all account operations
- Follow Stripe's Connected Account security best practices

## Testing

To test the app:

1. **With Simulated Reader**: Use the built-in simulator (no physical hardware needed)
2. **With Physical Reader**: Enable Bluetooth and pair with a Stripe reader
3. **With Backend**: Deploy a backend that implements the required endpoints

## Support

For issues or questions about:
- Stripe Terminal SDK: [Stripe Terminal Docs](https://stripe.com/docs/terminal/sdk/android)
- Stripe Connected Accounts: [Connected Accounts Docs](https://stripe.com/docs/connect)
- Jeturing Pay specific features: Contact Jeturing support

## License

This app is based on the Stripe Terminal Android SDK example, which is proprietary to Stripe.
Jeturing Pay customizations are copyright Jeturing.
