/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { getProducts, searchProducts } from '../services/productService';
import type { Product } from '../types';

const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 400;

export function useCatalog() {
  const {
    products: bootProducts,
    productsHasMore: bootProductsHasMore,
    allProducts,
    isLoadingAllProducts,
    isLoading: bootLoading,
    productsError,
    reload,
  } = useAppBootstrap();

  // Navegación normal (sin filtros): páginas reales traídas del backend.
  const [browseProducts, setBrowseProducts] = useState<Product[]>(bootProducts);
  const [browseHasMore, setBrowseHasMore] = useState(bootProductsHasMore);
  const [browsePage, setBrowsePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Resultados de texto: vienen del endpoint /search (soporta coincidencias
  // que un simple "includes" en el cliente no encontraría). Se guardan
  // aparte de browseProducts/allProducts para no perder ninguno de los dos.
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRequestId = useRef(0);

  const trimmedSearch = search.trim();
  const isSearching = trimmedSearch.length > 0;
  const hasCategoryOrBrandFilter = selectedCategory !== 'Todos' || selectedBrand !== 'Todas';
  const hasActiveFilters = isSearching || hasCategoryOrBrandFilter;

  /**
   * Mientras no haya filtros activos, la "página 1" del listado sigue la
   * página que ya trajo el bootstrap (se actualiza sola con reload()).
   */
  useEffect(() => {
    if (browsePage === 1) {
      setBrowseProducts(bootProducts);
      setBrowseHasMore(bootProductsHasMore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootProducts, bootProductsHasMore]);

  /**
   * Búsqueda por texto: pega contra /search (con toda la lógica de
   * coincidencias ya resuelta en el backend), con debounce para no disparar
   * una request por cada letra. No se limpian los resultados anteriores al
   * arrancar una búsqueda nueva: así la lista no "parpadea" a vacío mientras
   * se espera la respuesta, igual que se sentía antes con el filtro en
   * memoria.
   */
  useEffect(() => {
    if (!isSearching) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const currentRequest = ++searchRequestId.current;
    setSearchLoading(true);

    const handle = setTimeout(() => {
      searchProducts(trimmedSearch)
        .then((results) => {
          if (currentRequest !== searchRequestId.current) return;
          setSearchResults(results);
        })
        .catch(() => {
          if (currentRequest !== searchRequestId.current) return;
          setSearchResults([]);
        })
        .finally(() => {
          if (currentRequest !== searchRequestId.current) return;
          setSearchLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [trimmedSearch, isSearching]);

  // Render-time state reset to avoid useEffect setState cascading renders
  const [prevFilters, setPrevFilters] = useState({ search, selectedCategory, selectedBrand });
  if (
    prevFilters.search !== search ||
    prevFilters.selectedCategory !== selectedCategory ||
    prevFilters.selectedBrand !== selectedBrand
  ) {
    setPrevFilters({ search, selectedCategory, selectedBrand });
    setVisibleCount(PAGE_SIZE);
  }

  /**
   * Con búsqueda de texto se parte de lo que devuelve /search. Con solo
   * categoría/marca (sin texto) se filtra sobre el catálogo completo ya
   * cargado en memoria. Sin filtros, se navega el listado paginado tal cual
   * llega del backend.
   */
  const sourceProducts = isSearching
    ? searchResults
    : hasCategoryOrBrandFilter
      ? allProducts ?? []
      : browseProducts;

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
   * Con filtros activos, "cargar más" revela más de lo que ya está en
   * memoria (slice progresivo con visibleCount). Sin filtros, la lista ya
   * viene paginada real desde el backend (browseProducts crece con cada
   * loadMoreBrowsePage()), así que se muestra completa sin recortar.
   */
  const visibleProducts = useMemo(() => {
    if (!hasActiveFilters) return filteredProducts;
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount, hasActiveFilters]);

  async function loadMoreBrowsePage() {
    if (loadingMore || !browseHasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = browsePage + 1;
      const result = await getProducts({ page: nextPage });
      setBrowseProducts((prev) => [...prev, ...result.products]);
      setBrowsePage(nextPage);
      setBrowseHasMore(result.hasMore);
    } catch {
      // El error de "cargar más" no reemplaza el listado ya visible; el
      // usuario simplemente puede reintentar tocando "cargar más" de nuevo.
    } finally {
      setLoadingMore(false);
    }
  }

  function loadMore() {
    if (hasActiveFilters) {
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

  const hasMore = hasActiveFilters
    ? visibleCount < filteredProducts.length
    : browseHasMore;

  return {
    loading:
      bootLoading ||
      (hasCategoryOrBrandFilter && !isSearching && allProducts === null && isLoadingAllProducts),

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

    selectedCategory,

    setSelectedCategory,

    selectedBrand,

    setSelectedBrand,

    categories,

    brands,

    loadMore,

    refresh: reload,
  };
}
