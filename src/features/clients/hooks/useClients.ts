import { useEffect, useRef, useState } from 'react';

import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { getClients } from '../services/clientService';
import type { Client } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export function useClients() {
  const { clients: bootClients, clientsTotal: bootClientsTotal, isLoading: bootLoading } = useAppBootstrap();

  const [clients, setClients] = useState<Client[]>(bootClients);
  const [loading, setLoading] = useState(true);
  // Búsqueda en curso: separado de `loading` para no reemplazar toda la
  // pantalla por un spinner en cada letra escrita (la lista anterior se
  // mantiene visible hasta que llega la respuesta nueva).
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(bootClientsTotal);

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
        setClients((prev) => (append ? [...prev, ...bootClients] : bootClients));
        setPage(1);
        setTotal(bootClientsTotal);
        return;
      }

      const result = await getClients({
        q: query || undefined,
        page: targetPage,
        pageSize: PAGE_SIZE,
      });

      if (currentRequest !== requestId.current) return;

      setClients((prev) => (append ? [...prev, ...result.clients] : result.clients));
      setPage(result.page);
      setTotal(result.total ?? result.clients.length);
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
      setTotal(bootClientsTotal);
      setPage(1);
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
  }, [search, bootClients, bootClientsTotal, bootLoading]);

  function loadMore() {
    if (loading || searchLoading || loadingMore) return;
    if (clients.length >= total) return;
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
    hasMore: clients.length < total,
    hasActiveFilters: search.trim().length > 0,
    search,
    setSearch,
    loadMore,
    refresh,
  };
}
