/* eslint-disable react-hooks/set-state-in-effect */
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
  /** Error de la carga inicial de productos. No bloquea el resto de la app. */
  productsError: string | null;
  /** Error de la carga inicial de clientes. No bloquea el resto de la app. */
  clientsError: string | null;
  /** Catálogo completo, para filtrar por búsqueda/categoría/marca. Se carga
   *  en segundo plano después del arranque rápido; null hasta que esté listo. */
  allProducts: Product[] | null;
  isLoadingAllProducts: boolean;
  isLoading: boolean;
  progress: number;
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
  const [progress, setProgress] = useState(0);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [clientsError, setClientsError] = useState<string | null>(null);
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
      setProductsError(null);
      setClientsError(null);
      setIsLoading(false);
      setProgress(0);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setProductsError(null);
    setClientsError(null);
    setAllProducts(null);
    setProgress(10); // Empezamos en 10%

    let productsDone = false;
    let clientsDone = false;
    const checkComplete = () => {
      if (!isMounted) return;
      if (productsDone && clientsDone) {
        setProgress(100);
        setIsLoading(false);
      } else if (productsDone || clientsDone) {
        setProgress(60); // Uno completado
      }
    };

    getProducts({ page: 1 })
      .then((loadedProducts) => {
        if (!isMounted) return;
        setProducts(loadedProducts.products);
        setProductsHasMore(loadedProducts.hasMore);
        productsDone = true;
        checkComplete();
      })
      .catch((err) => {
        if (!isMounted) return;
        setProducts([]);
        setProductsHasMore(false);
        setProductsError(err instanceof Error ? err.message : 'No fue posible cargar los productos.');
        productsDone = true;
        checkComplete();
      });

    getClients({ page: 1, pageSize: CLIENTS_PRELOAD_PAGE_SIZE })
      .then((loadedClients) => {
        if (!isMounted) return;
        setClients(loadedClients.clients);
        setClientsTotal(loadedClients.total ?? loadedClients.clients.length);
        clientsDone = true;
        checkComplete();
      })
      .catch((err) => {
        if (!isMounted) return;
        setClients([]);
        setClientsTotal(0);
        setClientsError(err instanceof Error ? err.message : 'No fue posible cargar los clientes.');
        clientsDone = true;
        checkComplete();
      });

    return () => {
      isMounted = false;
    };
  }, [hasSession, reloadIndex]);

  // Segundo paso, en segundo plano: trae el resto del catálogo para poder
  // filtrar por búsqueda/categoría/marca sin bloquear la pantalla de carga.
  useEffect(() => {
    if (!hasSession || isLoading || productsError) return;

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
  }, [hasSession, isLoading, productsError, reloadIndex]);

  const reload = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  const value = useMemo<AppBootstrapContextValue>(
    () => ({
      products,
      productsHasMore,
      clients,
      clientsTotal,
      productsError,
      clientsError,
      allProducts,
      isLoadingAllProducts,
      isLoading,
      progress,
      reload,
    }),
    [
      products,
      productsHasMore,
      clients,
      clientsTotal,
      productsError,
      clientsError,
      allProducts,
      isLoadingAllProducts,
      isLoading,
      progress,
      reload,
    ]
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
