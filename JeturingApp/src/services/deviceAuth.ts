/**
 * Device Authentication Service
 * Integrates with backend device management endpoints
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://api-001.sajet.us';
const API_KEY = Constants.expoConfig?.extra?.apiKey || process.env.EXPO_PUBLIC_API_KEY || '';

// Secure storage keys
const KEYS = {
  DEVICE_ID: 'jeturing_device_id',
  ACCESS_TOKEN: 'jeturing_access_token',
  ACCOUNT_ID: 'jeturing_account_id',
  BUSINESS_NAME: 'jeturing_business_name',
};

// ============== INTERFACES ==============

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'android' | 'ios';
  biometricType: 'fingerprint' | 'facial' | 'none';
}

export interface RegisteredDevice {
  device_id: string;
  device_name: string;
  device_type: string;
  biometric_type: string | null;
  status: 'active' | 'pending' | 'revoked';
  registered_at: string;
  last_access: string | null;
  is_primary: boolean;
}

export interface DeviceAuthResult {
  authorized: boolean;
  accountId: string;
  businessName: string;
  deviceStatus: string;
  accessToken?: string;
  message: string;
}

export interface BusinessSearchResult {
  found: boolean;
  accountId?: string;
  businessName?: string;
  requiresVerification: boolean;
  verificationMethod: string;
}

// ============== HELPERS ==============

/**
 * Generate or retrieve unique device ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync(KEYS.DEVICE_ID);
    
    if (!deviceId) {
      // Generate new device ID
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await SecureStore.setItemAsync(KEYS.DEVICE_ID, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    // Fallback to AsyncStorage if SecureStore fails
    let deviceId = await AsyncStorage.getItem(KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  }
};

/**
 * Get device name (user-friendly)
 */
export const getDeviceName = (): string => {
  if (Platform.OS === 'ios') {
    return `iPhone ${Constants.deviceName || 'de Usuario'}`;
  }
  return `Android ${Constants.deviceName || 'de Usuario'}`;
};

/**
 * Get biometric type available on device
 */
export const getBiometricType = async (): Promise<'fingerprint' | 'facial' | 'none'> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'facial';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'fingerprint';
    }
    return 'none';
  } catch {
    return 'none';
  }
};

/**
 * Get full device info
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const deviceId = await getDeviceId();
  const deviceName = getDeviceName();
  const biometricType = await getBiometricType();
  
  return {
    deviceId,
    deviceName,
    deviceType: Platform.OS as 'android' | 'ios',
    biometricType,
  };
};

// ============== API CALLS ==============

/**
 * Register device with backend
 */
export const registerDevice = async (
  accountId: string,
  businessName: string,
  phone: string,
  email?: string,
  pushToken?: string
): Promise<RegisteredDevice> => {
  const deviceInfo = await getDeviceInfo();
  
  const response = await axios.post(
    `${API_URL}/devices/register`,
    {
      account_id: accountId,
      device_id: deviceInfo.deviceId,
      device_name: deviceInfo.deviceName,
      device_type: deviceInfo.deviceType,
      biometric_type: deviceInfo.biometricType,
      business_name: businessName,
      phone: phone,
      email: email,
      push_token: pushToken,
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  // Save credentials locally
  await SecureStore.setItemAsync(KEYS.ACCOUNT_ID, accountId);
  await SecureStore.setItemAsync(KEYS.BUSINESS_NAME, businessName);
  
  return response.data;
};

/**
 * Authenticate device with backend
 */
export const authenticateDevice = async (
  accountId: string,
  biometricVerified: boolean = false
): Promise<DeviceAuthResult> => {
  const deviceId = await getDeviceId();
  
  const response = await axios.post(
    `${API_URL}/devices/authenticate`,
    {
      device_id: deviceId,
      account_id: accountId,
      biometric_verified: biometricVerified,
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = response.data;
  
  // Save access token if authorized
  if (data.authorized && data.access_token) {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, data.access_token);
  }
  
  return {
    authorized: data.authorized,
    accountId: data.account_id,
    businessName: data.business_name,
    deviceStatus: data.device_status,
    accessToken: data.access_token,
    message: data.message,
  };
};

/**
 * Search for account by business name and phone
 */
export const searchByBusiness = async (
  businessName: string,
  phone: string
): Promise<BusinessSearchResult> => {
  const response = await axios.post(
    `${API_URL}/devices/search`,
    {
      business_name: businessName,
      phone: phone,
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = response.data;
  
  return {
    found: data.found,
    accountId: data.account_id,
    businessName: data.business_name,
    requiresVerification: data.requires_verification,
    verificationMethod: data.verification_method,
  };
};

/**
 * Get list of devices for account
 */
export const listDevices = async (accountId: string): Promise<{
  devices: RegisteredDevice[];
  totalDevices: number;
  maxDevices: number;
}> => {
  const response = await axios.get(
    `${API_URL}/devices/list/${accountId}`,
    {
      headers: {
        'x-api-key': API_KEY,
      },
    }
  );
  
  return {
    devices: response.data.devices,
    totalDevices: response.data.total_devices,
    maxDevices: response.data.max_devices,
  };
};

/**
 * Revoke a device
 */
export const revokeDevice = async (
  accountId: string,
  deviceId: string,
  reason?: string
): Promise<void> => {
  await axios.put(
    `${API_URL}/devices/${accountId}/${deviceId}`,
    {
      status: 'revoked',
      reason: reason,
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
};

/**
 * Delete a device permanently
 */
export const deleteDevice = async (
  accountId: string,
  deviceId: string
): Promise<void> => {
  await axios.delete(
    `${API_URL}/devices/${accountId}/${deviceId}`,
    {
      headers: {
        'x-api-key': API_KEY,
      },
    }
  );
};

/**
 * Set device as primary
 */
export const setPrimaryDevice = async (
  accountId: string,
  deviceId: string
): Promise<void> => {
  await axios.post(
    `${API_URL}/devices/${accountId}/set-primary/${deviceId}`,
    {},
    {
      headers: {
        'x-api-key': API_KEY,
      },
    }
  );
};

/**
 * Get stored credentials
 */
export const getStoredCredentials = async (): Promise<{
  accountId: string | null;
  businessName: string | null;
  accessToken: string | null;
}> => {
  try {
    const accountId = await SecureStore.getItemAsync(KEYS.ACCOUNT_ID);
    const businessName = await SecureStore.getItemAsync(KEYS.BUSINESS_NAME);
    const accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    
    return { accountId, businessName, accessToken };
  } catch {
    return { accountId: null, businessName: null, accessToken: null };
  }
};

/**
 * Clear all stored credentials (logout)
 */
export const clearCredentials = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(KEYS.ACCOUNT_ID);
    await SecureStore.deleteItemAsync(KEYS.BUSINESS_NAME);
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    // Keep DEVICE_ID - it should persist
  } catch (error) {
    console.error('Error clearing credentials:', error);
  }
};

/**
 * Full biometric login flow with backend verification
 */
export const biometricLoginWithBackend = async (): Promise<{
  success: boolean;
  accountId?: string;
  businessName?: string;
  message: string;
}> => {
  try {
    // Get stored account ID
    const { accountId } = await getStoredCredentials();
    
    if (!accountId) {
      return {
        success: false,
        message: 'No hay credenciales almacenadas. Inicia sesión primero.',
      };
    }
    
    // Perform biometric authentication locally
    const biometricResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirma tu identidad',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });
    
    if (!biometricResult.success) {
      return {
        success: false,
        message: 'Autenticación biométrica fallida.',
      };
    }
    
    // Verify with backend
    const authResult = await authenticateDevice(accountId, true);
    
    if (!authResult.authorized) {
      return {
        success: false,
        message: authResult.message,
      };
    }
    
    return {
      success: true,
      accountId: authResult.accountId,
      businessName: authResult.businessName,
      message: 'Autenticación exitosa',
    };
  } catch (error: any) {
    console.error('Biometric login error:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Error de autenticación',
    };
  }
};

export default {
  getDeviceId,
  getDeviceName,
  getBiometricType,
  getDeviceInfo,
  registerDevice,
  authenticateDevice,
  searchByBusiness,
  listDevices,
  revokeDevice,
  deleteDevice,
  setPrimaryDevice,
  getStoredCredentials,
  clearCredentials,
  biometricLoginWithBackend,
};
