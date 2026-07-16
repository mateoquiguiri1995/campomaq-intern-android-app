import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import type { Client } from '@/features/clients/types';
import { getClients } from '@/features/clients/services/clientService';
import type { Product } from '@/features/catalog/types';
import { getAllProducts, getProducts } from '@/features/catalog/services/productService';

const CLIENTS_PRELOAD_PAGE_SIZE = 10;

interface AppBootstrapContextValue {
  products: Product[];
  productsHasMore: boolean;
  clients: Client[];
  clientsTotal: number;
  /** Catálogo completo, para filtrar por búsqueda/categoría/marca. Se carga
   *  en segundo plano después del arranque rápido; null hasta que esté listo. */
  allProducts: Product[] | null;
  isLoadingAllProducts: boolean;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

const AppBootstrapContext = createContext<AppBootstrapContextValue | null>(null);

export function AppBootstrapProvider({ children }: PropsWithChildren) {
  const { hasSession } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsTotal, setClientsTotal] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  // Arranque rápido: solo la primera página de productos y clientes. Se
  // dispara apenas Supabase confirma la sesión (hasSession), sin esperar a
  // que /auth/me termine de armar el perfil, para que ambas cosas corran en
  // paralelo en vez de una detrás de la otra.
  useEffect(() => {
    let isMounted = true;

    if (!hasSession) {
      setProducts([]);
      setProductsHasMore(false);
      setClients([]);
      setClientsTotal(0);
      setAllProducts(null);
      setError(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setError(null);
    setAllProducts(null);

    Promise.all([
      getProducts({ page: 1 }),
      getClients({ page: 1, pageSize: CLIENTS_PRELOAD_PAGE_SIZE }),
    ])
      .then(([loadedProducts, loadedClients]) => {
        if (!isMounted) return;
        setProducts(loadedProducts.products);
        setProductsHasMore(loadedProducts.hasMore);
        setClients(loadedClients.clients);
        setClientsTotal(loadedClients.total ?? loadedClients.clients.length);
      })
      .catch((err) => {
        if (!isMounted) return;
        setProducts([]);
        setProductsHasMore(false);
        setClients([]);
        setClientsTotal(0);
        setError(err instanceof Error ? err.message : 'No fue posible preparar los datos de la app.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hasSession, reloadIndex]);

  // Segundo paso, en segundo plano: trae el resto del catálogo para poder
  // filtrar por búsqueda/categoría/marca sin bloquear la pantalla de carga.
  useEffect(() => {
    if (!hasSession || isLoading || error) return;

    let isMounted = true;
    setIsLoadingAllProducts(true);

    getAllProducts()
      .then((all) => {
        if (isMounted) setAllProducts(all);
      })
      .catch(() => {
        // Silencioso: el catálogo paginado ya funciona para navegar; si esto
        // falla, los filtros simplemente no tendrán todavía el universo
        // completo hasta el próximo reintento.
      })
      .finally(() => {
        if (isMounted) setIsLoadingAllProducts(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession, isLoading, error, reloadIndex]);

  const reload = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  const value = useMemo<AppBootstrapContextValue>(
    () => ({
      products,
      productsHasMore,
      clients,
      clientsTotal,
      allProducts,
      isLoadingAllProducts,
      isLoading,
      error,
      reload,
    }),
    [products, productsHasMore, clients, clientsTotal, allProducts, isLoadingAllProducts, isLoading, error, reload]
  );

  return <AppBootstrapContext.Provider value={value}>{children}</AppBootstrapContext.Provider>;
}

export function useAppBootstrap() {
  const ctx = useContext(AppBootstrapContext);
  if (!ctx) {
    throw new Error('useAppBootstrap debe usarse dentro de <AppBootstrapProvider>.');
  }
  return ctx;
}
