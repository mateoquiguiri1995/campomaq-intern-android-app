/** Tipos del módulo de cotizaciones / proformas. */

import type { Product } from '../catalog/types';

/** Qué lista de precios se aplica a una línea de la cotización. */
export type PriceTier = 'A' | 'B' | 'C';

export interface QuoteItem {
  product: Product;
  quantity: number;
  priceTier: PriceTier;
  /** Descuento opcional en porcentaje. */
  discountPct?: number;
}

export interface Quote {
  id: string;
  clientId: string;
  items: QuoteItem[];
  createdAt: string;
  // TODO(Fase 4): subtotal, IVA y total se calcularán localmente.
}
