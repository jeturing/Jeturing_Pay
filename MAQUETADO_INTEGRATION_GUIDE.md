# 🎨 Maquetado Integration Guide - Jeturing Pay

## Overview

Complete integration of 27 HTML mockup templates from `/docs/Maquetado/` into the JeturingApp (Expo React Native).

## Implementation Status

### ✅ Phase 1 Complete (9/9 screens - 100%)

**Onboarding Flow (4 screens)**:
1. ✅ **OnboardingWelcomeScreen.tsx** - Animated welcome with brand introduction
2. ✅ **OnboardingCardEntryScreen.tsx** - Payment method setup with form validation
3. ✅ **OnboardingCurrencyScreen.tsx** - Currency selector (8 currencies)
4. ✅ **OnboardingTapToPayScreen.tsx** - NFC/Tap to Pay configuration

**Payment Initialization (3 screens)**:
5. ✅ **NewPaymentScreen.tsx** - TPV inventory interface with categories
6. ✅ **NumpadScreen.tsx** - Custom amount entry with validation
7. ✅ **PaymentModeSelectionScreen.tsx** - 4 payment method options

**Payment Management (2 screens)**:
8. ✅ **CancelPaymentScreen.tsx** - Payment cancellation confirmation
9. ✅ **BranchSelectionScreen.tsx** - Branch/location selector

### ⏳ Phase 2 Pending (5 screens - 0%)

**TPV Variants (3 screens)**:
- TPVMode1Screen.tsx - Basic terminal interface
- TPVMode2Screen.tsx - Enhanced terminal
- TPVMode3Screen.tsx - Advanced with inventory integration

**Receipt Management (2 screens)**:
- SendReceiptScreen.tsx - Email receipt delivery
- ReceiptVariantsScreen.tsx - Different receipt formats

### ⏳ Phase 3 Pending (5 screens - 0%)

**Settings Sub-screens (4 screens)**:
- AccountSettingsScreen.tsx - Profile management
- TerminalSettingsScreen.tsx - Terminal configuration
- AppPreferencesScreen.tsx - App preferences
- AboutScreen.tsx - About and credits

**Additional (1 screen)**:
- SplashScreen.tsx - App launch animation

---

## Phase 1 Implementation Details

### 1. Onboarding Flow

#### OnboardingWelcomeScreen
**Source**: `/docs/Maquetado/onboarding_-_bienvenida/code.html`

**Features**:
- Animated gradient background circles
- Jeturing brand with contactless payment icon
- Progress indicators (4 dots)
- Skip functionality
- "Powered by Jeturing CORE" badge
- Material Design components

**Navigation**:
```typescript
Skip → ConnectAccountScreen
Next → OnboardingCardEntryScreen
```

**Design Elements**:
- Primary color: #5A67D8 (Indigo)
- Background: #F7F8FC
- Gradient circles with blur effect
- Decorative rotated boxes

---

#### OnboardingCardEntryScreen
**Source**: `/docs/Maquetado/onboarding_-_entrada_tarjeta/code.html`

**Features**:
- Card number input with auto-formatting (XXXX XXXX XXXX XXXX)
- Expiry date validation (MM/YY format)
- CVV input (secure entry)
- Cardholder name capture
- Save card checkbox
- Form validation
- Progress indicator (2/4)

**Validation**:
- Card number: 16-19 digits with spaces
- Expiry: MM/YY format, future date
- CVV: 3 digits
- Name: Required, alpha characters

**Navigation**:
```typescript
Back → OnboardingWelcomeScreen
Next → OnboardingCurrencyScreen (after validation)
```

---

#### OnboardingCurrencyScreen
**Source**: `/docs/Maquetado/onboarding_-_monedas/code.html`

**Features**:
- 8 major currencies with flag emojis:
  - 🇺🇸 USD - US Dollar
  - 🇪🇺 EUR - Euro
  - 🇬🇧 GBP - British Pound
  - 🇲🇽 MXN - Mexican Peso
  - 🇨🇴 COP - Colombian Peso
  - 🇦🇷 ARS - Argentine Peso
  - 🇧🇷 BRL - Brazilian Real
  - 🇨🇱 CLP - Chilean Peso
- Radio button selection
- Search functionality (future)
- Progress indicator (3/4)

**Navigation**:
```typescript
Back → OnboardingCardEntryScreen
Next → OnboardingTapToPayScreen
```

---

#### OnboardingTapToPayScreen
**Source**: `/docs/Maquetado/onboarding_-_tap_to_pay/code.html`

**Features**:
- NFC toggle switch
- Permission requirements list:
  - ✓ Access to NFC
  - ✓ Location (Stripe requirement)
  - ✓ Internet connectivity
- Device compatibility check
- Info box with warnings
- Progress indicator (4/4)

**Navigation**:
```typescript
Back → OnboardingCurrencyScreen
Finish → ConnectAccountScreen
```

---

### 2. Payment Initialization

#### NewPaymentScreen
**Source**: `/docs/Maquetado/nuevo_cobro_1/code.html`

**Features**:
- TPV inventory interface
- Product search bar with icon
- Barcode scanner button
- Category filters (Todas, Bebidas, Snacks, Postres, Otros)
- Selected products list:
  - Product name
  - Quantity × Price
  - Total per item
  - Delete button
- Total calculation
- Branch information display
- User/cashier information
- Dual action buttons (Cobrar ahora / Ver historial)

**Data Flow**:
```typescript
Products → Cart → Total Calculation
Branch + User Info → Context Display
Continue → PaymentModeSelectionScreen(amount)
```

**Navigation**:
```typescript
Back → Dashboard
Cobrar ahora → PaymentModeSelectionScreen
Ver historial → TransactionHistoryScreen
```

---

#### NumpadScreen
**Source**: `/docs/Maquetado/numpad_para_captura_de_monto/code.html`

**Features**:
- Large amount display with currency (USD)
- 3×4 numpad grid:
  - Digits: 1-9, 0
  - Decimal point (.)
  - Backspace icon
- Decimal validation (max 2 decimals)
- Amount formatting ($XXX.XX)
- Jeturing brand header
- Disabled continue button when amount = 0

**Validation**:
- Only one decimal point allowed
- Maximum 2 decimal places
- Cannot start with 0 (except 0.XX)
- Backspace removes last character

**Navigation**:
```typescript
Continue → PaymentModeSelectionScreen(amount)
```

---

#### PaymentModeSelectionScreen
**Source**: `/docs/Maquetado/selección_de_modo_de_cobro/code.html`

**Features**:
- 4 payment method cards:
  1. 🎹 **Entrada Manual** - Manual card entry
  2. 📱 **Tap to Pay** - NFC contactless
  3. 📷 **Código QR** - QR code generation
  4. 🔗 **Link de Pago** - Payment link sharing
- Radio button selection
- Method description for each option
- Amount display in subtitle
- Icon containers with selected state

**Navigation**:
```typescript
Manual → PaymentScreen(amount)
Tap to Pay → PaymentScreen(amount, mode='tap_to_pay')
QR Code → PaymentLinkScreen(amount, mode='qr')
Payment Link → PaymentLinkScreen(amount)
```

---

### 3. Payment Management

#### CancelPaymentScreen
**Source**: `/docs/Maquetado/cancelación_de_pago/code.html`

**Features**:
- Large warning icon (alert-circle)
- Confirmation title: "¿Cancelar pago?"
- Transaction details card:
  - Amount to cancel
  - Transaction time
  - Transaction ID
- Warning message about potential fees
- Two action buttons:
  - **Sí, Cancelar** (destructive, red)
  - **No, Continuar** (primary, outlined)

**Use Cases**:
- User wants to abort payment mid-process
- Error occurred during payment
- Wrong amount entered
- Customer changed mind

**Navigation**:
```typescript
Close → Go back
Sí, Cancelar → Dashboard
No, Continuar → Go back
```

---

#### BranchSelectionScreen
**Source**: `/docs/Maquetado/selección_de_sucursal/code.html`

**Features**:
- Branch list with cards:
  - Store icon
  - Branch name
  - Address with map marker icon
  - Phone number
  - Terminal ID
  - Selection checkbox
- Add new branch button (dashed border)
- Details for each branch:
  - 📍 Address
  - 📞 Phone
  - 💳 Terminal ID

**Sample Branches**:
1. Sucursal Principal - term_abc123
2. Sucursal Norte - term_def456
3. Sucursal Sur - term_ghi789

**Navigation**:
```typescript
Back → Previous screen
Continue → Dashboard(selectedBranch)
Add Branch → BranchCreationScreen (future)
```

---

## Design System Applied

### Colors (from Maquetado)

```typescript
const colors = {
  // Primary
  primary: '#0022FF',        // Jeturing Blue
  primaryVariant: '#5A67D8', // Indigo (onboarding)
  primaryLight: '#4F46E5',   // Indigo 600 (numpad)
  
  // Background
  backgroundLight: '#F7F8FC',
  backgroundLightAlt: '#F8FAFC',
  backgroundSecondary: '#E6E8F4',
  backgroundWhite: '#FFF',
  
  // Text
  textPrimary: '#0C0E1D',
  textPrimaryAlt: '#0F172A',
  textSecondary: '#4551A1',
  textMuted: '#64748B',
  textPlaceholder: '#94A3B8',
  
  // Status
  success: '#32D583',
  error: '#E25950',
  warning: '#F59E0B',
  info: '#4551A1',
  
  // Borders
  border: '#E2E8F0',
  borderLight: '#CBD5E1',
  divider: '#E0E0E0',
  
  // Gradients
  gradientCircle: 'rgba(90, 103, 216, 0.1)',
};
```

### Typography

```typescript
const typography = {
  // Display
  displayLarge: { fontSize: 64, fontWeight: 'bold' },    // Numpad amount
  displayMedium: { fontSize: 32, fontWeight: 'bold' },   // Brand name
  displaySmall: { fontSize: 28, fontWeight: 'bold' },    // Page titles
  
  // Headings
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  h4: { fontSize: 16, fontWeight: '600' },
  
  // Body
  bodyLarge: { fontSize: 18, fontWeight: 'normal' },
  bodyMedium: { fontSize: 16, fontWeight: 'normal' },
  bodySmall: { fontSize: 14, fontWeight: 'normal' },
  
  // Caption
  caption: { fontSize: 13, fontWeight: 'normal' },
  captionSmall: { fontSize: 12, fontWeight: 'normal' },
  
  // Button
  button: { fontSize: 16, fontWeight: '600' },
};
```

### Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};
```

### Border Radius

```typescript
const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999, // Pill buttons
};
```

### Components

#### Button Styles

```typescript
// Primary Button
{
  backgroundColor: colors.primary,
  paddingVertical: 16,
  borderRadius: borderRadius.md,
  alignItems: 'center',
}

// Secondary Button (Outlined)
{
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: colors.primary,
  paddingVertical: 16,
  borderRadius: borderRadius.md,
  alignItems: 'center',
}

// Destructive Button
{
  backgroundColor: colors.error,
  paddingVertical: 16,
  borderRadius: borderRadius.md,
  alignItems: 'center',
}

// Pill Button (Onboarding next)
{
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.textPrimary,
  justifyContent: 'center',
  alignItems: 'center',
}
```

#### Card Styles

```typescript
// Standard Card
{
  backgroundColor: colors.backgroundWhite,
  borderRadius: borderRadius.lg,
  padding: 20,
  borderWidth: 2,
  borderColor: colors.border,
}

// Selected Card
{
  backgroundColor: '#F0F4FF',
  borderColor: colors.primary,
}

// Info Card
{
  backgroundColor: colors.backgroundLight,
  padding: 16,
}
```

#### Input Styles

```typescript
// Text Input
{
  backgroundColor: colors.backgroundWhite,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: borderRadius.md,
  padding: 16,
  fontSize: 16,
  color: colors.textPrimary,
}

// Search Input
{
  backgroundColor: colors.backgroundSecondary,
  borderRadius: borderRadius.md,
  paddingHorizontal: 16,
  height: 56,
}
```

---

## Navigation Structure

### Updated AppNavigator.tsx

```typescript
// Auth Stack (No Account)
- Onboarding
- OnboardingWelcome ✅ NEW
- OnboardingCardEntry ✅ NEW
- OnboardingCurrency ✅ NEW
- OnboardingTapToPay ✅ NEW
- ConnectAccount
- Login

// App Stack (Authenticated)
- AppTabs (Dashboard, Payment, History, Settings)
  
// Payment Flow - NEW SCREENS
- NewPayment ✅
- Numpad ✅
- PaymentModeSelection ✅
- CancelPayment ✅
- BranchSelection ✅

// Payment Processing (Existing)
- PaymentLink
- PaymentSuccess
- CustomerRegistration

// Transaction Management (Existing)
- TransactionDetail
```

---

## Dependencies

### Added
```json
{
  "expo-linear-gradient": "~14.0.1"
}
```

### Existing (Used)
- `@react-navigation/stack` - Navigation
- `@react-navigation/bottom-tabs` - Tab navigation
- `@expo/vector-icons` - Material icons
- `react-native-svg` - SVG support for QR (future)
- `react-native-qrcode-svg` - QR generation (future)

---

## Testing Checklist

### Onboarding Flow
- [ ] Welcome screen loads with animations
- [ ] Skip button navigates correctly
- [ ] Card entry validates all fields
- [ ] Card number formats with spaces
- [ ] Expiry date formats as MM/YY
- [ ] Currency selection saves choice
- [ ] Tap to Pay toggle works
- [ ] Progress dots update correctly
- [ ] Back navigation works on each screen

### Payment Flow
- [ ] NewPayment displays products correctly
- [ ] Categories filter products
- [ ] Product search works
- [ ] Cart total calculates correctly
- [ ] Delete product removes from cart
- [ ] Numpad validates decimals (max 2)
- [ ] Numpad formats amount display
- [ ] PaymentMode selection works
- [ ] Each mode navigates correctly
- [ ] Branch selection saves choice

### Cancel Payment
- [ ] Cancel warning displays correctly
- [ ] Transaction details show correctly
- [ ] Confirm button cancels payment
- [ ] Continue button goes back

---

## Phase 2 Planning

### TPV Variants (3 screens)

**TPVMode1Screen** - Basic Terminal
- Simple product selection
- Manual amount entry
- Basic receipt printing

**TPVMode2Screen** - Enhanced Terminal
- Product catalog with images
- Discount management
- Multiple payment methods

**TPVMode3Screen** - Advanced Terminal
- Full inventory integration
- Stock management
- Advanced reporting
- Customer loyalty integration

### Receipt Management (2 screens)

**SendReceiptScreen** - Email/SMS Delivery
- Email input with validation
- SMS option with phone input
- Preview receipt before sending
- Success confirmation

---

## Phase 3 Planning

### Settings Sub-screens (4 screens)

**AccountSettingsScreen**
- Profile photo upload
- Name, email, phone editing
- Change password
- Logout button

**TerminalSettingsScreen**
- Terminal ID display
- Connection status
- Firmware version
- Reconnect/restart options

**AppPreferencesScreen**
- Language selection
- Theme (Light/Dark/Auto)
- Default currency
- Notifications settings

**AboutScreen**
- App version
- Company information
- Terms of service
- Privacy policy
- Licenses

### Additional

**SplashScreen**
- Animated logo
- Loading indicator
- Version display

---

## File Structure

```
JeturingApp/src/screens/
├── Onboarding/
│   ├── OnboardingWelcomeScreen.tsx ✅
│   ├── OnboardingCardEntryScreen.tsx ✅
│   ├── OnboardingCurrencyScreen.tsx ✅
│   └── OnboardingTapToPayScreen.tsx ✅
│
├── Payment/
│   ├── NewPaymentScreen.tsx ✅
│   ├── NumpadScreen.tsx ✅
│   ├── PaymentModeSelectionScreen.tsx ✅
│   ├── CancelPaymentScreen.tsx ✅
│   └── BranchSelectionScreen.tsx ✅
│
├── TPV/
│   ├── TPVMode1Screen.tsx ⏳
│   ├── TPVMode2Screen.tsx ⏳
│   └── TPVMode3Screen.tsx ⏳
│
├── Receipt/
│   └── SendReceiptScreen.tsx ⏳
│
├── Settings/
│   ├── AccountSettingsScreen.tsx ⏳
│   ├── TerminalSettingsScreen.tsx ⏳
│   ├── AppPreferencesScreen.tsx ⏳
│   └── AboutScreen.tsx ⏳
│
└── SplashScreen.tsx ⏳
```

---

## Progress Summary

| Phase | Screens | Status | Progress |
|-------|---------|--------|----------|
| Phase 1 | 9 | ✅ Complete | 100% |
| Phase 2 | 5 | ⏳ Pending | 0% |
| Phase 3 | 5 | ⏳ Pending | 0% |
| **Previously** | 8 | ✅ Complete | 100% |
| **Total** | 27 | 🔄 In Progress | 63% |

---

## Next Steps

1. **Test Phase 1 Screens**
   - Run app with `expo start`
   - Test all navigation flows
   - Verify data passing between screens
   - Check form validations
   - Test responsive layouts

2. **Implement Phase 2**
   - TPV Mode variants
   - Receipt sending functionality
   - Email/SMS integration

3. **Implement Phase 3**
   - Settings sub-screens
   - Splash screen
   - Polish and refinements

4. **Integration Testing**
   - End-to-end flow testing
   - Performance optimization
   - Accessibility testing
   - Cross-platform testing (iOS/Android)

5. **Documentation**
   - API documentation
   - User guides
   - Developer guides
   - Deployment guides

---

## Known Issues / TODOs

- [ ] Add proper TypeScript types for all route params
- [ ] Implement actual API calls (currently using mock data)
- [ ] Add loading states for async operations
- [ ] Implement error boundaries
- [ ] Add analytics tracking
- [ ] Implement deep linking for QR code flow
- [ ] Add unit tests for each screen
- [ ] Add E2E tests for complete flows
- [ ] Optimize bundle size
- [ ] Add accessibility labels
- [ ] Implement internationalization (i18n)

---

**Document Version**: 1.0
**Last Updated**: January 17, 2026
**Status**: Phase 1 Complete ✅
