import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { useAuth } from '@/features/auth/AuthProvider';
import type { Client } from '@/features/clients/types';
import { getAllClients, getClients } from '@/features/clients/services/clientService';
import type { Product } from '@/features/catalog/types';
import { getAllProducts, getProducts } from '@/features/catalog/services/productService';
import { AppState, type AppStateStatus } from 'react-native';
import {
  getCachedAllProducts,
  getCachedProducts,
  prefetchProductImages,
  saveCachedAllProducts,
  saveCachedProducts,
} from '@/features/catalog/services/productCache';

import {
  getCachedAllClients,
  getCachedClients,
  saveCachedAllClients,
  saveCachedClients,
} from '@/features/clients/services/clientCache';

const CLIENTS_PRELOAD_PAGE_SIZE = 10;

interface AppBootstrapContextValue {
  products: Product[];
  productsHasMore: boolean;
  clients: Client[];
  clientsTotal: number;
  /** Error de la carga inicial de productos. No bloquea el resto de la app si hay caché en disco. */
  productsError: string | null;
  /** Error de la carga inicial de clientes. No bloquea el resto de la app si hay caché en disco. */
  clientsError: string | null;
  /** Catálogo completo, para filtrar por búsqueda/categoría/marca. Se carga
   *  en segundo plano después del arranque rápido; null hasta que esté listo. */
  allProducts: Product[] | null;
  isLoadingAllProducts: boolean;
  /** Cartera completa de clientes, para búsqueda instantánea y trabajo offline. */
  allClients: Client[] | null;
  isLoadingAllClients: boolean;
  isLoading: boolean;
  isOfflineMode: boolean;
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
  const [allClients, setAllClients] = useState<Client[] | null>(null);
  const [isLoadingAllClients, setIsLoadingAllClients] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const reload = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  // Arranque híbrido (Stale-While-Revalidate):
  // 1. Intenta cargar de inmediato desde el disco local para permitir operación offline sin esperas.
  // 2. En segundo plano consulta la API de Azure para refrescar el disco local con datos actualizados.
  useEffect(() => {
    let isMounted = true;

    if (!hasSession) {
      setProducts([]);
      setProductsHasMore(false);
      setClients([]);
      setClientsTotal(0);
      setAllProducts(null);
      setAllClients(null);
      setProductsError(null);
      setClientsError(null);
      setIsLoading(false);
      setIsOfflineMode(false);
      setProgress(0);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setProductsError(null);
    setClientsError(null);
    setProgress(10);

    let hasLocalCache = false;

    // FASE 1: Lectura inmediata desde disco local (0ms o casi 0ms)
    Promise.all([
      getCachedProducts(),
      getCachedAllProducts(),
      getCachedClients(),
      getCachedAllClients(),
    ]).then(([cachedProducts, cachedAllProducts, cachedClients, cachedAllClients]) => {
      if (!isMounted) return;

      if (cachedProducts || cachedAllProducts || cachedClients || cachedAllClients) {
        hasLocalCache = true;
        if (cachedProducts) {
          setProducts(cachedProducts);
          setProductsHasMore(true);
        }
        if (cachedAllProducts) {
          setAllProducts(cachedAllProducts);
          if (!cachedProducts) setProducts(cachedAllProducts.slice(0, 20));
        }
        if (cachedClients) {
          setClients(cachedClients.clients);
          setClientsTotal(cachedClients.total);
        }
        if (cachedAllClients) {
          setAllClients(cachedAllClients);
          if (!cachedClients) {
            setClients(cachedAllClients.slice(0, 10));
            setClientsTotal(cachedAllClients.length);
          }
        }
        // Si había caché en disco, deshabilitamos la pantalla de carga para interacción inmediata
        setProgress(100);
        setIsLoading(false);
      }
    });

    // FASE 2: Sincronización en segundo plano con el backend
    let productsDone = false;
    let clientsDone = false;
    let productsSyncFailed = false;
    let clientsSyncFailed = false;

    const checkComplete = () => {
      if (!isMounted) return;
      if (productsDone && clientsDone) {
        setIsOfflineMode(hasLocalCache && (productsSyncFailed || clientsSyncFailed));
        setProgress(100);
        setIsLoading(false);
      } else if (productsDone || clientsDone) {
        setProgress(60);
      }
    };

    getProducts({ page: 1 })
      .then((loadedProducts) => {
        if (!isMounted) return;
        setProducts(loadedProducts.products);
        setProductsHasMore(loadedProducts.hasMore);
        saveCachedProducts(loadedProducts.products);
        setProductsError(null);
        productsDone = true;
        checkComplete();
      })
      .catch((err) => {
        if (!isMounted) return;
        if (!hasLocalCache) {
          setProducts([]);
          setProductsHasMore(false);
          setProductsError(err instanceof Error ? err.message : 'No fue posible cargar los productos.');
        } else {
          productsSyncFailed = true;
        }
        productsDone = true;
        checkComplete();
      });

    getClients({ page: 1, pageSize: CLIENTS_PRELOAD_PAGE_SIZE })
      .then((loadedClients) => {
        if (!isMounted) return;
        setClients(loadedClients.clients);
        const total = loadedClients.total ?? loadedClients.clients.length;
        setClientsTotal(total);
        saveCachedClients(loadedClients.clients, total);
        setClientsError(null);
        clientsDone = true;
        checkComplete();
      })
      .catch((err) => {
        if (!isMounted) return;
        if (!hasLocalCache) {
          setClients([]);
          setClientsTotal(0);
          setClientsError(err instanceof Error ? err.message : 'No fue posible cargar los clientes.');
        } else {
          clientsSyncFailed = true;
        }
        clientsDone = true;
        checkComplete();
      });

    return () => {
      isMounted = false;
    };
  }, [hasSession, reloadIndex]);

  // Carga del catálogo completo de productos en segundo plano + actualización del disco local
  useEffect(() => {
    if (!hasSession || isLoading || productsError) return;

    let isMounted = true;
    setIsLoadingAllProducts(true);

    getAllProducts()
      .then((all) => {
        if (!isMounted) return;
        setAllProducts(all);
        saveCachedAllProducts(all);
        prefetchProductImages(all);
      })
      .catch(() => {
        // Silencioso: si falla la red, conservamos el allProducts obtenido del disco local
      })
      .finally(() => {
        if (isMounted) setIsLoadingAllProducts(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession, isLoading, productsError, reloadIndex]);

  // Carga de la cartera completa de clientes en segundo plano + actualización del disco local
  useEffect(() => {
    if (!hasSession || isLoading || clientsError) return;

    let isMounted = true;
    setIsLoadingAllClients(true);

    getAllClients()
      .then((all) => {
        if (!isMounted) return;
        setAllClients(all);
        saveCachedAllClients(all);
      })
      .catch(() => {
        // Silencioso: si falla la red, conservamos el allClients obtenido del disco local
      })
      .finally(() => {
        if (isMounted) setIsLoadingAllClients(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession, isLoading, clientsError, reloadIndex]);

  // Reconexión reactiva al volver a primer plano
  useEffect(() => {
    if (!hasSession) return;

    let wasOffline = false;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;
      if (!isOnline) {
        wasOffline = true;
        setIsOfflineMode(true);
      } else if (wasOffline) {
        wasOffline = false;
        setIsOfflineMode(false);
        reload();
      }
    });

    return unsubscribe;
  }, [hasSession, reload]);

  useEffect(() => {
    if (!hasSession) return;

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && isOfflineMode) {
        reload();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [hasSession, isOfflineMode, reload]);

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
      allClients,
      isLoadingAllClients,
      isLoading,
      isOfflineMode,
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
      allClients,
      isLoadingAllClients,
      isLoading,
      isOfflineMode,
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
