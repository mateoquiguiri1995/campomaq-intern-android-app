import { API_BASE_URL } from '@/api/client';
import type { ApiProduct } from '../api/productApi';
import type { Product } from '../types';

/**
 * El backend a veces devuelve rutas relativas (ej. logos de marca)
 * y a veces URLs absolutas ya listas para usar (ej. imágenes de
 * producto en Azure Blob Storage). Solo hay que anteponer la base
 * cuando la URL no viene absoluta.
 */
function resolveImageUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

/**
 * Convierte un producto del backend
 * al modelo utilizado por la aplicación.
 */
export function mapApiProduct(api: ApiProduct): Product {
  return {
    id: String(api.product_id),

    code: api.product_code,

    name: api.product_name,

    category: api.category_name,

    brand: api.brand_name,

    mainPrice: api.price_cash,

    brandLogo: api.brand_logo
    ? resolveImageUrl(api.brand_logo)
    : undefined,

    imageUrl: api.link?.[0]
      ? resolveImageUrl(api.link[0])
      : undefined,

    images: api.link?.map(resolveImageUrl),

    description: api.description,

    isNew: api.new_product,

    createdAt: api.created_at,

    updatedAt: api.updated_at,
    // Adaptamos los tres precios de la API.
    priceA: api.price_cash,
    priceB: api.price_card,
    priceC: api.price_credit,

    // Temporal hasta que el backend los envíe.
    stockQty: api.stock ?? 0,

    marginPct: api.margin,
  };
}