import { useEffect, useMemo, useRef, useState } from 'react';

import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { getClients, searchClients } from '../services/clientService';
import type { Client } from '../types';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export function useClients() {
  const {
    clients: bootClients,
    clientsTotal: bootClientsTotal,
    allClients,
    isLoadingAllClients,
    clientsError: bootClientsError,
    isLoading: bootLoading,
    reload,
  } = useAppBootstrap();

  const [browseClients, setBrowseClients] = useState<Client[]>(bootClients);
  const [browseHasMore, setBrowseHasMore] = useState(bootClients.length < bootClientsTotal);
  const [browsePage, setBrowsePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRequestId = useRef(0);

  const trimmedSearch = search.trim();
  const isSearching = trimmedSearch.length > 0;

  useEffect(() => {
    if (browsePage === 1) {
      setBrowseClients(bootClients);
      setBrowseHasMore(bootClients.length < bootClientsTotal);
    }
  }, [bootClients, bootClientsTotal, browsePage]);

  /**
   * Búsqueda por texto con comportamiento híbrido: filtra inmediatamente
   * usando la caché local y dispara la búsqueda remota de fondo con debounce.
   */
  useEffect(() => {
    if (!isSearching) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const currentRequest = ++searchRequestId.current;
    setSearchLoading(true);
    setSearchResults([]);

    const handle = setTimeout(() => {
      searchClients(trimmedSearch)
        .then((results) => {
          if (currentRequest !== searchRequestId.current) return;
          setSearchResults(results);
        })
        .catch(() => {
          if (currentRequest !== searchRequestId.current) return;
          // Silencioso en fallo de red: la caché local ya cubre los resultados
          setSearchResults([]);
        })
        .finally(() => {
          if (currentRequest !== searchRequestId.current) return;
          setSearchLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [trimmedSearch, isSearching]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  // 1. Filtrado local inmediato usando allClients (caché completa) con fallback a browseClients
  const cacheResults = useMemo(() => {
    if (!isSearching) return [];

    const localPool = allClients ?? browseClients;
    const query = trimmedSearch.toLowerCase();

    return localPool.filter((client) => {
      const matchesName = client.name.toLowerCase().includes(query);
      const matchesRuc = client.ruc ? client.ruc.toLowerCase().includes(query) : false;
      const matchesPhone = client.phone ? client.phone.toLowerCase().includes(query) : false;
      const matchesEmail = client.email ? client.email.toLowerCase().includes(query) : false;
      const matchesLocation = client.location ? client.location.toLowerCase().includes(query) : false;
      return matchesName || matchesRuc || matchesPhone || matchesEmail || matchesLocation;
    });
  }, [allClients, browseClients, isSearching, trimmedSearch]);

  // 2. Fusión híbrida libre de duplicados (prioridad a la API, seguido de la caché)
  const combinedSearchResults = useMemo(() => {
    if (!isSearching) return [];

    const apiIds = new Set(searchResults.map((c) => c.id));
    const uniqueCacheResults = cacheResults.filter((c) => !apiIds.has(c.id));

    return [...searchResults, ...uniqueCacheResults];
  }, [searchResults, cacheResults, isSearching]);

  const sourceClients = useMemo(() => {
    if (isSearching) return combinedSearchResults;
    if (allClients && allClients.length > 0) return allClients;
    return browseClients;
  }, [isSearching, combinedSearchResults, allClients, browseClients]);

  const visibleClients = useMemo(() => {
    if (isSearching || (allClients && allClients.length > 0)) {
      return sourceClients.slice(0, visibleCount);
    }
    return sourceClients;
  }, [sourceClients, isSearching, allClients, visibleCount]);

  async function loadMoreBrowsePage() {
    if (loadingMore || !browseHasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = browsePage + 1;
      const result = await getClients({ page: nextPage, pageSize: PAGE_SIZE });
      setBrowseClients((prev) => [...prev, ...result.clients]);
      setBrowsePage(nextPage);
      setBrowseHasMore(browseClients.length + result.clients.length < (result.total ?? bootClientsTotal));
    } catch {
      // Si falla la red y tenemos allClients, podemos expandir desde memoria local
      if (allClients && allClients.length > browseClients.length) {
        const nextSlice = allClients.slice(0, browseClients.length + PAGE_SIZE);
        setBrowseClients(nextSlice);
        setBrowseHasMore(nextSlice.length < allClients.length);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  function loadMore() {
    if (isSearching || (allClients && allClients.length > 0)) {
      setVisibleCount((current) => current + PAGE_SIZE);
    } else {
      loadMoreBrowsePage();
    }
  }

  const hasMore = useMemo(() => {
    if (isSearching || (allClients && allClients.length > 0)) {
      return visibleCount < sourceClients.length;
    }
    return browseHasMore;
  }, [isSearching, allClients, visibleCount, sourceClients.length, browseHasMore]);

  // Solo muestra error si no hay datos locales en disco que mostrar
  const error = (sourceClients.length === 0 && !bootLoading) ? bootClientsError : null;

  return {
    clients: visibleClients,
    loading: bootLoading && browseClients.length === 0 && !allClients?.length,
    searchLoading,
    loadingMore,
    error,
    hasClients: sourceClients.length > 0,
    hasMore,
    hasActiveFilters: isSearching,
    search,
    setSearch,
    loadMore,
    refresh: reload,
    refreshing: bootLoading,
  };
}

