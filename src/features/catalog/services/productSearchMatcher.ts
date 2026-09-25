import type { Product } from '../types';

/**
 * Coincidencias de texto sobre el catálogo en caché. Solo se usa para las
 * sugerencias del buscador y para el resultado local provisional/offline:
 * nunca toca ni reordena la respuesta de /search.
 */

/** Minúsculas y sin tildes, para que "electrica" encuentre "ELÉCTRICA". */
export function normalizeSearchText(value: string | null | undefined): string {
  const lower = String(value ?? '').toLowerCase();
  try {
    return lower.normalize('NFD').replace(/[̀-ͯ]/g, '');
  } catch {
    return lower;
  }
}

/** Divide la entrada en palabras: todas deben aparecer (en cualquier orden). */
export function tokenizeSearchQuery(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

export interface IndexedProduct {
  product: Product;
  name: string;
  code: string;
  haystack: string;
}

/** Precalcula el texto normalizado de cada producto (se hace una vez por catálogo). */
export function indexProducts(products: Product[]): IndexedProduct[] {
  return products.map((product) => {
    const name = normalizeSearchText(product.name);
    const code = normalizeSearchText(product.code);
    return {
      product,
      name,
      code,
      haystack: `${name} ${code} ${normalizeSearchText(product.brand)}`,
    };
  });
}

function matchesTokens(entry: IndexedProduct, tokens: string[]): boolean {
  return tokens.every((token) => entry.haystack.includes(token));
}

/**
 * Productos de la caché que coinciden con la búsqueda, en el mismo orden
 * del catálogo (sin reordenar).
 */
export function filterIndexedProducts(index: IndexedProduct[], query: string): Product[] {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return [];
  return index.filter((entry) => matchesTokens(entry, tokens)).map((entry) => entry.product);
}

/**
 * Sugerencias de autocompletado: prioriza código o nombre que empiezan con
 * lo escrito, luego palabras del nombre que empiezan con lo escrito y por
 * último coincidencias parciales. Entre iguales se conserva el orden de caché.
 */
export function suggestIndexedProducts(
  index: IndexedProduct[],
  query: string,
  limit: number
): Product[] {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return [];

  const phrase = tokens.join(' ');
  const first = tokens[0];
  const buckets: Product[][] = [[], [], []];

  for (const entry of index) {
    if (!matchesTokens(entry, tokens)) continue;

    if (entry.code.startsWith(phrase) || entry.name.startsWith(phrase)) {
      buckets[0].push(entry.product);
      // Con suficientes coincidencias fuertes no hace falta seguir recorriendo.
      if (buckets[0].length >= limit) break;
    } else if (entry.name.split(/\s+/).some((word) => word.startsWith(first))) {
      buckets[1].push(entry.product);
    } else {
      buckets[2].push(entry.product);
    }
  }

  return buckets.flat().slice(0, limit);
}
