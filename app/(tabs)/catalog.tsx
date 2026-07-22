import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/common/AppHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { BrandSelect } from '@/features/catalog/components/BrandSelect';
import { CategoryChip } from '@/features/catalog/components/CategoryChip';
import { ProductList } from '@/features/catalog/components/ProductList';
import { useCatalog } from '@/features/catalog/hooks/useCatalog';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/** Pestaña Catálogo. */
export default function CatalogScreen() {
  const router = useRouter();

  const {
    products,
    loading,
    searchLoading,
    error,
    hasProducts,

    search,
    setSearch,

    categories,
    selectedCategory,
    setSelectedCategory,

    brands,
    selectedBrand,
    setSelectedBrand,

    hasMore,
    loadMore,

    hasActiveFilters,
    resetFilters,
  } = useCatalog();

  // No hay endpoint GET /products/:id en el backend, así que el
  // producto viaja completo (ya está en memoria desde la lista).
  function handleOpenProduct(product: Product) {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id, data: JSON.stringify(product) },
    });
  }

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader title="Catálogo" subtitle="Productos, precios y stock" />

        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryDark} />

          <Text style={styles.message}>
            Cargando catálogo...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="Catálogo" subtitle="Productos, precios y stock" />

        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            No pudimos cargar el catálogo
          </Text>

          <Text style={styles.message}>
            {error}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Catálogo realmente vacío (no hay productos en el backend, sin
  // importar la búsqueda o los filtros).
  if (!hasProducts) {
    return (
      <ScreenContainer>
        <AppHeader title="Catálogo" subtitle="Productos, precios y stock" />

        <View style={styles.center}>
          <Text style={styles.message}>
            No existen productos disponibles.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <AppHeader title="Catálogo" subtitle="Productos, precios y stock" />

      <View style={styles.searchRow}>
        {searchLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.gray}
            style={styles.searchIcon}
          />
        ) : (
          <Ionicons
            name="search"
            size={18}
            color={colors.gray}
            style={styles.searchIcon}
          />
        )}

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto, código..."
          placeholderTextColor={colors.gray}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <TouchableOpacity
            style={styles.clearIcon}
            onPress={() => setSearch('')}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              selected={category === selectedCategory}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>

        <BrandSelect
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
        />
      </View>

      <ProductList
        products={products}
        hasMore={hasMore}
        onLoadMore={loadMore}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={resetFilters}
        onPressProduct={handleOpenProduct}
        searching={searchLoading}
      />
    </ScreenContainer>
  );
}

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 2,
};

const styles = StyleSheet.create({
  searchRow: {
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm + spacing.xs,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.xl + spacing.xs,
    paddingRight: spacing.xl,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: 15,
    color: colors.black,
    ...shadow,
  },
  clearIcon: {
    position: 'absolute',
    right: spacing.sm + spacing.xs,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chipsScroll: {
    flex: 1,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.grayDark,
  },
  errorTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#D32F2F',
  },
});
