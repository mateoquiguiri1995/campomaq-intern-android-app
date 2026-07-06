/**
 * Formatea un valor numérico como moneda (USD, Ecuador).
 * Ejemplo: formatCurrency(1250.5) -> "$1.250,50"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
