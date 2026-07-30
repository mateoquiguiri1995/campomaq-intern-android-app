/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';

import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { getClients } from '../services/clientService';
import type { Client } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export function useClients() {
  const {
    clients: bootClients,
    clientsError: bootClientsError,
    isLoading: bootLoading,
  } = useAppBootstrap();

  const [clients, setClients] = useState<Client[]>(bootClients);
  const [loading, setLoading] = useState(true);
  // Búsqueda en curso: separado de `loading` para no reemplazar toda la
  // pantalla por un spinner en cada letra escrita (la lista anterior se
  // mantiene visible hasta que llega la respuesta nueva).
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(bootClientsError);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Descarta respuestas de búsquedas/páginas que ya quedaron obsoletas.
  const requestId = useRef(0);

  async function loadClients(query: string, targetPage: number, append: boolean) {
    const currentRequest = ++requestId.current;
    const isSearch = query.length > 0;

    try {
      if (append) setLoadingMore(true);
      else if (isSearch) setSearchLoading(true);
      else setLoading(true);
      setError(null);

      if (!query && targetPage === 1 && bootClients.length > 0) {
        if (currentRequest !== requestId.current) return;
        setClients(bootClients);
        setPage(1);
        setHasMore(bootClients.length >= PAGE_SIZE);
        return;
      }

      const result = await getClients({
        q: query || undefined,
        page: targetPage,
        pageSize: PAGE_SIZE,
      });

      if (currentRequest !== requestId.current) return;

      setClients((prev) => {
        if (!append) {
          setHasMore(result.clients.length >= PAGE_SIZE);
          return result.clients;
        }
        const existingIds = new Set(prev.map((c) => c.id));
        const uniqueNew = result.clients.filter((c) => !existingIds.has(c.id));

        if (uniqueNew.length === 0 || result.clients.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        return [...prev, ...uniqueNew];
      });
      setPage(result.page);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'No fue posible cargar los clientes.');
    } finally {
      if (currentRequest !== requestId.current) return;
      setLoading(false);
      setSearchLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const trimmedSearch = search.trim();

    if (!bootLoading && bootClients.length > 0 && trimmedSearch.length === 0) {
      setClients(bootClients);
      setPage(1);
      setHasMore(bootClients.length >= PAGE_SIZE);
      setLoading(false);
      setSearchLoading(false);
      return;
    }

    const handle = setTimeout(
      () => {
        loadClients(trimmedSearch, 1, false);
      },
      trimmedSearch ? SEARCH_DEBOUNCE_MS : 0
    );

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, bootClients, bootLoading]);

  function loadMore() {
    if (loading || searchLoading || loadingMore) return;
    if (!hasMore) return;
    loadClients(search.trim(), page + 1, true);
  }

  function refresh() {
    loadClients(search.trim(), 1, false);
  }

  return {
    clients,
    loading,
    searchLoading,
    loadingMore,
    error,
    hasClients: clients.length > 0,
    hasMore,
    hasActiveFilters: search.trim().length > 0,
    search,
    setSearch,
    loadMore,
    refresh,
  };
}
