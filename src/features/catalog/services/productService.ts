import type { Product } from '../types';

import {
  BACKEND_PRODUCTS_PAGE_SIZE,
  getProductsFromApi,
  searchProductsFromApi,
  type GetProductsFromApiParams,
} from '../api/productApi';

import { mapApiProduct } from './productMapper';

export interface GetProductsParams extends GetProductsFromApiParams {}

export interface ProductsResult {
  products: Product[];
  page: number;
  /**
   * true si la página vino completa (BACKEND_PRODUCTS_PAGE_SIZE productos):
   * probablemente haya más para cargar. El backend no informa un total.
   */
  hasMore: boolean;
}

/**
 * Obtiene productos paginados desde la API.
 */
export async function getProducts(params: GetProductsParams = {}): Promise<ProductsResult> {
  const items = await getProductsFromApi(params);

  return {
    products: items.map(mapApiProduct),
    page: params.page ?? 1,
    hasMore: items.length >= BACKEND_PRODUCTS_PAGE_SIZE,
  };
}

/**
 * Catálogo completo, para filtrar por búsqueda/categoría/marca en el
 * cliente. Sin `page`, el backend ya devuelve todo el catálogo en una
 * sola respuesta, así que no hace falta recorrer páginas.
 */
export async function getAllProducts(): Promise<Product[]> {
  const items = await getProductsFromApi();
  return items.map(mapApiProduct);
}

/**
 * Busca productos por nombre o código.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) {
    return getAllProducts();
  }

  const apiProducts = await searchProductsFromApi(query);

  return apiProducts.map(mapApiProduct);
}
