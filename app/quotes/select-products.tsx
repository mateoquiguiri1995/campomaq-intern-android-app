import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ProductList } from '@/features/catalog/components/ProductList';
import { useCatalog } from '@/features/catalog/hooks/useCatalog';
import type { Product } from '@/features/catalog/types';
import { QuoteItemEditorModal } from '@/features/quotes/components/QuoteItemEditorModal';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { getQuoteTotals } from '@/features/quotes/services/quoteCalculations';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';

/** Paso 2 del flujo de cotización: elegir productos del catálogo y añadirlos. */
export default function SelectProductsScreen() {
  const router = useRouter();
  const { items, addItem } = useQuoteBuilder();

  const {
    products,
    loading,
    searchLoading,
    search,
    setSearch,
    hasMore,
    loadMore,
    hasActiveFilters,
    resetFilters,
  } = useCatalog();

  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);

  const currentItem = pickerProduct ? items.find((item) => item.product.id === pickerProduct.id) : undefined;
  const { total } = getQuoteTotals(items);

  return (
    <ScreenContainer scroll={false}>
      <Stack.Screen options={{ title: 'Elegir productos', headerBackTitle: 'Cliente' }} />

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar producto por nombre o código..."
        placeholderTextColor={colors.gray}
        value={search}
        onChangeText={setSearch}
      />

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      )}

      {!loading && (
        <ProductList
          products={products}
          onLoadMore={loadMore}
          hasMore={hasMore}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={resetFilters}
          onPressProduct={setPickerProduct}
          searching={searchLoading}
        />
      )}

      {items.length > 0 && (
        <View style={styles.summaryBar}>
          <View>
            <Text style={styles.summaryCount}>{items.length} producto(s) añadido(s)</Text>
            <Text style={styles.summaryTotal}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.summaryButton}>
            <Button label="Ver cotización" onPress={() => router.push('/quotes/summary')} />
          </View>
        </View>
      )}

      <QuoteItemEditorModal
        visible={!!pickerProduct}
        product={pickerProduct}
        initial={currentItem}
        onCancel={() => setPickerProduct(null)}
        onConfirm={(values) => {
          if (pickerProduct) addItem(pickerProduct, values);
          setPickerProduct(null);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: 15,
    color: colors.black,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryCount: {
    ...typography.caption,
    color: colors.grayDark,
  },
  summaryTotal: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  summaryButton: {
    minWidth: 160,
  },
});
