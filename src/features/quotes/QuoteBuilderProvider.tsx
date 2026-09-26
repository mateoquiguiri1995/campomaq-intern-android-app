import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Product } from '../catalog/types';
import * as quoteService from './services/quoteService';
import type { PriceTier, Quote, QuoteClient, QuoteItem, QuoteSellerInfo, QuoteStatus } from './types';

function generateId(): string {
  // `expo-crypto` (randomUUID) no es dependencia de este proyecto todavía,
  // así que en vez de agregarla solo para esto, se refuerza la entropía del
  // generador actual (dos segmentos aleatorios en vez de uno) para volver
  // la colisión aún más improbable sin tocar package.json.
  const randomPart = `${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 8)}`;
  return `q-${Date.now()}-${randomPart}`;
}

interface AddItemOptions {
  quantity: number;
  priceTier: PriceTier;
  customPrice?: number;
  discountPct?: number;
  discountAmount?: number;
}

interface QuoteBuilderContextValue {
  id: string;
  client: QuoteClient | null;
  items: QuoteItem[];
  status: QuoteStatus;
  observations: string;
  termsAndConditions: string;
  seller: QuoteSellerInfo | null;
  /** Id de la cotización original cuando esta es una copia. */
  duplicatedFrom: string | null;
  createdAt: string;
  setClient: (client: QuoteClient) => void;
  setTermsAndObservations: (terms: string, obs: string) => void;
  setSeller: (seller: QuoteSellerInfo | null) => void;
  /** Agrega el producto o, si ya estaba en la cotización, reemplaza esa línea. */
  addItem: (product: Product, options: AddItemOptions) => void;
  updateItem: (productId: string, patch: Partial<AddItemOptions>) => void;
  removeItem: (productId: string) => void;
  /** Carga una cotización guardada para verla o, si está pendiente, editarla. */
  loadDraft: (draftId: string) => Promise<void>;
  /** Crea una nueva cotización pendiente a partir de la actual y devuelve su id. */
  duplicateQuote: () => Promise<string>;
  /**
   * Persiste el estado actual como borrador y lo devuelve. `items` permite
   * guardar una lista distinta a la del estado (ej. recién vaciada).
   */
  saveDraft: (extra?: {
    observations?: string;
    termsAndConditions?: string;
    seller?: QuoteSellerInfo;
    items?: QuoteItem[];
  }) => Promise<Quote>;
  /** Persiste el estado actual como "generada" (ya se creó/compartió el PDF). */
  markGenerated: (extra?: { observations?: string; termsAndConditions?: string; seller?: QuoteSellerInfo }) => Promise<Quote>;
  resetBuilder: () => void;
}

const QuoteBuilderContext = createContext<QuoteBuilderContextValue | null>(null);

interface QuoteBuilderProviderProps extends PropsWithChildren {
  userId: string | null;
}

export function QuoteBuilderProvider({ children, userId }: QuoteBuilderProviderProps) {
  const [id, setId] = useState(generateId);
  const [client, setClientState] = useState<QuoteClient | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [status, setStatus] = useState<QuoteStatus>('Pendiente');
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());
  const [observations, setObservations] = useState<string>('');
  const [termsAndConditions, setTermsAndConditions] = useState<string>('');
  const [seller, setSellerState] = useState<QuoteSellerInfo | null>(null);
  const [duplicatedFrom, setDuplicatedFrom] = useState<string | null>(null);

  const resetBuilder = useCallback(() => {
    setId(generateId());
    setClientState(null);
    setItems([]);
    setStatus('Pendiente');
    setCreatedAt(new Date().toISOString());
    setObservations('');
    setTermsAndConditions('');
    setSellerState(null);
    setDuplicatedFrom(null);
  }, []);

  const prevUserIdRef = useRef<string | null>(userId);

  useEffect(() => {
    if (userId) {
      if (prevUserIdRef.current && prevUserIdRef.current !== userId) {
        resetBuilder();
      }
      prevUserIdRef.current = userId;
    }
  }, [userId, resetBuilder]);

  const setClient = useCallback((next: QuoteClient) => {
    if (status === 'Pendiente') setClientState(next);
  }, [status]);

  const setTermsAndObservations = useCallback((terms: string, obs: string) => {
    setTermsAndConditions(terms);
    setObservations(obs);
  }, []);

  const setSeller = useCallback((next: QuoteSellerInfo | null) => {
    setSellerState(next);
  }, []);

  const addItem = useCallback((product: Product, options: AddItemOptions) => {
    if (status !== 'Pendiente') return;
    const nextItem: QuoteItem = {
      product,
      quantity: options.quantity,
      priceTier: options.priceTier,
      customPrice: options.customPrice,
      discountPct: options.discountPct,
      discountAmount: options.discountAmount,
    };
    setItems((current) => {
      const index = current.findIndex((item) => item.product.id === product.id);
      if (index === -1) return [...current, nextItem];
      // Si el producto ya estaba, se reemplaza en su misma posición.
      const updated = [...current];
      updated[index] = nextItem;
      return updated;
    });
  }, [status]);

  const updateItem = useCallback((productId: string, patch: Partial<AddItemOptions>) => {
    if (status !== 'Pendiente') return;
    setItems((current) =>
      current.map((item) => (item.product.id === productId ? { ...item, ...patch } : item))
    );
  }, [status]);

  const removeItem = useCallback((productId: string) => {
    if (status !== 'Pendiente') return;
    setItems((current) => current.filter((item) => item.product.id !== productId));
  }, [status]);

  const loadDraft = useCallback(
    async (draftId: string) => {
      if (!userId) {
        resetBuilder();
        return;
      }
      const stored = await quoteService.getQuote(userId, draftId);
      if (!stored) {
        resetBuilder();
        return;
      }
      setId(stored.id);
      setClientState(stored.client);
      setItems(stored.items);
      setStatus(stored.status);
      setCreatedAt(stored.createdAt);
      setObservations(stored.observations ?? '');
      setTermsAndConditions(stored.termsAndConditions ?? '');
      setSellerState(stored.seller ?? null);
      setDuplicatedFrom(stored.duplicatedFrom ?? null);
    },
    [resetBuilder, userId]
  );

  const persist = useCallback(
    async (
      nextStatus: QuoteStatus,
      extra?: { observations?: string; termsAndConditions?: string; seller?: QuoteSellerInfo; items?: QuoteItem[] }
    ): Promise<Quote> => {
      if (!userId) {
        throw new Error('Tu sesión ya no está disponible. Vuelve a iniciar sesión.');
      }
      if (!client) {
        throw new Error('Selecciona o registra un cliente antes de guardar.');
      }
      if (status !== 'Pendiente') {
        throw new Error('La cotización enviada no puede modificarse. Duplícala para crear una nueva.');
      }

      const obsVal = extra?.observations !== undefined ? extra.observations : observations;
      const termsVal = extra?.termsAndConditions !== undefined ? extra.termsAndConditions : termsAndConditions;
      const sellerVal = extra?.seller !== undefined ? extra.seller : seller;

      const quote: Quote = {
        id,
        client,
        items: extra?.items ?? items,
        status: nextStatus,
        observations: obsVal.trim() || undefined,
        termsAndConditions: termsVal.trim() || undefined,
        seller: sellerVal ?? undefined,
        duplicatedFrom: duplicatedFrom ?? undefined,
        createdAt,
        updatedAt: new Date().toISOString(),
      };

      await quoteService.saveQuote(userId, quote);
      setStatus(nextStatus);
      if (extra?.observations !== undefined) setObservations(extra.observations);
      if (extra?.termsAndConditions !== undefined) setTermsAndConditions(extra.termsAndConditions);
      if (extra?.seller !== undefined) setSellerState(extra.seller);
      return quote;
    },
    [id, client, items, createdAt, status, userId, observations, termsAndConditions, seller, duplicatedFrom]
  );

  const saveDraft = useCallback(
    (extra?: { observations?: string; termsAndConditions?: string; seller?: QuoteSellerInfo; items?: QuoteItem[] }) =>
      persist('Pendiente', extra),
    [persist]
  );
  const markGenerated = useCallback(
    (extra?: { observations?: string; termsAndConditions?: string; seller?: QuoteSellerInfo }) =>
      persist('Enviada', extra),
    [persist]
  );

  const duplicateQuote = useCallback(async () => {
    if (!userId) {
      throw new Error('Tu sesión ya no está disponible. Vuelve a iniciar sesión.');
    }

    const duplicated = await quoteService.duplicateQuote(userId, id);
    setId(duplicated.id);
    setClientState(duplicated.client);
    setItems(duplicated.items);
    setStatus(duplicated.status);
    setCreatedAt(duplicated.createdAt);
    setObservations(duplicated.observations ?? '');
    setTermsAndConditions(duplicated.termsAndConditions ?? '');
    setSellerState(duplicated.seller ?? null);
    setDuplicatedFrom(duplicated.duplicatedFrom ?? null);
    return duplicated.id;
  }, [id, userId]);

  const value = useMemo<QuoteBuilderContextValue>(
    () => ({
      id,
      client,
      items,
      status,
      observations,
      termsAndConditions,
      seller,
      duplicatedFrom,
      createdAt,
      setClient,
      setTermsAndObservations,
      setSeller,
      addItem,
      updateItem,
      removeItem,
      loadDraft,
      duplicateQuote,
      saveDraft,
      markGenerated,
      resetBuilder,
    }),
    [
      id,
      client,
      items,
      status,
      observations,
      termsAndConditions,
      seller,
      duplicatedFrom,
      createdAt,
      setClient,
      setTermsAndObservations,
      setSeller,
      addItem,
      updateItem,
      removeItem,
      loadDraft,
      duplicateQuote,
      saveDraft,
      markGenerated,
      resetBuilder,
    ]
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
