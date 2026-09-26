import type { Product } from '../../catalog/types';
import type { PriceTier, QuoteItem } from '../types';

/** Tasa de IVA vigente en Ecuador. Fija por ahora (no editable por cotización). */
export const IVA_RATE = 0.15;

/** Redondeo preciso a 2 decimales para evitar problemas de coma flotante. */
export function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function getUnitPrice(product: Product, tier: PriceTier, customPrice?: number): number {
  if (tier === 'CUSTOM' && customPrice != null && customPrice > 0) {
    return round2(customPrice);
  }
  if (tier === 'A') return product.priceA;
  if (tier === 'B') return product.priceB;
  if (tier === 'C') return product.priceC;
  return product.priceA;
}

/**
 * Los precios de productos con `iva: true` ya vienen con el IVA incluido.
 * Devuelve el valor sin IVA (base imponible); sin cambios si no grava IVA.
 */
export function removeIva(amount: number, hasIva: boolean | undefined): number {
  return hasIva ? round2(amount / (1 + IVA_RATE)) : amount;
}

/** Precio unitario sin IVA (base imponible). */
export function getUnitPriceNet(item: QuoteItem): number {
  return removeIva(getUnitPrice(item.product, item.priceTier, item.customPrice), item.product?.iva);
}

export type UtilityLevel = 'low' | 'medium' | 'high' | 'none';

/**
 * Categoriza la utilidad en los 3 rangos del negocio:
 * - low (rojo): <= 10%
 * - medium (naranja): > 10% y <= 30%
 * - high (verde): > 30%
 * - none (neutro): sin costo disponible
 */
export function getUtilityLevel(utilityPct: number | null): UtilityLevel {
  if (utilityPct == null) return 'none';
  if (utilityPct <= 10) return 'low';
  if (utilityPct <= 30) return 'medium';
  return 'high';
}

/**
 * Utilidad = (precio de venta - último costo) / último costo, en porcentaje.
 * `null` cuando no hay último costo (producto sin datos comerciales) para no
 * mostrar una utilidad engañosa.
 */
export function getUtilityPct(unitPrice: number, lastCost: number | undefined): number | null {
  if (!lastCost || lastCost <= 0) return null;
  return ((unitPrice - lastCost) / lastCost) * 100;
}

export function getLineGross(item: QuoteItem): number {
  return round2(getUnitPrice(item.product, item.priceTier, item.customPrice) * item.quantity);
}

/**
 * El descuento fijo corresponde al total de la línea, no a cada unidad.
 * Se limita al valor de la línea para que el subtotal nunca sea negativo.
 */
export function getLineDiscount(item: QuoteItem): number {
  const gross = getLineGross(item);
  const fixedDiscount = Number(item.discountAmount);

  if (Number.isFinite(fixedDiscount) && fixedDiscount > 0) {
    return round2(Math.min(gross, fixedDiscount));
  }

  const percentageDiscount = Number(item.discountPct);
  if (Number.isFinite(percentageDiscount) && percentageDiscount > 0) {
    return round2((gross * Math.min(100, percentageDiscount)) / 100);
  }

  return 0;
}

export function getLineTotal(item: QuoteItem): number {
  return round2(Math.max(0, getLineGross(item) - getLineDiscount(item)));
}

/** Total de la línea sin IVA (base imponible). `getLineTotal` ya incluye el IVA. */
export function getLineTotalNet(item: QuoteItem): number {
  return removeIva(getLineTotal(item), item.product?.iva);
}

export interface QuoteTotals {
  /** Subtotal antes de descuentos, sin IVA. */
  grossSubtotal: number;
  /** Descuento total, sin IVA. */
  totalDiscount: number;
  /** Base imponible total (subtotal15 + subtotal0). */
  subtotal: number;
  /** Base imponible de productos con IVA (ya descontado el 15%). */
  subtotal15: number;
  subtotal0: number;
  /** IVA contenido en los precios de los productos con IVA. */
  iva: number;
  total: number;
}

/**
 * Los precios con IVA ya lo incluyen: no se suma otro 15%, se desglosa.
 * El total es la suma de las líneas tal cual; la base se obtiene dividiendo
 * entre 1.15 y el IVA es la diferencia, para que base + IVA cuadre exacto.
 */
export function getQuoteTotals(items: QuoteItem[]): QuoteTotals {
  let gross15 = 0;
  let gross0 = 0;
  let total15 = 0;
  let total0 = 0;

  for (const item of items) {
    const gross = getLineGross(item);
    const lineTotal = getLineTotal(item);

    if (item.product?.iva) {
      gross15 += gross;
      total15 += lineTotal;
    } else {
      gross0 += gross;
      total0 += lineTotal;
    }
  }

  const subtotal15 = removeIva(round2(total15), true);
  const subtotal0 = round2(total0);
  const iva = round2(total15 - subtotal15);
  const subtotal = round2(subtotal15 + subtotal0);
  const total = round2(subtotal + iva);
  const grossSubtotal = round2(removeIva(round2(gross15), true) + gross0);
  const totalDiscount = round2(Math.max(0, grossSubtotal - subtotal));

  return {
    grossSubtotal,
    totalDiscount,
    subtotal,
    subtotal15,
    subtotal0,
    iva,
    total,
  };
}
