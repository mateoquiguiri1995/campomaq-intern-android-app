import { colors } from '../theme/colors';

/**
 * Devuelve la etiqueta de stock según la cantidad disponible.
 * El stock real se actualiza cada 10 minutos en el backend.
 */
export function getStockLabel(stockQty?: number | null): string {
  if (stockQty === null || stockQty === undefined) return 'Consultar stock';
  if (stockQty <= 0) return 'Sin stock';
  if (stockQty <= 5) return 'Stock bajo';
  return 'Disponible';
}

/**
 * Color asociado al estado de stock (para mostrar en las tarjetas).
 */
export function getStockColor(stockQty?: number | null): string {
  if (stockQty === null || stockQty === undefined) return colors.gray;
  if (stockQty <= 0) return colors.danger;
  if (stockQty <= 5) return colors.warning;
  return colors.success;
}
