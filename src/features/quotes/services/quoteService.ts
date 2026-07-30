import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Quote, QuoteStatus } from '../types';

const STORAGE_KEY = 'campomaq-quotes';

const MOCK_QUOTES: Quote[] = [
  {
    id: 'q-florida-0231',
    client: {
      kind: 'registered',
      client: {
        id: '1791234567001',
        name: 'Hacienda La Florida',
        ruc: '1791234567001',
        email: 'contacto@laflorida.com',
        phone: '0991234567',
        location: 'Cayambe, Pichincha',
        score: 'A+',
        totalPurchases: 4046.5,
        lastPurchaseDate: '2026-04-12',
        hasPendingCredit: true,
      }
    },
    items: [
      {
        product: {
          id: 'p-honda-fg650',
          code: 'HND-FG650',
          name: 'Motocultor Honda FG-650',
          category: 'Cultivadores',
          brand: 'Honda',
          mainPrice: 1722.1739,
          priceA: 1722.1739,
          priceB: 1722.1739,
          priceC: 1722.1739,
          stockQty: 8,
        },
        quantity: 1,
        priceTier: 'A'
      }
    ],
    status: 'Aceptada',
    createdAt: '2026-07-18T14:30:00.000Z',
    updatedAt: '2026-07-18T14:30:00.000Z'
  },
  {
    id: 'q-cotopaxi-0229',
    client: {
      kind: 'registered',
      client: {
        id: '1891234567002',
        name: 'Agroindustrial Cotopaxi',
        ruc: '1891234567002',
        email: 'contacto@cotopaxi.com',
        phone: '0991234568',
        location: 'Latacunga, Cotopaxi',
        score: 'B',
        totalPurchases: 980,
        lastPurchaseDate: '2026-02-18',
        hasPendingCredit: false,
      }
    },
    items: [
      {
        product: {
          id: 'p-motosierra-55',
          code: 'HUSQ-455',
          name: 'Motosierra Husqvarna 455',
          category: 'Motosierras',
          brand: 'Husqvarna',
          mainPrice: 852.1739,
          priceA: 852.1739,
          priceB: 852.1739,
          priceC: 852.1739,
          stockQty: 5,
        },
        quantity: 1,
        priceTier: 'A'
      }
    ],
    status: 'Enviada',
    createdAt: '2026-07-15T10:15:00.000Z',
    updatedAt: '2026-07-15T10:15:00.000Z'
  },
  {
    id: 'q-andes-0225',
    client: {
      kind: 'registered',
      client: {
        id: '1991234567003',
        name: 'Vivero Los Andes',
        ruc: '1991234567003',
        email: 'contacto@losandes.com',
        phone: '0991234569',
        location: 'Cayambe, Pichincha',
        score: 'A',
        totalPurchases: 1250,
        lastPurchaseDate: '2026-01-05',
        hasPendingCredit: false,
      }
    },
    items: [
      {
        product: {
          id: 'p-bomba-andes',
          code: 'BMB-ANDES',
          name: 'Bomba de agua Andes',
          category: 'Bombas',
          brand: 'Andes',
          mainPrice: 1086.9565,
          priceA: 1086.9565,
          priceB: 1086.9565,
          priceC: 1086.9565,
          stockQty: 3,
        },
        quantity: 1,
        priceTier: 'A'
      }
    ],
    status: 'Pendiente',
    createdAt: '2026-07-10T16:45:00.000Z',
    updatedAt: '2026-07-10T16:45:00.000Z'
  },
  {
    id: 'q-miraflores-0219',
    client: {
      kind: 'registered',
      client: {
        id: '1791234567005',
        name: 'Rancho Miraflores',
        ruc: '1791234567005',
        email: 'contacto@miraflores.com',
        phone: '0991234571',
        location: 'Machachi, Pichincha',
        score: 'B',
        totalPurchases: 540,
        lastPurchaseDate: '2025-11-30',
        hasPendingCredit: false,
      }
    },
    items: [
      {
        product: {
          id: 'p-generador-miraflores',
          code: 'GEN-MIRA',
          name: 'Generador Miraflores',
          category: 'Generadores',
          brand: 'Miraflores',
          mainPrice: 469.5652,
          priceA: 469.5652,
          priceB: 469.5652,
          priceC: 469.5652,
          stockQty: 2,
        },
        quantity: 1,
        priceTier: 'A'
      }
    ],
    status: 'Rechazada',
    createdAt: '2026-07-02T09:00:00.000Z',
    updatedAt: '2026-07-02T09:00:00.000Z'
  },
  {
    id: 'q-rafael-0214',
    client: {
      kind: 'registered',
      client: {
        id: '1791234567004',
        name: 'Floricola San Rafael',
        ruc: '1791234567004',
        email: 'contacto@sanrafael.com',
        phone: '0991234570',
        location: 'Tabacundo, Pichincha',
        score: 'A+',
        totalPurchases: 6320,
        lastPurchaseDate: '2025-12-22',
        hasPendingCredit: false,
      }
    },
    items: [
      {
        product: {
          id: 'p-cultivador-rafael',
          code: 'CLT-RAFA',
          name: 'Cultivador San Rafael',
          category: 'Cultivadores',
          brand: 'San Rafael',
          mainPrice: 1913.0435,
          priceA: 1913.0435,
          priceB: 1913.0435,
          priceC: 1913.0435,
          stockQty: 4,
        },
        quantity: 1,
        priceTier: 'A'
      }
    ],
    status: 'Aceptada',
    createdAt: '2026-06-27T11:20:00.000Z',
    updatedAt: '2026-06-27T11:20:00.000Z'
  }
];

async function readAll(): Promise<Quote[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await writeAll(MOCK_QUOTES);
    return MOCK_QUOTES;
  }

  try {
    const parsed = JSON.parse(raw) as Quote[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q) => {
        let mappedStatus = q.status;
        if ((q.status as any) === 'draft') {
          mappedStatus = 'Pendiente';
        } else if ((q.status as any) === 'generated') {
          mappedStatus = 'Enviada';
        }
        return { ...q, status: mappedStatus };
      });
    }
    await writeAll(MOCK_QUOTES);
    return MOCK_QUOTES;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return MOCK_QUOTES;
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

/** Actualiza directamente el estado de una cotización y la guarda. */
export async function updateQuoteStatus(id: string, nextStatus: QuoteStatus): Promise<Quote> {
  const quotes = await readAll();
  const index = quotes.findIndex((q) => q.id === id);
  if (index === -1) {
    throw new Error('No se encontró la cotización.');
  }
  const updated = {
    ...quotes[index],
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  quotes[index] = updated;
  await writeAll(quotes);
  return updated;
}
