import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Quote } from '../types';

/**
 * Servicio de cotizaciones / proformas.
 *
 * IMPORTANTE: las cotizaciones NUNCA se guardan en la base de datos. Todo
 * vive en el teléfono del vendedor, en AsyncStorage, como una sola lista.
 */

const STORAGE_KEY = 'campomaq-quotes';

async function readAll(): Promise<Quote[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Quote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

async function writeAll(quotes: Quote[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

/** Cotizaciones guardadas, más recientes primero. */
export async function listQuotes(): Promise<Quote[]> {
  const quotes = await readAll();
  return quotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getQuote(id: string): Promise<Quote | null> {
  const quotes = await readAll();
  return quotes.find((quote) => quote.id === id) ?? null;
}

/** Crea o actualiza (por id) una cotización guardada. */
export async function saveQuote(quote: Quote): Promise<void> {
  const quotes = await readAll();
  const index = quotes.findIndex((existing) => existing.id === quote.id);

  if (index >= 0) {
    quotes[index] = quote;
  } else {
    quotes.push(quote);
  }

  await writeAll(quotes);
}

export async function deleteQuote(id: string): Promise<void> {
  const quotes = await readAll();
  await writeAll(quotes.filter((quote) => quote.id !== id));
}
