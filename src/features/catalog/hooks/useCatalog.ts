import { useEffect, useMemo, useState } from 'react';

import { getProducts } from '../services/productService';
import type { Product } from '../types';

const PAGE_SIZE = 20;

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('Todos');

  const [selectedBrand, setSelectedBrand] =
    useState('Todas');

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  async function loadProducts() {
    try {
      setLoading(true);

      setError(null);

      const data = await getProducts();

      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar los productos.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /**
   * Al cambiar cualquier filtro, la paginación vuelve a empezar
   * desde la primera página.
   */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedCategory, selectedBrand]);

  /**
   * Filtros
   */
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.code
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todos' ||
        product.category === selectedCategory;

      const matchesBrand =
        selectedBrand === 'Todas' ||
        product.brand === selectedBrand;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand
      );
    });
  }, [
    products,
    search,
    selectedCategory,
    selectedBrand,
  ]);

  /**
   * Paginación
   */
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  function loadMore() {
    setVisibleCount((current) => current + PAGE_SIZE);
  }

  /**
   * Limpia búsqueda y filtros para volver al catálogo completo.
   */
  function resetFilters() {
    setSearch('');
    setSelectedCategory('Todos');
    setSelectedBrand('Todas');
  }

  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedCategory !== 'Todos' ||
    selectedBrand !== 'Todas';

  /**
   * Marcas únicas
   */
  const brands = useMemo(() => {
    return [
      'Todas',
      ...new Set(products.map((p) => p.brand)),
    ];
  }, [products]);

  /**
   * Categorías únicas
   */
  const categories = useMemo(() => {
    return [
      'Todos',
      ...new Set(products.map((p) => p.category)),
    ];
  }, [products]);

  return {
    loading,

    error,

    products: visibleProducts,

    totalProducts: filteredProducts.length,

    hasProducts: products.length > 0,

    hasMore: visibleCount < filteredProducts.length,

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

    refresh: loadProducts,
  };
}