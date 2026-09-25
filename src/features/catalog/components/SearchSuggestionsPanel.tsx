import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/theme/colors';

import { normalizeSearchText, tokenizeSearchQuery } from '../services/productSearchMatcher';
import type { Product } from '../types';

const MAX_MATCHING_RECENTS = 3;

interface SearchSuggestionsPanelProps {
  /** Distancia desde el borde superior del contenedor hasta debajo de la barra. */
  top: number;
  /** Texto que el vendedor está escribiendo. */
  query: string;
  suggestions: Product[];
  recentSearches: string[];
  isOffline?: boolean;
  onSubmitQuery: () => void;
  onSelectSuggestion: (product: Product) => void;
  onSelectRecent: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecents: () => void;
  onDismiss: () => void;
}

/**
 * Panel desplegable del buscador de productos: búsquedas recientes cuando el
 * campo está vacío y, mientras se escribe, autocompletado con productos de la
 * caché local. Elegir una opción confirma la búsqueda (que luego resuelve
 * /search); el panel en sí nunca modifica el listado.
 */
export function SearchSuggestionsPanel({
  top,
  query,
  suggestions,
  recentSearches,
  isOffline = false,
  onSubmitQuery,
  onSelectSuggestion,
  onSelectRecent,
  onRemoveRecent,
  onClearRecents,
  onDismiss,
}: SearchSuggestionsPanelProps) {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  if (!hasQuery && recentSearches.length === 0) return null;

  const normalizedQuery = normalizeSearchText(trimmedQuery);
  const matchingRecents = hasQuery
    ? recentSearches
        .filter((term) => {
          const normalized = normalizeSearchText(term);
          return normalized !== normalizedQuery && normalized.includes(normalizedQuery);
        })
        .slice(0, MAX_MATCHING_RECENTS)
    : recentSearches;

  return (
    <View style={[styles.overlay, { top }]}>
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sugerencias"
      />

      <View style={styles.card}>
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          {!hasQuery ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
              <TouchableOpacity onPress={onClearRecents} hitSlop={8} activeOpacity={0.7}>
                <Text style={styles.sectionAction}>Borrar todo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.row} onPress={onSubmitQuery} activeOpacity={0.7}>
              <View style={[styles.rowIcon, styles.rowIconPrimary]}>
                <Ionicons name="search" size={16} color={colors.onPrimary} />
              </View>
              <Text style={styles.submitText} numberOfLines={1}>
                Buscar <Text style={styles.submitQuery}>“{trimmedQuery}”</Text>
              </Text>
              <Ionicons name="return-down-back" size={18} color={colors.gray} />
            </TouchableOpacity>
          )}

          {matchingRecents.map((term) => (
            <TouchableOpacity
              key={`recent-${term}`}
              style={styles.row}
              onPress={() => onSelectRecent(term)}
              activeOpacity={0.7}
            >
              <View style={styles.rowIcon}>
                <Ionicons name="time-outline" size={17} color={colors.grayDark} />
              </View>
              <Text style={styles.recentText} numberOfLines={1}>
                {term}
              </Text>
              <TouchableOpacity
                onPress={() => onRemoveRecent(term)}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityLabel={`Quitar ${term} de recientes`}
              >
                <Ionicons name="close" size={17} color={colors.gray} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {hasQuery && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Productos sugeridos</Text>
                {isOffline && (
                  <View style={styles.offlineTag}>
                    <Ionicons name="cloud-offline-outline" size={12} color={colors.grayDark} />
                    <Text style={styles.offlineTagText}>Sin conexión</Text>
                  </View>
                )}
              </View>

              {suggestions.length === 0 ? (
                <Text style={styles.emptyText}>
                  {isOffline
                    ? 'No hay coincidencias en los productos guardados en el dispositivo.'
                    : 'Sin coincidencias en los productos guardados. Presiona Buscar para consultar el catálogo.'}
                </Text>
              ) : (
                suggestions.map((product) => (
                  <TouchableOpacity
                    key={`product-${product.code}`}
                    style={styles.row}
                    onPress={() => onSelectSuggestion(product)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.thumb}>
                      {product.imageUrl ? (
                        <Image
                          source={{ uri: product.imageUrl }}
                          style={styles.thumbImage}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <Ionicons name="cube-outline" size={18} color={colors.gray} />
                      )}
                    </View>
                    <View style={styles.productText}>
                      <HighlightedText text={product.name} query={trimmedQuery} />
                      <Text style={styles.productMeta} numberOfLines={1}>
                        {product.code}
                        {product.brand ? ` · ${product.brand}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

/** Resalta la primera palabra buscada dentro del nombre del producto. */
function HighlightedText({ text, query }: { text: string; query: string }) {
  const token = tokenizeSearchQuery(query)[0];
  // La normalización quita tildes sin cambiar la longitud de caracteres
  // precompuestos, así que el índice sirve sobre el texto original.
  const start = token ? normalizeSearchText(text).indexOf(token) : -1;

  if (start < 0 || start + token.length > text.length) {
    return (
      <Text style={styles.productName} numberOfLines={1}>
        {text}
      </Text>
    );
  }

  const end = start + token.length;
  return (
    <Text style={styles.productName} numberOfLines={1}>
      {text.slice(0, start)}
      <Text style={styles.productNameMatch}>{text.slice(start, end)}</Text>
      {text.slice(end)}
    </Text>
  );
}

import { styles } from '@/theme/styles/src_features_catalog_components_SearchSuggestionsPanel';
