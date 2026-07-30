import AsyncStorage from '@react-native-async-storage/async-storage';
import * as secureStore from '@/utils/secureStore';
import { supabase } from '@/lib/supabase';
import type { Quote, QuoteStatus } from '../types';

async function getActiveUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? 'default-user';
}

function getIdsKey(userId: string): string {
  return `campomaq-quotes-ids-${userId}`;
}

function getQuoteKey(userId: string, quoteId: string): string {
  return `campomaq-quote-${userId}-${quoteId}`;
}

async function getQuoteIds(userId: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(getIdsKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQuoteIds(userId: string, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(getIdsKey(userId), JSON.stringify(ids));
}

/** Cotizaciones guardadas, más recientes primero. */
export async function listQuotes(): Promise<Quote[]> {
  const userId = await getActiveUserId();
  const ids = await getQuoteIds(userId);
  const quotes: Quote[] = [];

  for (const id of ids) {
    const rawQuote = await secureStore.getItemAsync(getQuoteKey(userId, id));
    if (rawQuote) {
      try {
        const q = JSON.parse(rawQuote) as Quote;
        let mappedStatus = q.status;
        if ((q.status as any) === 'draft') {
          mappedStatus = 'Pendiente';
        } else if ((q.status as any) === 'generated') {
          mappedStatus = 'Enviada';
        }
        quotes.push({ ...q, status: mappedStatus });
      } catch {
        // Ignorar si está corrupto
      }
    }
  }

  return quotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getQuote(id: string): Promise<Quote | null> {
  const userId = await getActiveUserId();
  const rawQuote = await secureStore.getItemAsync(getQuoteKey(userId, id));
  if (!rawQuote) return null;
  try {
    return JSON.parse(rawQuote) as Quote;
  } catch {
    return null;
  }
}

/** Crea o actualiza (por id) una cotización guardada. */
export async function saveQuote(quote: Quote): Promise<void> {
  const userId = await getActiveUserId();
  
  await secureStore.setItemAsync(getQuoteKey(userId, quote.id), JSON.stringify(quote));

  const ids = await getQuoteIds(userId);
  if (!ids.includes(quote.id)) {
    ids.push(quote.id);
    await saveQuoteIds(userId, ids);
  }
}

export async function deleteQuote(id: string): Promise<void> {
  const userId = await getActiveUserId();

  await secureStore.deleteItemAsync(getQuoteKey(userId, id));

  const ids = await getQuoteIds(userId);
  const nextIds = ids.filter((val) => val !== id);
  await saveQuoteIds(userId, nextIds);
}

/** Actualiza directamente el estado de una cotización y la guarda. */
export async function updateQuoteStatus(id: string, nextStatus: QuoteStatus): Promise<Quote> {
  const quote = await getQuote(id);
  if (!quote) {
    throw new Error('No se encontró la cotización.');
  }

  const updated: Quote = {
    ...quote,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  await saveQuote(updated);
  return updated;
}

/** Limpia por completo todas las cotizaciones del usuario activo de SecureStore y AsyncStorage. */
export async function clearUserQuotes(userId: string): Promise<void> {
  const ids = await getQuoteIds(userId);
  for (const id of ids) {
    await secureStore.deleteItemAsync(getQuoteKey(userId, id));
  }
  await AsyncStorage.removeItem(getIdsKey(userId));
}
