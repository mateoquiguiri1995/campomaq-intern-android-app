/** Tipos del módulo de catálogo. */

export type ProductCategory = string;

export interface Product {
  id: string;

  code: string;

  name: string;

  category: ProductCategory;

  brand: string;

  brandLogo?: string;

  mainPrice: number;

  priceA: number;

  priceB: number;

  priceC: number;

  marginPct?: number;

  stockQty?: number | null;

  imageUrl?: string;

  /**
   * Todas las imágenes disponibles.
   */
  images?: string[];

  /**
   * HTML que contiene la ficha técnica.
   */
  description?: string;

  /**
   * Producto nuevo.
   */
  isNew?: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface MonthlyGoal {
  id?: string;
  title?: string;
  period?: string;
  targetMargin: number;
  achievedMargin: number;
  percentage?: number;
}

