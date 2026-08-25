import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Client } from '../types';

const CLIENTS_CACHE_KEY = 'campomaq:cache:clients:v1';
const ALL_CLIENTS_CACHE_KEY = 'campomaq:cache:all_clients:v1';

export interface CachedClientsData {
  clients: Client[];
  total: number;
}

/**
 * Carga los clientes guardados en el disco del dispositivo.
 */
export async function getCachedClients(): Promise<CachedClientsData | null> {
  try {
    const raw = await AsyncStorage.getItem(CLIENTS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedClientsData) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda los clientes en el disco del dispositivo.
 */
export async function saveCachedClients(clients: Client[], total?: number): Promise<void> {
  try {
    const payload: CachedClientsData = {
      clients,
      total: total ?? clients.length,
    };
    await AsyncStorage.setItem(CLIENTS_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[Cache] Error guardando clientes:', error);
  }
}

/**
 * Carga la cartera completa de clientes guardada en el disco del dispositivo.
 */
export async function getCachedAllClients(): Promise<Client[] | null> {
  try {
    const raw = await AsyncStorage.getItem(ALL_CLIENTS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Client[]) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda la cartera completa de clientes en el disco del dispositivo.
 */
export async function saveCachedAllClients(clients: Client[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ALL_CLIENTS_CACHE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.warn('[Cache] Error guardando cartera completa de clientes:', error);
  }
}

