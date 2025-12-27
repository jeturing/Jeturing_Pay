/**
 * E2E Tests for Jeturing Pay Mobile App
 * Tests complete payment flows from UI perspective
 * 
 * @module E2ETests
 */

import { device, element, by, expect } from 'detox';

describe('Jeturing Pay E2E Tests', () => {
  
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // ================================
  // Onboarding Flow
  // ================================
  describe('Onboarding Flow', () => {
    it('should display onboarding screen on first launch', async () => {
      await expect(element(by.text('Bienvenido a Jeturing Pay'))).toBeVisible();
      await expect(element(by.id('onboarding-continue-button'))).toBeVisible();
    });

    it('should navigate to connect account screen', async () => {
      await element(by.id('onboarding-continue-button')).tap();
      await expect(element(by.text('Conectar tu cuenta'))).toBeVisible();
    });

    it('should show account setup form', async () => {
      await element(by.id('onboarding-continue-button')).tap();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('business-name-input'))).toBeVisible();
    });
  });

  // ================================
  // Dashboard Flow (requires authenticated state)
  // ================================
  describe('Dashboard Flow', () => {
    beforeAll(async () => {
      // Set up authenticated state
      await device.launchApp({
        newInstance: true,
        launchArgs: {
          mockAuth: true,
          accountId: 'acct_test_123',
        },
      });
    });

    it('should display dashboard after login', async () => {
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      await expect(element(by.text('Inicio'))).toBeVisible();
    });

    it('should show quick actions', async () => {
      await expect(element(by.id('quick-action-payment'))).toBeVisible();
      await expect(element(by.id('quick-action-link'))).toBeVisible();
    });

    it('should display balance summary', async () => {
      await expect(element(by.id('balance-card'))).toBeVisible();
    });
  });

  // ================================
  // Payment Link Flow
  // ================================
  describe('Payment Link Creation', () => {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { mockAuth: true },
      });
      // Navigate to payment link screen
      await element(by.id('tab-payment-link')).tap();
    });

    it('should display payment link creation form', async () => {
      await expect(element(by.text('Crear Link de Pago'))).toBeVisible();
      await expect(element(by.id('amount-input'))).toBeVisible();
    });

    it('should select preset amount', async () => {
      await element(by.text('$25')).tap();
      await expect(element(by.id('amount-input'))).toHaveText('25.00');
    });

    it('should enter custom amount', async () => {
      await element(by.id('amount-input')).clearText();
      await element(by.id('amount-input')).typeText('150.00');
      await expect(element(by.id('amount-input'))).toHaveText('150.00');
    });

    it('should add description', async () => {
      await element(by.id('description-input')).typeText('Servicio de consultoría');
      await expect(element(by.id('description-input'))).toHaveText('Servicio de consultoría');
    });

    it('should create payment link successfully', async () => {
      await element(by.text('$50')).tap();
      await element(by.id('create-link-button')).tap();
      
      // Wait for link creation
      await waitFor(element(by.text('¡Link Creado!')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('qr-code'))).toBeVisible();
      await expect(element(by.id('payment-link-url'))).toBeVisible();
    });

    it('should copy link to clipboard', async () => {
      await element(by.text('Copiar')).tap();
      await expect(element(by.text('✓ Copiado'))).toBeVisible();
    });

    it('should share link', async () => {
      await element(by.text('Compartir Link')).tap();
      // Share sheet should appear (system dialog)
    });

    it('should create new link after completion', async () => {
      await element(by.text('Crear Nuevo Link')).tap();
      await expect(element(by.text('Crear Link de Pago'))).toBeVisible();
    });

    it('should show fee calculation', async () => {
      await element(by.text('$100')).tap();
      await expect(element(by.text('Recibirás $99.00'))).toBeVisible();
    });
  });

  // ================================
  // Transaction History Flow
  // ================================
  describe('Transaction History', () => {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { mockAuth: true },
      });
      await element(by.id('tab-history')).tap();
    });

    it('should display transaction history screen', async () => {
      await expect(element(by.text('Historial'))).toBeVisible();
    });

    it('should show summary card', async () => {
      await expect(element(by.text('Resumen del Mes'))).toBeVisible();
      await expect(element(by.id('summary-revenue'))).toBeVisible();
    });

    it('should display filter pills', async () => {
      await expect(element(by.text('Todos'))).toBeVisible();
      await expect(element(by.text('Exitosos'))).toBeVisible();
      await expect(element(by.text('Pendientes'))).toBeVisible();
    });

    it('should filter by status', async () => {
      await element(by.text('Exitosos')).tap();
      // Verify filter is active
      await expect(element(by.id('filter-succeeded-active'))).toBeVisible();
    });

    it('should search transactions', async () => {
      await element(by.id('search-input')).typeText('$50');
      // Verify filtered results
    });

    it('should load more on scroll', async () => {
      await element(by.id('transaction-list')).scroll(500, 'down');
      await expect(element(by.id('loading-more'))).toBeVisible();
    });

    it('should pull to refresh', async () => {
      await element(by.id('transaction-list')).scroll(100, 'up');
      // Verify refresh indicator
    });

    it('should navigate to transaction detail', async () => {
      await element(by.id('transaction-item-0')).tap();
      await expect(element(by.text('Detalles de la Transacción'))).toBeVisible();
    });
  });

  // ================================
  // Transaction Detail Flow
  // ================================
  describe('Transaction Detail', () => {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { mockAuth: true },
      });
      await element(by.id('tab-history')).tap();
      await element(by.id('transaction-item-0')).tap();
    });

    it('should display transaction status', async () => {
      await expect(element(by.id('transaction-status'))).toBeVisible();
    });

    it('should show amount prominently', async () => {
      await expect(element(by.id('transaction-amount'))).toBeVisible();
    });

    it('should display financial breakdown', async () => {
      await expect(element(by.text('Desglose Financiero'))).toBeVisible();
      await expect(element(by.text('Monto Cobrado'))).toBeVisible();
      await expect(element(by.text('Comisión Jeturing (1%)'))).toBeVisible();
      await expect(element(by.text('Monto Neto'))).toBeVisible();
    });

    it('should open receipt', async () => {
      await element(by.text('Ver Recibo')).tap();
      // Should open in browser
    });

    it('should show refund option for succeeded transactions', async () => {
      await expect(element(by.text('Reembolsar'))).toBeVisible();
    });

    it('should confirm before refund', async () => {
      await element(by.text('Reembolsar')).tap();
      await expect(element(by.text('Confirmar Reembolso'))).toBeVisible();
      await element(by.text('Cancelar')).tap();
    });
  });

  // ================================
  // Payment Flow (Direct)
  // ================================
  describe('Direct Payment Flow', () => {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { mockAuth: true },
      });
      await element(by.id('tab-payment')).tap();
    });

    it('should display payment screen', async () => {
      await expect(element(by.text('Cobrar'))).toBeVisible();
    });

    it('should enter amount', async () => {
      await element(by.id('keypad-5')).tap();
      await element(by.id('keypad-0')).tap();
      await element(by.id('keypad-0')).tap();
      await element(by.id('keypad-0')).tap();
      await expect(element(by.text('$50.00'))).toBeVisible();
    });

    it('should proceed to payment collection', async () => {
      await element(by.id('proceed-payment-button')).tap();
      await expect(element(by.text('Acerca la tarjeta'))).toBeVisible();
    });
  });

  // ================================
  // Settings Flow
  // ================================
  describe('Settings', () => {
    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { mockAuth: true },
      });
      await element(by.id('tab-settings')).tap();
    });

    it('should display settings screen', async () => {
      await expect(element(by.text('Configuración'))).toBeVisible();
    });

    it('should show account info', async () => {
      await expect(element(by.id('account-info-card'))).toBeVisible();
    });

    it('should navigate to help', async () => {
      await element(by.text('Ayuda')).tap();
      await expect(element(by.text('Centro de Ayuda'))).toBeVisible();
    });

    it('should show logout option', async () => {
      await expect(element(by.text('Cerrar Sesión'))).toBeVisible();
    });

    it('should confirm logout', async () => {
      await element(by.text('Cerrar Sesión')).tap();
      await expect(element(by.text('¿Estás seguro?'))).toBeVisible();
    });
  });

  // ================================
  // Complete Payment Journey
  // ================================
  describe('Complete Payment Journey', () => {
    it('should complete full payment flow: create link → check history → view detail', async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { mockAuth: true },
      });

      // Step 1: Create payment link
      await element(by.id('tab-payment-link')).tap();
      await element(by.text('$100')).tap();
      await element(by.id('create-link-button')).tap();
      
      await waitFor(element(by.text('¡Link Creado!')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Step 2: Go to history
      await element(by.id('tab-history')).tap();
      await expect(element(by.text('Historial'))).toBeVisible();
      
      // Step 3: Check first transaction
      await element(by.id('transaction-item-0')).tap();
      await expect(element(by.text('Detalles de la Transacción'))).toBeVisible();
      
      // Step 4: Go back to dashboard
      await device.pressBack();
      await element(by.id('tab-dashboard')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });
  });

  // ================================
  // Error Handling
  // ================================
  describe('Error Handling', () => {
    it('should show error on network failure', async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { 
          mockAuth: true,
          simulateNetworkError: true,
        },
      });
      
      await element(by.id('tab-history')).tap();
      await expect(element(by.text('Error de conexión'))).toBeVisible();
    });

    it('should allow retry on error', async () => {
      await expect(element(by.text('Reintentar'))).toBeVisible();
      await element(by.text('Reintentar')).tap();
    });
  });

  // ================================
  // Accessibility
  // ================================
  describe('Accessibility', () => {
    it('should have accessible labels on main actions', async () => {
      await device.launchApp({
        newInstance: true,
        launchArgs: { mockAuth: true },
      });

      // Check accessibility labels exist
      await expect(element(by.label('Crear cobro'))).toBeVisible();
      await expect(element(by.label('Ver historial'))).toBeVisible();
    });
  });
});
