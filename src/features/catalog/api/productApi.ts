import { apiGet } from '@/api/client';

/**
 * Modelo EXACTO que devuelve el backend.
 * No debe modificarse para adaptarlo a la UI.
 */
export interface ApiProduct {
  product_id: number;
  product_code: string;
  product_name: string;
  category_name: string;
  brand_name: string;
  brand_logo?: string;
  new_product?: boolean;
  created_at?: string;
  updated_at?: string;
  price_cash: number;
  price_card: number;
  price_credit: number;
  description?: string;
  link: string[];

  // Todavía no llegan desde la API.
  stock?: number;
  margin?: number;
}

/**
 * Obtiene todos los productos.
 */
export async function getProductsFromApi(): Promise<ApiProduct[]> {
  return apiGet<ApiProduct[]>('/products');
}

/**
 * Busca productos por nombre o código.
 */
export async function searchProductsFromApi(
  query: string
): Promise<ApiProduct[]> {
  const params = new URLSearchParams({
    q: query,
  });

  return apiGet<ApiProduct[]>(`/search?${params.toString()}`);
}