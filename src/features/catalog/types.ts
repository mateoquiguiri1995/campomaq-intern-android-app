/** Tipos del módulo de catálogo. */

export type ProductCategory =
  | 'Cultivadores'
  | 'Motosierras'
  | 'Bombas'
  | 'Repuestos';

export interface Product {
  id: string;
  /** Código interno del producto (ej. "CM-1042"). */
  code: string;
  name: string;
  category: ProductCategory;
  brand: string;
  /** Precio principal que se muestra en el catálogo. */
  mainPrice: number;
  /** Lista de precios A/B/C que maneja Campo Maq. */
  priceA: number;
  priceB: number;
  priceC: number;
  /** Margen en porcentaje (ej. 18 = 18%). Puede no venir del backend. */
  marginPct?: number;
  /** Stock disponible. En el backend se actualiza cada 10 minutos. */
  stockQty: number;
  imageUrl?: string;
}
