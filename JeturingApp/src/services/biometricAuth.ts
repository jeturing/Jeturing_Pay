/**
 * Biometric Authentication Service
 * Handles FaceID/TouchID/Fingerprint authentication and secure credential storage
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';

// Secure storage keys
const KEYS = {
  ACCOUNT_ID: 'jeturing_account_id',
  BUSINESS_NAME: 'jeturing_business_name',
  PHONE: 'jeturing_phone',
  EMAIL: 'jeturing_email',
  IS_REGISTERED: 'jeturing_is_registered',
  DEVICE_ID: 'jeturing_device_id',
};

export interface StoredCredentials {
  accountId: string;
  businessName: string;
  phone: string;
  email: string;
}

export interface BiometricStatus {
  isAvailable: boolean;
  biometricType: 'fingerprint' | 'facial' | 'iris' | 'none';
  isEnrolled: boolean;
}

/**
 * Check if biometric authentication is available on this device
 */
export const checkBiometricAvailability = async (): Promise<BiometricStatus> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType: BiometricStatus['biometricType'] = 'none';

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'facial';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }

    return {
      isAvailable: hasHardware,
      biometricType,
      isEnrolled,
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      isAvailable: false,
      biometricType: 'none',
      isEnrolled: false,
    };
  }
};

/**
 * Get the display name for the biometric type
 */
export const getBiometricDisplayName = (type: BiometricStatus['biometricType']): string => {
  switch (type) {
    case 'facial':
      return Platform.OS === 'ios' ? 'Face ID' : 'Reconocimiento Facial';
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Huella Digital';
    case 'iris':
      return 'Escaneo de Iris';
    default:
      return 'Biometría';
  }
};

/**
 * Authenticate user with biometrics
 */
export const authenticateWithBiometrics = async (
  reason: string = 'Confirma tu identidad para acceder'
): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false, // Allow PIN/password fallback
      fallbackLabel: 'Usar contraseña',
    });

    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

/**
 * Save credentials securely after successful Stripe onboarding
 */
export const saveCredentials = async (credentials: StoredCredentials): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(KEYS.ACCOUNT_ID, credentials.accountId);
    await SecureStore.setItemAsync(KEYS.BUSINESS_NAME, credentials.businessName);
    await SecureStore.setItemAsync(KEYS.PHONE, credentials.phone);
    await SecureStore.setItemAsync(KEYS.EMAIL, credentials.email);
    await SecureStore.setItemAsync(KEYS.IS_REGISTERED, 'true');
    
    // Generate a unique device ID for this registration
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await SecureStore.setItemAsync(KEYS.DEVICE_ID, deviceId);

    console.log('Credentials saved securely');
    return true;
  } catch (error) {
    console.error('Error saving credentials:', error);
    return false;
  }
};

/**
 * Retrieve stored credentials
 */
export const getStoredCredentials = async (): Promise<StoredCredentials | null> => {
  try {
    const isRegistered = await SecureStore.getItemAsync(KEYS.IS_REGISTERED);
    
    if (isRegistered !== 'true') {
      return null;
    }

    const accountId = await SecureStore.getItemAsync(KEYS.ACCOUNT_ID);
    const businessName = await SecureStore.getItemAsync(KEYS.BUSINESS_NAME);
    const phone = await SecureStore.getItemAsync(KEYS.PHONE);
    const email = await SecureStore.getItemAsync(KEYS.EMAIL);

    if (!accountId) {
      return null;
    }

    return {
      accountId,
      businessName: businessName || '',
      phone: phone || '',
      email: email || '',
    };
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
};

/**
 * Check if user has registered credentials on this device
 */
export const hasStoredCredentials = async (): Promise<boolean> => {
  try {
    const isRegistered = await SecureStore.getItemAsync(KEYS.IS_REGISTERED);
    const accountId = await SecureStore.getItemAsync(KEYS.ACCOUNT_ID);
    return isRegistered === 'true' && !!accountId;
  } catch (error) {
    return false;
  }
};

/**
 * Clear all stored credentials (logout)
 */
export const clearCredentials = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(KEYS.ACCOUNT_ID);
    await SecureStore.deleteItemAsync(KEYS.BUSINESS_NAME);
    await SecureStore.deleteItemAsync(KEYS.PHONE);
    await SecureStore.deleteItemAsync(KEYS.EMAIL);
    await SecureStore.deleteItemAsync(KEYS.IS_REGISTERED);
    await SecureStore.deleteItemAsync(KEYS.DEVICE_ID);
    console.log('Credentials cleared');
  } catch (error) {
    console.error('Error clearing credentials:', error);
  }
};

/**
 * Full biometric login flow
 * 1. Check if credentials exist
 * 2. Authenticate with biometrics
 * 3. Return credentials if successful
 */
export const biometricLogin = async (): Promise<StoredCredentials | null> => {
  try {
    // Check if we have stored credentials
    const hasCredentials = await hasStoredCredentials();
    if (!hasCredentials) {
      return null;
    }

    // Check biometric availability
    const biometricStatus = await checkBiometricAvailability();
    if (!biometricStatus.isAvailable || !biometricStatus.isEnrolled) {
      // Fallback: return credentials without biometric (device has no biometrics)
      console.log('Biometrics not available, using stored credentials directly');
      return await getStoredCredentials();
    }

    // Authenticate with biometrics
    const biometricName = getBiometricDisplayName(biometricStatus.biometricType);
    const isAuthenticated = await authenticateWithBiometrics(
      `Usa ${biometricName} para acceder a tu cuenta`
    );

    if (!isAuthenticated) {
      return null;
    }

    // Return stored credentials
    return await getStoredCredentials();
  } catch (error) {
    console.error('Biometric login error:', error);
    return null;
  }
};

/**
 * Register new device with biometrics
 * Called after successful Stripe account verification
 */
export const registerDeviceWithBiometrics = async (
  credentials: StoredCredentials
): Promise<boolean> => {
  try {
    const biometricStatus = await checkBiometricAvailability();
    
    if (biometricStatus.isAvailable && biometricStatus.isEnrolled) {
      const biometricName = getBiometricDisplayName(biometricStatus.biometricType);
      
      // Ask user to confirm biometric registration
      const isAuthenticated = await authenticateWithBiometrics(
        `Confirma con ${biometricName} para vincular este dispositivo`
      );

      if (!isAuthenticated) {
        Alert.alert(
          'Biometría no configurada',
          'Puedes configurarla más tarde en ajustes.'
        );
        // Still save credentials, but biometrics won't be required
      }
    }

    // Save credentials regardless of biometric status
    return await saveCredentials(credentials);
  } catch (error) {
    console.error('Error registering device:', error);
    return false;
  }
};

export default {
  checkBiometricAvailability,
  getBiometricDisplayName,
  authenticateWithBiometrics,
  saveCredentials,
  getStoredCredentials,
  hasStoredCredentials,
  clearCredentials,
  biometricLogin,
  registerDeviceWithBiometrics,
};
