import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { Client } from '../types';
import { ClientCard } from './ClientCard';

interface ClientListProps {
  clients: Client[];
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onPressClient?: (client: Client) => void;
}

export function ClientList({
  clients,
  onLoadMore,
  hasMore,
  loadingMore,
  hasActiveFilters,
  onClearFilters,
  onPressClient,
}: ClientListProps) {
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={clients}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onPressClient?.(item)}>
          <ClientCard client={item} />
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={() => {
        if (hasMore) onLoadMore();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? <Text style={styles.footer}>Cargando más clientes...</Text> : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {hasActiveFilters
              ? 'No encontramos clientes con esa búsqueda.'
              : 'No se encontraron clientes.'}
          </Text>

          {hasActiveFilters && onClearFilters && (
            <TouchableOpacity style={styles.clearButton} activeOpacity={0.7} onPress={onClearFilters}>
              <Text style={styles.clearButtonText}>Limpiar búsqueda</Text>
            </TouchableOpacity>
          )}
        </View>
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
