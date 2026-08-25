import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { getAuthenticatedSellerDashboard } from './services/sellerService';
import { getCachedSellerDashboard, saveCachedSellerDashboard } from './services/sellerCache';
import type { SellerDashboard } from './types';

interface SellerContextValue {
  seller: SellerDashboard | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SellerContext = createContext<SellerContextValue | null>(null);

export function SellerProvider({ children }: PropsWithChildren) {
  const { session, hasSession } = useAuth();
  const userId = session?.user.id;
  const [seller, setSeller] = useState<SellerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hasSession || !userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const dashboard = await getAuthenticatedSellerDashboard();
      setSeller(dashboard);
      await saveCachedSellerDashboard(userId, dashboard);
    } catch (cause) {
      // Si falla la red pero ya tenemos datos en caché, no los borramos
      if (!seller) {
        setSeller(null);
        setError(cause instanceof Error ? cause.message : 'No pudimos cargar tu rendimiento comercial.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasSession, userId, seller]);

  useEffect(() => {
    let active = true;
    if (!hasSession || !userId) {
      setSeller(null);
      setError(null);
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    let hasLocalCache = false;

    // FASE 1: Carga instantánea desde caché local (0ms)
    getCachedSellerDashboard(userId).then((cached) => {
      if (!active || !cached) return;
      hasLocalCache = true;
      setSeller(cached);
      setIsLoading(false);
    });

    // FASE 2: Sincronización en segundo plano con la API
    if (!hasLocalCache) {
      setIsLoading(true);
    }
    setError(null);

    getAuthenticatedSellerDashboard()
      .then((dashboard) => {
        if (!active) return;
        setSeller(dashboard);
        saveCachedSellerDashboard(userId, dashboard);
      })
      .catch((cause) => {
        if (!active) return;
        // Si no había caché en disco, se reporta el error; si había caché, se conserva
        if (!hasLocalCache) {
          setSeller(null);
          setError(cause instanceof Error ? cause.message : 'No pudimos cargar tu rendimiento comercial.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasSession, userId]);

  const value = useMemo(() => ({ seller, isLoading, error, refresh }), [seller, isLoading, error, refresh]);
  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}


export function useSellerDashboard() {
  const context = useContext(SellerContext);
  if (!context) throw new Error('useSellerDashboard debe usarse dentro de <SellerProvider>.');
  return context;
}
