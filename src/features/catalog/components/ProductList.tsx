import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];

  onLoadMore: () => void;

  hasMore: boolean;

  /** Si hay una búsqueda o filtro activo, permite limpiarlo desde el estado vacío. */
  hasActiveFilters?: boolean;

  onClearFilters?: () => void;

  onPressProduct?: (product: Product) => void;

  /** Búsqueda en curso: evita mostrar "sin resultados" mientras aún no llega la respuesta. */
  searching?: boolean;
}

export function ProductList({
  products,
  onLoadMore,
  hasMore,
  hasActiveFilters,
  onClearFilters,
  onPressProduct,
  searching,
}: ProductListProps) {
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={products}
      keyExtractor={(item) => item.id}

      renderItem={({ item }) => (
        <ProductCard product={item} onPressDetails={onPressProduct} />
      )}

      ItemSeparatorComponent={() => (
        <View style={styles.separator} />
      )}

      onEndReached={() => {
        if (hasMore) {
          onLoadMore();
        }
      }}

      onEndReachedThreshold={0.5}

      ListFooterComponent={
        hasMore ? (
          <Text style={styles.footer}>
            Cargando más productos...
          </Text>
        ) : (
          <Text style={styles.footer}>
            Has llegado al final del catálogo.
          </Text>
        )
      }

      ListEmptyComponent={
        searching ? (
          <View style={styles.empty}>
            <ActivityIndicator color={colors.primaryDark} />

            <Text style={styles.emptyText}>
              Buscando productos...
            </Text>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? 'No encontramos productos con esa búsqueda o filtro.'
                : 'No se encontraron productos.'}
            </Text>

            {hasActiveFilters && onClearFilters && (
              <TouchableOpacity
                style={styles.clearButton}
                activeOpacity={0.7}
                onPress={onClearFilters}
              >
                <Text style={styles.clearButtonText}>
                  Limpiar búsqueda y filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      }

      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: spacing.md,
  },

  separator: {
    height: spacing.md,
  },

  footer: {
    textAlign: 'center',
    color: colors.grayDark,
    paddingVertical: spacing.lg,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  emptyText: {
    color: colors.grayDark,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  clearButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },

  clearButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});