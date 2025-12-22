/**
 * Stripe Account Context
 * Manages connected account state across the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StripeAccount {
  id: string;
  email: string;
  business_name: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

interface StripeAccountContextType {
  account: StripeAccount | null;
  setAccount: (account: StripeAccount | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const StripeAccountContext = createContext<StripeAccountContextType | undefined>(undefined);

const STORAGE_KEY = '@jeturing_pay_account';

export const StripeAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccountState] = useState<StripeAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load account from storage on mount
  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAccountState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAccount = async (newAccount: StripeAccount | null) => {
    try {
      if (newAccount) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAccount));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setAccountState(newAccount);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const logout = async () => {
    await setAccount(null);
  };

  return (
    <StripeAccountContext.Provider value={{ account, setAccount, isLoading, logout }}>
      {children}
    </StripeAccountContext.Provider>
  );
};

export const useStripeAccount = () => {
  const context = useContext(StripeAccountContext);
  if (!context) {
    throw new Error('useStripeAccount must be used within StripeAccountProvider');
  }
  return context;
};
