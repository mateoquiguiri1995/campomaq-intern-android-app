import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SellerDashboard } from '../types';

const SELLER_CACHE_KEY_PREFIX = 'campomaq:cache:seller:v1';

function sellerCacheKey(userId: string): string {
  return `${SELLER_CACHE_KEY_PREFIX}:${encodeURIComponent(userId)}`;
}

/**
 * Carga el dashboard comercial del vendedor guardado en el disco del dispositivo.
 */
export async function getCachedSellerDashboard(userId: string): Promise<SellerDashboard | null> {
  try {
    const raw = await AsyncStorage.getItem(sellerCacheKey(userId));
    return raw ? (JSON.parse(raw) as SellerDashboard) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el dashboard comercial del vendedor en el disco del dispositivo.
 */
export async function saveCachedSellerDashboard(userId: string, dashboard: SellerDashboard): Promise<void> {
  try {
    await AsyncStorage.setItem(sellerCacheKey(userId), JSON.stringify(dashboard));
  } catch (error) {
    console.warn('[Cache] Error guardando dashboard comercial:', error);
  }
}
