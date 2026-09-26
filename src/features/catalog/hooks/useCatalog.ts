import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { getProducts, searchProducts } from '../services/productService';
import {
  createRelevanceModel,
  planSearchQueries,
  rankRelatedProducts,
  type RelevanceContext,
  type SearchAnchor,
} from '../services/productRelevance';
import {
  filterIndexedProducts,
  indexProducts,
  suggestIndexedProducts,
} from '../services/productSearchMatcher';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
  subscribeRecentSearches,
} from '../services/recentSearches';
import type { Product } from '../types';

const PAGE_SIZE = 5;
const MAX_SEARCH_SUGGESTIONS = 6;

interface RemoteSearchResult {
  key: string;
  products: Product[];
}

/** Búsqueda iniciada eligiendo un producto sugerido. */
interface SelectedSuggestion {
  anchor: SearchAnchor;
  /** Lo que el vendedor había escrito al elegirlo (ej. "fumigar"). */
  intent: string;
}

function productCodeKey(code: string): string {
  return code.trim().toLowerCase();
}

/** Une resultados de varias consultas sin repetir productos, en orden de llegada. */
function mergeUniqueProducts(lists: Product[][]): Product[] {
  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const list of lists) {
    for (const product of list) {
      const key = productCodeKey(product.code);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(product);
    }
  }
  return merged;
}

export function useCatalog() {
  const {
    products: bootProducts,
    productsHasMore: bootProductsHasMore,
    allProducts,
    isLoadingAllProducts,
    isLoading: bootLoading,
    isSyncing,
    isOfflineMode,
    productsError,
    reload,
  } = useAppBootstrap();

  // Navegación normal (sin filtros): páginas reales traídas del backend.
  const [browseProducts, setBrowseProducts] = useState<Product[]>(bootProducts);
  const [browseHasMore, setBrowseHasMore] = useState(bootProductsHasMore);
  const [browsePage, setBrowsePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // `search` es lo que el vendedor va escribiendo (solo alimenta las
  // sugerencias); `submittedSearch` es el término confirmado con "Buscar",
  // una sugerencia o una búsqueda reciente, y es el que filtra el listado.
  const [search, setSearchText] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<SelectedSuggestion | null>(null);
  // Permite repetir la misma búsqueda (ej. reintentar tras un error de red).
  const [searchRevision, setSearchRevision] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Última respuesta correcta de /search, asociada al término que la pidió.
  // Solo se usa si coincide con el término confirmado actual.
  const [remoteSearch, setRemoteSearch] = useState<RemoteSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRequestId = useRef(0);

  const recentSearches = useSyncExternalStore(subscribeRecentSearches, getRecentSearches);

  const isSearching = submittedSearch.length > 0;

  // Consultas a /search (ver planSearchQueries): lo confirmado, lo escrito si
  // se eligió una sugerencia, y variantes más generales para que el backend
  // devuelva también los productos hermanos y afines.
  const searchIntent = selectedSuggestion?.intent ?? '';
  const searchKey = `${submittedSearch}|${searchIntent}`;
  const searchQueries = useMemo(
    () => (submittedSearch ? planSearchQueries(submittedSearch, searchIntent) : []),
    [submittedSearch, searchIntent]
  );
  const hasCategoryOrBrandFilter = selectedCategory !== 'Todos' || selectedBrand !== 'Todas';
  const hasActiveFilters = isSearching || hasCategoryOrBrandFilter;

  /**
   * Mientras no haya filtros activos, la "página 1" del listado sigue la
   * página que ya trajo el bootstrap. Cada vez que el bootstrap trae datos
   * nuevos (arranque o reload()/pull-to-refresh) se reinicia la paginación
   * real a la página 1 con los datos frescos, sin importar cuánto había
   * scrolleado el usuario antes: así el pull-to-refresh siempre funciona,
   * en vez de quedar inoperante después del primer `loadMore`.
   */
  useEffect(() => {
    setBrowseProducts(bootProducts);
    setBrowseHasMore(bootProductsHasMore);
    setBrowsePage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootProducts, bootProductsHasMore]);

  /**
   * Búsqueda remota del término confirmado (y de lo escrito, si se eligió una
   * sugerencia), en paralelo. Mientras está pendiente, o si fallan todas, el
   * listado usa la caché local (ver `combinedSearchResults`). Sin conexión no
   * se consulta /search: se trabaja solo con la caché. Al volver la conexión
   * se repite la consulta para el término actual.
   */
  useEffect(() => {
    const currentRequest = ++searchRequestId.current;

    if (searchQueries.length === 0) {
      setRemoteSearch(null);
      setSearchLoading(false);
      return;
    }

    if (isOfflineMode) {
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const requestKey = searchKey;

    Promise.allSettled(searchQueries.map((query) => searchProducts(query)))
      .then((responses) => {
        if (currentRequest !== searchRequestId.current) return;
        const succeeded = responses.flatMap((response) =>
          response.status === 'fulfilled' ? [response.value] : []
        );
        // Si todas fallaron se mantiene la caché como respaldo.
        if (succeeded.length === 0) return;
        setRemoteSearch({ key: requestKey, products: mergeUniqueProducts(succeeded) });
      })
      .finally(() => {
        if (currentRequest !== searchRequestId.current) return;
        setSearchLoading(false);
      });
    // searchKey se deriva de las mismas entradas que searchQueries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQueries, searchRevision, isOfflineMode]);

  /**
   * Al cambiar cualquier filtro, la paginación vuelve a empezar
   * desde la primera página.
   */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [submittedSearch, searchRevision, selectedCategory, selectedBrand]);

  // Catálogo local (allProducts, con fallback a browseProducts) indexado una
  // sola vez por carga para que filtrar mientras se escribe sea liviano.
  const localCatalogIndex = useMemo(
    () => indexProducts(allProducts ?? browseProducts),
    [allProducts, browseProducts]
  );

  // Estadísticas del catálogo local para medir relación (especificidad de
  // palabras, marcas, tipos compuestos). Solo calculan: los productos que se
  // muestran online son siempre los del API.
  const relevanceModel = useMemo(
    () => createRelevanceModel(allProducts ?? browseProducts),
    [allProducts, browseProducts]
  );

  // Referencia para medir qué tan relacionado está cada resultado.
  const relevanceContext = useMemo<RelevanceContext>(
    () =>
      selectedSuggestion
        ? {
            queries: searchIntent ? [searchIntent] : [],
            anchor: selectedSuggestion.anchor,
            model: relevanceModel,
          }
        : { queries: [submittedSearch], model: relevanceModel },
    [selectedSuggestion, searchIntent, submittedSearch, relevanceModel]
  );

  // Sugerencias de autocompletado desde la caché para lo que se va
  // escribiendo. useDeferredValue evita que el filtrado frene el tipeo.
  const deferredSearch = useDeferredValue(search);
  const searchSuggestions = useMemo(
    () => suggestIndexedProducts(localCatalogIndex, deferredSearch, MAX_SEARCH_SUGGESTIONS),
    [localCatalogIndex, deferredSearch]
  );

  // 1. Resultado local provisional (online, mientras responde el API) u
  // offline, para las mismas consultas y con el mismo orden por relación.
  const cacheResults = useMemo(
    () =>
      isSearching
        ? mergeUniqueProducts(searchQueries.map((query) => filterIndexedProducts(localCatalogIndex, query)))
        : [],
    [localCatalogIndex, isSearching, searchQueries]
  );

  // 2. Si /search respondió bien, su resultado reemplaza a la caché (mientras
  // está pendiente, sin conexión o si falló, se usa la caché local). En ambos
  // casos se ordena por relación con la búsqueda y se descartan los productos
  // sin relación (ver productRelevance).
  const combinedSearchResults = useMemo(() => {
    if (!isSearching) return [];

    const base = remoteSearch?.key === searchKey ? remoteSearch.products : cacheResults;
    return rankRelatedProducts(base, relevanceContext);
  }, [remoteSearch, cacheResults, isSearching, searchKey, relevanceContext]);

  /** Texto del input: no dispara búsquedas. Vaciarlo vuelve al catálogo. */
  const setSearch = useCallback((text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSubmittedSearch('');
      setSelectedSuggestion(null);
    }
  }, []);

  /**
   * Confirma una búsqueda (botón/tecla "Buscar" o una búsqueda reciente) y la
   * guarda en el historial.
   */
  function submitSearch(term?: string) {
    const value = term ?? search;
    const trimmed = value.trim();

    setSearchText(value);
    setSubmittedSearch(trimmed);
    setSelectedSuggestion(null);
    setSearchRevision((revision) => revision + 1);
    if (trimmed) addRecentSearch(trimmed);
  }

  /**
   * Elegir un producto sugerido: se busca por su nombre y también por lo que
   * se había escrito; el elegido se muestra primero y luego sus relacionados.
   */
  function selectSuggestion(product: Product) {
    const intent = search.trim();
    const name = product.name.trim();

    setSearchText(product.name);
    setSubmittedSearch(name);
    setSelectedSuggestion({
      anchor: { code: product.code, name: product.name, brand: product.brand ?? '' },
      intent: intent.toLowerCase() === name.toLowerCase() ? '' : intent,
    });
    setSearchRevision((revision) => revision + 1);
    if (name) addRecentSearch(name);
  }

  /**
   * Con búsqueda de texto se parte del resultado híbrido unificado. Con solo
   * categoría/marca (sin texto) se filtra sobre el catálogo completo ya
   * cargado en memoria. Sin filtros, se navega el listado paginado tal cual
   * llega del backend.
   */
  const sourceProducts = isSearching
    ? combinedSearchResults
    : hasCategoryOrBrandFilter
      ? allProducts ?? []
      // Sin filtros: en cuanto el catálogo completo (allProducts) esté
      // disponible se prefiere sobre browseProducts (paginación real de
      // backend) para poder ordenar y revelar más productos localmente sin
      // reordenar tarjetas ya mostradas (ver `usingLocalBrowseSource`).
      : allProducts ?? browseProducts;

  const filteredProducts = useMemo(() => {
    if (!hasActiveFilters) return sourceProducts;

    return sourceProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;

      const matchesBrand = selectedBrand === 'Todas' || product.brand === selectedBrand;

      return matchesCategory && matchesBrand;
    });
  }, [sourceProducts, hasActiveFilters, selectedCategory, selectedBrand]);

  /**
   * true cuando el listado sin filtros ya puede navegarse sobre el catálogo
   * completo en memoria (allProducts) en vez de sobre la paginación real de
   * red (browseProducts). Antes de que allProducts termine de cargar, se
   * sigue usando la paginación real como arranque rápido.
   */
  const usingLocalBrowseSource = !hasActiveFilters && allProducts !== null;

  /**
   * El catálogo se muestra en el orden del API; los resultados de búsqueda,
   * ordenados por relación con lo buscado (ver combinedSearchResults). Con
   * filtros activos, o sin filtros una vez cargado el catálogo completo,
   * "cargar más" revela más de lo que ya está en memoria (slice progresivo
   * con visibleCount) — nunca reubica tarjetas ya mostradas. Sin filtros y todavía sin el
   * catálogo completo, la lista viene paginada real desde el backend
   * (browseProducts crece con cada loadMoreBrowsePage()), así que se
   * muestra completa.
   */
  const visibleProducts = useMemo(() => {
    if (hasActiveFilters || usingLocalBrowseSource) {
      return filteredProducts.slice(0, visibleCount);
    }
    return filteredProducts;
  }, [filteredProducts, visibleCount, hasActiveFilters, usingLocalBrowseSource]);

  /**
   * Cuando allProducts termina de cargar en segundo plano y se pasa del modo
   * de paginación real (browseProducts) al modo local (slice progresivo),
   * aseguramos que visibleCount nunca sea menor a lo que el usuario ya había
   * revelado por scroll: de lo contrario la lista "encogería" de golpe.
   */
  useEffect(() => {
    if (!hasActiveFilters && allProducts) {
      setVisibleCount((current) => Math.max(current, browseProducts.length, PAGE_SIZE));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts, hasActiveFilters]);

  async function loadMoreBrowsePage() {
    if (loadingMore || !browseHasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = browsePage + 1;
      const result = await getProducts({ page: nextPage });
      setBrowseProducts((prev) => {
      const existingCodes = new Set(prev.map((product) => product.code));

      return [
        ...prev,
        ...result.products.filter((product) => !existingCodes.has(product.code)),
      ];
      });
      setBrowsePage(nextPage);
      setBrowseHasMore(result.hasMore);
    } catch {
      // Si falla la API (offline) y tenemos allProducts en disco local, expandimos desde memoria
      if (allProducts && allProducts.length > browseProducts.length) {
        const nextSlice = allProducts.slice(0, browseProducts.length + PAGE_SIZE);
        setBrowseProducts(nextSlice);
        setBrowseHasMore(nextSlice.length < allProducts.length);
      }
    } finally {
      setLoadingMore(false);
    }

  }

  function loadMore() {
    if (hasActiveFilters || usingLocalBrowseSource) {
      setVisibleCount((current) => current + PAGE_SIZE);
    } else {
      loadMoreBrowsePage();
    }
  }

  /**
   * Limpia búsqueda y filtros para volver al catálogo completo.
   */
  function resetFilters() {
    setSearch('');
    setSelectedCategory('Todos');
    setSelectedBrand('Todas');
  }

  /**
   * Marcas únicas. Mientras el catálogo completo no esté listo, se
   * calculan con lo que ya se cargó (crecen solas cuando allProducts llega).
   */
  const brands = useMemo(() => {
    const source = allProducts ?? browseProducts;
    return ['Todas', ...new Set(source.map((p) => p.brand))];
  }, [allProducts, browseProducts]);

  /**
   * Categorías únicas
   */
  const categories = useMemo(() => {
    const source = allProducts ?? browseProducts;
    return ['Todos', ...new Set(source.map((p) => p.category))];
  }, [allProducts, browseProducts]);

  const hasMore = hasActiveFilters || usingLocalBrowseSource
    ? visibleCount < filteredProducts.length
    : browseHasMore;

  return {
    loading:
      (bootLoading && browseProducts.length === 0 && !allProducts?.length) ||
      // No depende de `isLoadingAllProducts`: la carga del catálogo completo
      // se difiere ~1.2s tras el arranque, y en ese margen `isLoadingAllProducts`
      // todavía es `false` aunque `allProducts` siga sin llegar — sin este
      // chequeo, filtrar por categoría/marca en ese margen mostraba un falso
      // "sin resultados" en vez de un estado de carga.
      (hasCategoryOrBrandFilter && !isSearching && allProducts === null),

    // Búsqueda en curso: se expone aparte del `loading` general para no
    // reemplazar toda la pantalla por un spinner en cada letra escrita.
    searchLoading,

    error: productsError,

    products: visibleProducts,

    totalProducts: filteredProducts.length,

    // Refleja si el backend tiene productos, sin importar el filtro/búsqueda
    // activos en este momento (que pueden legítimamente no tener resultados).
    hasProducts: browseProducts.length > 0,

    hasMore,

    hasActiveFilters,

    resetFilters,

    search,

    setSearch,

    // Término confirmado que está filtrando el listado ('' = sin búsqueda).
    submittedSearch,

    submitSearch,

    selectSuggestion,

    // Autocompletado desde la caché local para lo que se va escribiendo.
    searchSuggestions,

    recentSearches,

    removeRecentSearch,

    clearRecentSearches,

    isOffline: isOfflineMode,

    selectedCategory,

    setSelectedCategory,

    selectedBrand,

    setSelectedBrand,

    categories,

    brands,

    loadMore,

    refresh: reload,

    // bootLoading cubre el arranque en frío; isSyncing cubre el
    // pull-to-refresh manual (antes no se reflejaba y el spinner
    // desaparecía de inmediato aunque la sincronización siguiera en curso).
    refreshing: bootLoading || isSyncing,
  };
}
