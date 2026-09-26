/** Código corto visible de una cotización (ej. "COT-8F3K"), derivado de su id. */
export function getQuoteCode(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, '');
  return `COT-${cleaned.substring(cleaned.length - 4).toUpperCase()}`;
}
