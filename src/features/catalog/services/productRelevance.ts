import type { Product } from '../types';
import { normalizeSearchText } from './productSearchMatcher';

/**
 * Relevancia de productos respecto a una búsqueda. Decide qué consultar a
 * /search y ordena/filtra lo que responde (o la caché sin conexión) para
 * mostrar primero lo más relacionado y ocultar lo que no tiene relación.
 *
 * Lo buscado se divide en:
 * - tipo: qué es el producto ("bomba de fumigar", "motocultor");
 * - calificativos: rasgos del producto ("honda", "estacionaria");
 * - detalle: códigos de modelo/medida y marcas ("ar50", "12hp", "stihl").
 * Un producto está relacionado si es del mismo tipo; los calificativos y el
 * detalle solo ordenan dentro de lo relacionado.
 */

/** Umbral a partir del cual un producto se considera "muy relacionado". */
export const HIGH_RELEVANCE = 0.8;

/** Producto elegido desde las sugerencias: se muestra primero y guía la relación. */
export interface SearchAnchor {
  code: string;
  name: string;
  brand: string;
}

/**
 * Datos del catálogo local usados solo para calcular (nunca para mostrar
 * productos): especificidad de cada palabra, marcas y palabras que suelen ir
 * juntas en los nombres.
 */
export interface RelevanceModel {
  /** Peso por especificidad: "fumigar" (pocos productos) pesa más que "bomba". */
  weigh: (token: string) => number;
  /** Palabras que forman marcas ("husqvarna", "stihl"). */
  isBrand: (token: string) => boolean;
  /** Si dos palabras forman un tipo compuesto en el catálogo ("bomba fumigar"). */
  isCompound: (first: string, second: string) => boolean;
}

export interface RelevanceContext {
  /** Términos escritos/buscados por el vendedor. */
  queries: string[];
  anchor?: SearchAnchor | null;
  model?: RelevanceModel;
}

const STOPWORDS = new Set([
  'a', 'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'lo', 'los', 'para',
  'por', 'sin', 'su', 'un', 'una', 'y', 'o', 'x', 'e',
]);

/** Preposiciones que unen el tipo compuesto: "bomba DE fumigar", "aceite PARA motor". */
const TYPE_CONNECTORS = new Set(['de', 'del', 'para', 'a', 'al']);

/** Veces que dos palabras deben aparecer juntas en el catálogo para formar un tipo. */
const MIN_COMPOUND_OCCURRENCES = 2;

// Peso relativo por rol en lo escrito.
const QUERY_DETAIL_FACTOR = 0.25;
const QUERY_BRAND_FACTOR = 0.4;

// Con un producto elegido, calificativos, marca y modelo solo desempatan
// entre productos del mismo tipo (no bajan a otra bomba de fumigar por ser
// de otra marca).
const ANCHOR_DETAIL_BONUS = 0.05;

// Para estar relacionado con un tipo compuesto, un producto debe coincidir
// con su palabra más específica ("fumigar"), o con la principal ("bomba")
// cubriendo al menos esta parte del tipo: así "BOMBA DE ACEITE" no se cuela
// en "bomba de fumigar", pero "FUMIGADORA" sí.
const HEAD_MATCH_MIN_COVERAGE = 0.5;

// Coincidir solo por la marca relaciona, pero por debajo de coincidir en el
// nombre. Nunca por prefijo: "bomba" no debe atrapar la marca "VARIOS BOMBAS".
const BRAND_MATCH_STRENGTH = 0.7;

// Posición del tipo dentro del nombre: en los nombres del catálogo la primera
// palabra dice qué es el producto ("MOTOCULTOR HONDA…"). Solo los que empiezan
// con lo buscado quedan en el grupo de ≥ 80 %; si aparece más adelante es un
// afín ("CUCHILLAS DE MOTOCULTOR"), y después de "PARA" un accesorio o
// repuesto ("ACEITE PARA MOTOCULTOR").
const LEADING_PROMINENCE = 1;
const EARLY_PROMINENCE = 0.75;
const LATE_PROMINENCE = 0.7;
const ACCESSORY_PROMINENCE = 0.6;
const EARLY_WORD_LIMIT = 2;
const ACCESSORY_MARKERS = new Set([
  'para', 'p', 'repuesto', 'repuestos', 'accesorio', 'accesorios', 'kit', 'juego',
]);

/** Máximo de consultas en paralelo a /search por búsqueda. */
const MAX_SEARCH_QUERIES = 4;

type TokenRole = 'type' | 'qualifier' | 'detail';

interface WeightedToken {
  text: string;
  weight: number;
  role: TokenRole;
}

interface ProductTerms {
  /** Palabras significativas del nombre. */
  words: string[];
  /** Palabras del nombre en orden, incluidas preposiciones (para ubicar lo buscado). */
  nameWords: string[];
  brandWords: string[];
  /** Nombre y código normalizados (sin la marca). */
  nameAndCode: string;
}

function hasDigit(token: string): boolean {
  return /\d/.test(token);
}

/** Códigos de modelo, medidas o abreviaturas: "ar50", "12hp", "trl". */
function isModelToken(token: string): boolean {
  return hasDigit(token) || token.length <= 3;
}

function cleanWord(word: string): string {
  return word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}

/** Palabras en orden, incluidas preposiciones. */
function splitWords(value: string): string[] {
  return normalizeSearchText(value).split(/\s+/).map(cleanWord).filter(Boolean);
}

/** Palabras significativas (sin preposiciones/artículos). */
function tokenize(value: string): string[] {
  return normalizeSearchText(value)
    .split(/[^a-z0-9\-/.]+/)
    .map((token) => token.replace(/^[-/.]+|[-/.]+$/g, ''))
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

const NEUTRAL_MODEL: RelevanceModel = {
  weigh: () => 1,
  isBrand: () => false,
  isCompound: () => false,
};

/**
 * Tipo de producto en un texto: la primera palabra descriptiva y las que se
 * le unen por preposición ("bomba de fumigar") o porque el catálogo las usa
 * juntas ("bomba fumigar"). Se detiene en códigos, marcas o calificativos.
 */
function typeWords(text: string, model: RelevanceModel): Set<string> {
  const words = splitWords(text);
  const type = new Set<string>();

  let index = words.findIndex(
    (word) => !STOPWORDS.has(word) && !isModelToken(word) && !model.isBrand(word)
  );
  if (index === -1) return type;

  let previous = words[index];
  type.add(previous);
  let connected = false;

  for (index += 1; index < words.length; index++) {
    const word = words[index];
    if (TYPE_CONNECTORS.has(word)) {
      connected = true;
      continue;
    }
    if (STOPWORDS.has(word) || isModelToken(word) || model.isBrand(word)) break;
    if (!connected && !model.isCompound(previous, word)) break;
    type.add(word);
    previous = word;
    connected = false;
  }

  return type;
}

function uniqueTokens(tokens: WeightedToken[]): WeightedToken[] {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    if (seen.has(token.text)) return false;
    seen.add(token.text);
    return true;
  });
}

function referenceTokens(text: string, model: RelevanceModel): WeightedToken[] {
  const type = typeWords(text, model);
  return uniqueTokens(
    tokenize(text).map((token) => {
      if (type.has(token)) return { text: token, weight: model.weigh(token), role: 'type' };
      if (isModelToken(token)) {
        return { text: token, weight: model.weigh(token) * QUERY_DETAIL_FACTOR, role: 'detail' };
      }
      if (model.isBrand(token)) {
        return { text: token, weight: model.weigh(token) * QUERY_BRAND_FACTOR, role: 'detail' };
      }
      return { text: token, weight: model.weigh(token), role: 'qualifier' };
    })
  );
}

function productTerms(product: Product): ProductTerms {
  return {
    words: tokenize(product.name),
    nameWords: splitWords(product.name),
    brandWords: tokenize(product.brand ?? ''),
    nameAndCode: `${normalizeSearchText(product.name)} ${normalizeSearchText(product.code).trim()}`,
  };
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i++;
  return i;
}

/**
 * Coincidencia entre una palabra y un término (0 a 1). Tolera plurales y
 * derivados: "fumigar" encuentra "fumigadora" por su raíz común.
 */
function wordStrength(word: string, token: string): number {
  if (word === token) return 1;
  if (isModelToken(token)) return 0;
  const shorter = Math.min(word.length, token.length);
  if (shorter >= 4 && (word.startsWith(token) || token.startsWith(word))) return 0.9;
  if (commonPrefixLength(word, token) >= 5) return 0.8;
  return 0;
}

/** Qué tan bien aparece un término en el producto y si fue solo por la marca. */
function tokenStrength(token: string, terms: ProductTerms): { strength: number; viaBrand: boolean } {
  if (hasDigit(token)) {
    return { strength: terms.nameAndCode.includes(token) ? 1 : 0, viaBrand: false };
  }

  let best = 0;
  for (const word of terms.words) {
    best = Math.max(best, wordStrength(word, token));
    if (best === 1) return { strength: 1, viaBrand: false };
  }

  if (best === 0 && token.length >= 4 && terms.nameAndCode.includes(token)) {
    best = 0.7;
  }

  if (best < BRAND_MATCH_STRENGTH && terms.brandWords.includes(token)) {
    return { strength: BRAND_MATCH_STRENGTH, viaBrand: true };
  }
  return { strength: best, viaBrand: false };
}

/**
 * Posición del tipo buscado dentro del nombre. `leading`: el nombre empieza
 * con él, el producto *es* lo buscado. `factor` (0 a 1) baja si aparece más
 * adelante, y más aún después de "PARA"/"KIT"/"REPUESTO" (accesorio).
 */
function typePosition(tokens: WeightedToken[], terms: ProductTerms): { factor: number; leading: boolean } {
  let earliest = -1;
  for (const token of tokens) {
    if (token.role !== 'type') continue;
    const index = terms.nameWords.findIndex((word) => wordStrength(word, token.text) >= 0.8);
    if (index !== -1 && (earliest === -1 || index < earliest)) earliest = index;
  }

  // Solo coinciden calificativos/marca/código (o nada): la posición no aplica.
  if (earliest === -1) return { factor: LEADING_PROMINENCE, leading: false };
  if (earliest === 0) return { factor: LEADING_PROMINENCE, leading: true };
  if (terms.nameWords.slice(0, earliest).some((word) => ACCESSORY_MARKERS.has(word))) {
    return { factor: ACCESSORY_PROMINENCE, leading: false };
  }
  return { factor: earliest <= EARLY_WORD_LIMIT ? EARLY_PROMINENCE : LATE_PROMINENCE, leading: false };
}

interface Score {
  value: number;
  /** Es del mismo tipo que lo buscado (o coincide con lo único escrito). */
  related: boolean;
  /** Su nombre empieza con el tipo buscado: es el producto, no un afín. */
  leading: boolean;
}

/**
 * Relación (0 a 1) contra un texto de referencia. Para lo escrito cuentan
 * todos los términos; para el producto elegido (`typeOnly`) cuenta el tipo y
 * el resto suma apenas como desempate.
 */
function scoreAgainst(tokens: WeightedToken[], terms: ProductTerms, typeOnly: boolean): Score {
  let matched = 0;
  let total = 0;
  let detailMatched = 0;
  let detailTotal = 0;

  const typeTokens = tokens.filter((token) => token.role === 'type');
  const head = typeTokens[0];
  const mostSpecific = typeTokens.reduce<WeightedToken | undefined>(
    (best, token) => (!best || token.weight > best.weight ? token : best),
    undefined
  );
  let typeMatched = 0;
  let typeTotal = 0;
  let headMatch = false;
  let specificMatch = false;

  for (const token of tokens) {
    const { strength, viaBrand } = tokenStrength(token.text, terms);

    if (token.role === 'type') {
      const inName = viaBrand ? 0 : strength;
      typeMatched += inName * token.weight;
      typeTotal += token.weight;
      if (inName >= 0.8 && token === head) headMatch = true;
      if (inName >= 0.8 && token === mostSpecific) specificMatch = true;
    }

    if (typeOnly && token.role !== 'type') {
      detailMatched += strength * token.weight;
      detailTotal += token.weight;
    } else {
      matched += strength * token.weight;
      total += token.weight;
    }
  }

  const typeCoverage = typeTotal > 0 ? typeMatched / typeTotal : 0;
  const sameType =
    typeTotal === 0 || specificMatch || (headMatch && typeCoverage >= HEAD_MATCH_MIN_COVERAGE);

  if (total === 0) {
    // Sin tipo (p. ej. solo un código): cuenta el detalle.
    const value = detailTotal > 0 ? detailMatched / detailTotal : 0;
    return { value, related: value > 0, leading: false };
  }

  const coverage = matched / total;
  const bonus =
    detailTotal > 0 && coverage > 0 ? (detailMatched / detailTotal) * ANCHOR_DETAIL_BONUS : 0;
  const position = typePosition(tokens, terms);
  const value = Math.min(1, coverage * position.factor + bonus);
  const related = value > 0 && (sameType || value >= HIGH_RELEVANCE);
  return { value, related, leading: related && sameType && position.leading };
}

/** Construye el modelo de relevancia a partir del catálogo local. */
export function createRelevanceModel(products: Product[]): RelevanceModel {
  if (products.length === 0) return NEUTRAL_MODEL;

  const wordCounts = new Map<string, number>();
  const pairCounts = new Map<string, number>();
  const brands = new Set<string>();

  for (const product of products) {
    const words = tokenize(product.name);
    for (const word of new Set(words)) {
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
    }
    for (let i = 0; i < words.length - 1; i++) {
      const key = `${words[i]} ${words[i + 1]}`;
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }
    for (const token of tokenize(product.brand ?? '')) {
      if (!isModelToken(token)) brands.add(token);
    }
  }

  const total = products.length;
  const weights = new Map<string, number>();

  return {
    weigh(token) {
      const cached = weights.get(token);
      if (cached != null) return cached;

      let frequency = 0;
      for (const [word, count] of wordCounts) {
        const matches = hasDigit(token) ? word.includes(token) : wordStrength(word, token) >= 0.8;
        if (matches) frequency += count;
      }
      const weight = Math.log((total + 1) / (Math.min(frequency, total) + 1)) + 1;
      weights.set(token, weight);
      return weight;
    },
    isBrand: (token) => brands.has(token),
    isCompound: (first, second) =>
      (pairCounts.get(`${first} ${second}`) ?? 0) >= MIN_COMPOUND_OCCURRENCES,
  };
}

/**
 * Consultas a /search para una búsqueda: lo escrito, su versión sin códigos
 * de modelo ("bomba de fumigar ar50" → "bomba de fumigar") y su palabra más
 * específica ("fumigar"). El backend busca por frase y completa con palabras
 * sueltas en orden alfabético, así que sin las dos últimas quedan fuera
 * productos hermanos ("BOMBA FUMIGAR AR30"). Con un producto elegido, `term`
 * es su nombre e `intent` lo que se había escrito.
 */
export function planSearchQueries(term: string, intent = ''): string[] {
  const queries = [term, intent];
  const base = (intent || term).trim();

  const core = base
    .split(/\s+/)
    .filter((word) => !hasDigit(word))
    .join(' ')
    .trim();
  if (core) queries.push(core);

  const descriptive = tokenize(base).filter((token) => !isModelToken(token));
  if (descriptive.length >= 2) {
    queries.push(descriptive.reduce((longest, token) => (token.length > longest.length ? token : longest)));
  }

  const seen = new Set<string>();
  return queries
    .map((query) => query.trim())
    .filter((query) => {
      const key = normalizeSearchText(query);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_SEARCH_QUERIES);
}

function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}

/**
 * Relevancia (0 a 1) de un producto respecto a la búsqueda: el mejor puntaje
 * entre lo escrito y el producto elegido. `related` indica si es del mismo
 * tipo o afín a lo buscado (no basta compartir marca, código o una palabra
 * genérica como "bomba").
 */
export function scoreProductRelevance(
  product: Product,
  context: RelevanceContext
): { score: number; related: boolean; leading: boolean } {
  const model = context.model ?? NEUTRAL_MODEL;
  const terms = productTerms(product);
  const references: { tokens: WeightedToken[]; typeOnly: boolean }[] = context.queries
    .map((query) => ({ tokens: referenceTokens(query, model), typeOnly: false }))
    .filter((reference) => reference.tokens.length > 0);
  if (context.anchor) {
    references.push({ tokens: referenceTokens(context.anchor.name, model), typeOnly: true });
  }

  let score = 0;
  let related = false;
  let leading = false;
  for (const { tokens, typeOnly } of references) {
    const result = scoreAgainst(tokens, terms, typeOnly);
    score = Math.max(score, result.value);
    if (result.related) related = true;
    if (result.leading) leading = true;
  }

  return { score, related, leading };
}

/**
 * Ordena por relación con la búsqueda, en grupos:
 * 1. el producto elegido desde las sugerencias;
 * 2. los que *son* lo buscado (su nombre empieza con el tipo: "MOTOCULTOR …");
 * 3. los afines (accesorios, repuestos, "CUCHILLAS DE MOTOCULTOR").
 * Dentro de cada grupo, por puntaje; entre iguales, el orden del API. Los que
 * no tienen relación se descartan. Si ninguno resulta relacionado, se
 * devuelve la lista tal cual: el backend pudo encontrarlos por campos que
 * aquí no se ven.
 */
export function rankRelatedProducts(products: Product[], context: RelevanceContext): Product[] {
  if (products.length === 0) return products;

  const anchorCode = context.anchor ? normalizeCode(context.anchor.code) : null;

  const scored = products.map((product, index) => {
    const isAnchor = anchorCode != null && normalizeCode(product.code) === anchorCode;
    const { score, related, leading } = scoreProductRelevance(product, context);
    const group = isAnchor ? 0 : leading ? 1 : 2;
    return { product, index, score, group, related: isAnchor || related };
  });

  const related = scored.filter((entry) => entry.related);
  if (related.length === 0) return products;

  return related
    .sort((a, b) => a.group - b.group || b.score - a.score || a.index - b.index)
    .map((entry) => entry.product);
}
