import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuoteSellerInfo } from '../types';

export const DEFAULT_SELLER_STORAGE_KEY = '@campomaq:default_seller_id:v1';

export const PRESET_SELLERS: QuoteSellerInfo[] = [
  {
    id: 'jhonatan_cueva',
    name: 'Jhonatan de la Cueva',
    phone: '0991602669',
    email: 'jonathandlch21@gmail.com',
    location: 'Cayambe',
  },
  {
    id: 'manuel_quiguiri',
    name: 'Manuel Quiguiri',
    phone: '0999669235',
    email: '----',
    location: 'Cayambe',
  },
];

export function getSellerById(id?: string | null): QuoteSellerInfo | undefined {
  if (!id) return undefined;
  return PRESET_SELLERS.find((s) => s.id === id);
}

export async function getSavedDefaultSellerId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEFAULT_SELLER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function saveDefaultSellerId(sellerId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DEFAULT_SELLER_STORAGE_KEY, sellerId);
  } catch (error) {
    console.warn('[SellerStorage] No se pudo guardar el vendedor predeterminado:', error);
  }
}
