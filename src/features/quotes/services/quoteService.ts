import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Quote, QuoteStatus } from '../types';

const STORAGE_KEY_PREFIX = 'campomaq:quotes:v1';
const LEGACY_MOCK_QUOTE_IDS = new Set([
  'q-florida-0231',
  'q-cotopaxi-0229',
  'q-andes-0225',
  'q-miraflores-0219',
  'q-rafael-0214',
]);

/**
 * Las cotizaciones son documentos reales creados por el vendedor. No se
 * precargan datos de demostración: una instalación nueva empieza vacía.
 */
function storageKeyForUser(userId: string): string {
  return `${STORAGE_KEY_PREFIX}:${encodeURIComponent(userId)}`;
}

async function readAll(userId: string): Promise<Quote[]> {
  const storageKey = storageKeyForUser(userId);
  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Quote[];
    if (!Array.isArray(parsed)) return [];

    // Compatibilidad con los nombres usados por versiones anteriores.
    const quotes = parsed
      .filter((quote) => !LEGACY_MOCK_QUOTE_IDS.has(quote.id))
      .map((quote) => ({
        ...quote,
        status:
          quote.status === ('draft' as QuoteStatus)
            ? 'Pendiente'
            : quote.status === ('generated' as QuoteStatus)
              ? 'Enviada'
              : quote.status,
      }));

    if (quotes.length !== parsed.length) await writeAll(userId, quotes);
    return quotes;
  } catch {
    // No se reemplaza un almacenamiento ilegible por información ficticia.
    await AsyncStorage.removeItem(storageKey);
    return [];
  }
}

async function writeAll(userId: string, quotes: Quote[]): Promise<void> {
  await AsyncStorage.setItem(storageKeyForUser(userId), JSON.stringify(quotes));
}

/** Cotizaciones guardadas, más recientes primero. */
export async function listQuotes(userId: string): Promise<Quote[]> {
  const quotes = await readAll(userId);
  return quotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getQuote(userId: string, id: string): Promise<Quote | null> {
  const quotes = await readAll(userId);
  return quotes.find((quote) => quote.id === id) ?? null;
}

/** Crea o actualiza una cotización pendiente. Las enviadas son inmutables. */
export async function saveQuote(userId: string, quote: Quote): Promise<void> {
  const quotes = await readAll(userId);
  const index = quotes.findIndex((existing) => existing.id === quote.id);

  if (index >= 0 && quotes[index].status !== 'Pendiente') {
    throw new Error('Una cotización enviada no puede modificarse. Duplícala para crear una nueva.');
  }

  if (index >= 0) {
    quotes[index] = quote;
  } else {
    quotes.push(quote);
  }

  await writeAll(userId, quotes);
}

/** Solo los borradores pendientes pueden eliminarse. */
export async function deleteQuote(userId: string, id: string): Promise<void> {
  const quotes = await readAll(userId);
  const quote = quotes.find((item) => item.id === id);
  if (quote && quote.status !== 'Pendiente') {
    throw new Error('Una cotización aceptada no puede eliminarse.');
  }
  await writeAll(userId, quotes.filter((quote) => quote.id !== id));
}

/**
 * Transiciones permitidas:
 * Pendiente → Enviada al compartir; Enviada → Aceptada/Rechazada desde
 * Reportes. Un borrador no puede marcarse como aceptado o rechazado.
 */
export async function updateQuoteStatus(userId: string, id: string, nextStatus: QuoteStatus): Promise<Quote> {
  if (!['Enviada', 'Aceptada', 'Rechazada'].includes(nextStatus)) {
    throw new Error('Estado de cotización no válido.');
  }

  const quotes = await readAll(userId);
  const index = quotes.findIndex((quote) => quote.id === id);
  if (index === -1) throw new Error('No se encontró la cotización.');
  const currentStatus = quotes[index].status;
  const validTransition =
    (currentStatus === 'Pendiente' && nextStatus === 'Enviada') ||
    (currentStatus === 'Enviada' && (nextStatus === 'Aceptada' || nextStatus === 'Rechazada'));

  if (!validTransition) {
    throw new Error('La cotización solo puede cambiar de Pendiente a Enviada y luego a Aceptada o Rechazada.');
  }

  const updated: Quote = {
    ...quotes[index],
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  quotes[index] = updated;
  await writeAll(userId, quotes);
  return updated;
}

/**
 * Duplica una cotización existente creando un nuevo borrador pendiente editable.
 */
export async function duplicateQuote(userId: string, id: string): Promise<Quote> {
  const original = await getQuote(userId, id);
  if (!original) throw new Error('No se encontró la cotización a duplicar.');

  const now = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newId = `q-${Date.now().toString(36)}-${randomSuffix}`;

  const duplicated: Quote = {
    ...original,
    id: newId,
    status: 'Pendiente',
    createdAt: now,
    updatedAt: now,
  };

  await saveQuote(userId, duplicated);
  return duplicated;
}
