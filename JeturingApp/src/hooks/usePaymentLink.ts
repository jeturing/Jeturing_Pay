/**
 * Payment Link Hook
 * React hook for generating and sharing payment links
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { createPaymentLink, PaymentLink } from '@services/stripe';

export interface PaymentLinkOptions {
  amount: number;
  currency?: string;
  description?: string;
}

/**
 * Custom hook for creating and sharing payment links
 * Links can be shared via SMS, email, or copied to clipboard
 */
export const usePaymentLink = (accountId: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastLink, setLastLink] = useState<PaymentLink | null>(null);

  /**
   * Generate a payment link
   */
  const generateLink = useCallback(async (options: PaymentLinkOptions): Promise<PaymentLink | null> => {
    setIsGenerating(true);
    
    try {
      const { amount, currency = 'USD', description } = options;

      const link = await createPaymentLink(amount, accountId, currency, description);
      
      setLastLink(link);
      return link;
    } catch (error: any) {
      console.error('Error generating payment link:', error);
      Alert.alert('Error', 'No se pudo generar el link de pago');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [accountId]);

  /**
   * Generate and share a payment link
   */
  const generateAndShare = useCallback(async (options: PaymentLinkOptions) => {
    const link = await generateLink(options);
    
    if (!link) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(link.url, {
          dialogTitle: `Pago de $${(options.amount / 100).toFixed(2)}`,
          UTI: 'public.url'
        });
      } else {
        // Fallback: copy to clipboard
        await copyToClipboard(link.url);
      }
    } catch (error: any) {
      console.error('Error sharing link:', error);
      Alert.alert('Error', 'No se pudo compartir el link');
    }
  }, [generateLink]);

  /**
   * Copy payment link to clipboard
   */
  const copyToClipboard = useCallback(async (url: string) => {
    try {
      await Clipboard.setStringAsync(url);
      Alert.alert('Copiado', 'Link de pago copiado al portapapeles');
    } catch (error: any) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'No se pudo copiar el link');
    }
  }, []);

  /**
   * Copy last generated link to clipboard
   */
  const copyLastLink = useCallback(async () => {
    if (!lastLink) {
      Alert.alert('Error', 'No hay link para copiar');
      return;
    }

    await copyToClipboard(lastLink.url);
  }, [lastLink, copyToClipboard]);

  /**
   * Share via specific method
   */
  const shareVia = useCallback(async (method: 'sms' | 'email' | 'whatsapp', link: string) => {
    const message = `Paga aquí: ${link}`;
    
    try {
      switch (method) {
        case 'sms':
          // Open SMS with link
          await Sharing.shareAsync(link, {
            dialogTitle: 'Enviar por SMS'
          });
          break;
        case 'email':
          // Open email with link
          await Sharing.shareAsync(link, {
            dialogTitle: 'Enviar por Email'
          });
          break;
        case 'whatsapp':
          // Open WhatsApp with link
          await Sharing.shareAsync(link, {
            dialogTitle: 'Enviar por WhatsApp'
          });
          break;
      }
    } catch (error: any) {
      console.error(`Error sharing via ${method}:`, error);
      Alert.alert('Error', `No se pudo compartir por ${method}`);
    }
  }, []);

  return {
    generateLink,
    generateAndShare,
    copyToClipboard,
    copyLastLink,
    shareVia,
    isGenerating,
    lastLink
  };
};

export default usePaymentLink;
