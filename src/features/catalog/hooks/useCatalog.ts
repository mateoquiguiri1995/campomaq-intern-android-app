import { useEffect, useMemo, useState } from 'react';

import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { getProducts } from '../services/productService';
import type { Product } from '../types';

const PAGE_SIZE = 5;

export function useCatalog() {
  const {
    products: bootProducts,
    productsHasMore: bootProductsHasMore,
    allProducts,
    isLoadingAllProducts,
    isLoading: bootLoading,
    error: bootError,
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

  const hasActiveFilters =
    search.trim().length > 0 || selectedCategory !== 'Todos' || selectedBrand !== 'Todas';

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
   * Al cambiar cualquier filtro, la paginación vuelve a empezar
   * desde la primera página.
   */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedCategory, selectedBrand]);

  /**
   * Con filtros activos se filtra sobre el catálogo completo (necesario
   * porque el backend no soporta filtrar por búsqueda/categoría/marca);
   * sin filtros, se navega el listado paginado tal cual llega del backend.
   */
  const sourceProducts = hasActiveFilters ? allProducts ?? [] : browseProducts;

  const filteredProducts = useMemo(() => {
    if (!hasActiveFilters) return sourceProducts;

    return sourceProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.code.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;

      const matchesBrand = selectedBrand === 'Todas' || product.brand === selectedBrand;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [sourceProducts, hasActiveFilters, search, selectedCategory, selectedBrand]);

  /**
   * Con filtros activos, "cargar más" revela más del catálogo completo ya
   * en memoria (slice progresivo con visibleCount). Sin filtros, la lista
   * ya viene paginada real desde el backend (browseProducts crece con cada
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
    loading: bootLoading || (hasActiveFilters && allProducts === null && isLoadingAllProducts),

    error: bootError,

    products: visibleProducts,

    totalProducts: filteredProducts.length,

    hasProducts: (hasActiveFilters ? sourceProducts.length : browseProducts.length) > 0,

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
