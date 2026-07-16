import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Product } from '../catalog/types';
import * as quoteService from './services/quoteService';
import type { PriceTier, Quote, QuoteClient, QuoteItem, QuoteStatus } from './types';

function generateId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AddItemOptions {
  quantity: number;
  priceTier: PriceTier;
  discountPct?: number;
}

interface QuoteBuilderContextValue {
  id: string;
  client: QuoteClient | null;
  items: QuoteItem[];
  status: QuoteStatus;
  setClient: (client: QuoteClient) => void;
  /** Agrega el producto o, si ya estaba en la cotización, reemplaza esa línea. */
  addItem: (product: Product, options: AddItemOptions) => void;
  updateItem: (productId: string, patch: Partial<AddItemOptions>) => void;
  removeItem: (productId: string) => void;
  /** Carga una cotización guardada (para reabrir un borrador). */
  loadDraft: (draftId: string) => Promise<void>;
  /** Persiste el estado actual como borrador y lo devuelve. */
  saveDraft: () => Promise<Quote>;
  /** Persiste el estado actual como "generada" (ya se creó/compartió el PDF). */
  markGenerated: () => Promise<Quote>;
}

const QuoteBuilderContext = createContext<QuoteBuilderContextValue | null>(null);

export function QuoteBuilderProvider({ children }: PropsWithChildren) {
  const [id, setId] = useState(generateId);
  const [client, setClientState] = useState<QuoteClient | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [status, setStatus] = useState<QuoteStatus>('draft');
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());

  const resetBuilder = useCallback(() => {
    setId(generateId());
    setClientState(null);
    setItems([]);
    setStatus('draft');
    setCreatedAt(new Date().toISOString());
  }, []);

  const setClient = useCallback((next: QuoteClient) => setClientState(next), []);

  const addItem = useCallback((product: Product, options: AddItemOptions) => {
    setItems((current) => [
      ...current.filter((item) => item.product.id !== product.id),
      { product, quantity: options.quantity, priceTier: options.priceTier, discountPct: options.discountPct },
    ]);
  }, []);

  const updateItem = useCallback((productId: string, patch: Partial<AddItemOptions>) => {
    setItems((current) =>
      current.map((item) => (item.product.id === productId ? { ...item, ...patch } : item))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  }, []);

  const loadDraft = useCallback(
    async (draftId: string) => {
      const stored = await quoteService.getQuote(draftId);
      if (!stored) {
        resetBuilder();
        return;
      }
      setId(stored.id);
      setClientState(stored.client);
      setItems(stored.items);
      setStatus(stored.status);
      setCreatedAt(stored.createdAt);
    },
    [resetBuilder]
  );

  const persist = useCallback(
    async (nextStatus: QuoteStatus): Promise<Quote> => {
      if (!client) {
        throw new Error('Selecciona o registra un cliente antes de guardar.');
      }

      const quote: Quote = {
        id,
        client,
        items,
        status: nextStatus,
        createdAt,
        updatedAt: new Date().toISOString(),
      };

      await quoteService.saveQuote(quote);
      setStatus(nextStatus);
      return quote;
    },
    [id, client, items, createdAt]
  );

  const saveDraft = useCallback(() => persist('draft'), [persist]);
  const markGenerated = useCallback(() => persist('generated'), [persist]);

  const value = useMemo<QuoteBuilderContextValue>(
    () => ({
      id,
      client,
      items,
      status,
      setClient,
      addItem,
      updateItem,
      removeItem,
      loadDraft,
      saveDraft,
      markGenerated,
    }),
    [id, client, items, status, setClient, addItem, updateItem, removeItem, loadDraft, saveDraft, markGenerated]
  );

  return <QuoteBuilderContext.Provider value={value}>{children}</QuoteBuilderContext.Provider>;
}

export function useQuoteBuilder() {
  const ctx = useContext(QuoteBuilderContext);
  if (!ctx) {
    throw new Error('useQuoteBuilder debe usarse dentro de <QuoteBuilderProvider>.');
  }
  return ctx;
}
