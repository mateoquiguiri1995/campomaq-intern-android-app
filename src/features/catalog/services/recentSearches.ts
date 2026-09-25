import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'campomaq:search:recent_products:v1';
const MAX_RECENT_SEARCHES = 8;

/**
 * Búsquedas recientes de productos guardadas en el dispositivo. Se mantienen
 * en memoria y se comparten entre pantallas (catálogo y selección de productos
 * de una cotización), así lo buscado en una aparece de inmediato en la otra.
 */
let recentSearches: string[] = [];
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches)).catch((error) => {
    console.warn('[Cache] Error guardando búsquedas recientes:', error);
  });
}

function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(RECENT_SEARCHES_KEY)
      .then((raw) => {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return;
        const stored = parsed.filter((item): item is string => typeof item === 'string');
        // Si ya se guardó algo antes de terminar de leer el disco, va primero.
        recentSearches = mergeUnique([...recentSearches, ...stored]);
        emit();
      })
      .catch(() => {
        // Sin historial legible: se empieza vacío.
      });
  }
}

function mergeUnique(terms: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const term of terms) {
    const key = term.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(term.trim());
  }
  return result.slice(0, MAX_RECENT_SEARCHES);
}

export function subscribeRecentSearches(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRecentSearches(): string[] {
  return recentSearches;
}

/** Agrega (o sube al principio) un término buscado. */
export function addRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  recentSearches = mergeUnique([trimmed, ...recentSearches]);
  emit();
  persist();
}

export function removeRecentSearch(term: string) {
  const key = term.trim().toLowerCase();
  recentSearches = recentSearches.filter((item) => item.toLowerCase() !== key);
  emit();
  persist();
}

export function clearRecentSearches() {
  recentSearches = [];
  emit();
  persist();
}
