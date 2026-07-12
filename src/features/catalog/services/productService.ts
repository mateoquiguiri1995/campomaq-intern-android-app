import type { Product } from '../types';

import {
  getProductsFromApi,
  searchProductsFromApi,
} from '../api/productApi';

import { mapApiProduct } from './productMapper';

/**
 * Obtiene todos los productos desde la API.
 */
export async function getProducts(): Promise<Product[]> {
  const apiProducts = await getProductsFromApi();

  return apiProducts.map(mapApiProduct);
}

/**
 * Busca productos por nombre o código.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) {
    return getProducts();
  }

  const apiProducts = await searchProductsFromApi(query);

  return apiProducts.map(mapApiProduct);
}