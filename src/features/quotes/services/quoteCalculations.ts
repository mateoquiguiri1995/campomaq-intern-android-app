import type { Product } from '../../catalog/types';
import type { PriceTier, QuoteItem } from '../types';

/** Tasa de IVA vigente en Ecuador. Fija por ahora (no editable por cotización). */
export const IVA_RATE = 0.15;

export function getUnitPrice(product: Product, tier: PriceTier): number {
  if (tier === 'A') return product.priceA;
  if (tier === 'B') return product.priceB;
  return product.priceC;
}

export function getLineTotal(item: QuoteItem): number {
  const gross = getUnitPrice(item.product, item.priceTier) * item.quantity;
  const discount = item.discountPct ? gross * (item.discountPct / 100) : 0;
  return gross - discount;
}

export interface QuoteTotals {
  subtotal: number;
  iva: number;
  total: number;
}

export function getQuoteTotals(items: QuoteItem[]): QuoteTotals {
  const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const iva = subtotal * IVA_RATE;
  return { subtotal, iva, total: subtotal + iva };
}
