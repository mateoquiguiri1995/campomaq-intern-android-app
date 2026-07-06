import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { CategoryChip } from '@/features/catalog/components/CategoryChip';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { CATEGORIES, getProducts } from '@/features/catalog/services/productService';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

/**
 * Pestaña Catálogo.
 *
 * TODO(Fase 2): conectar al backend API real (productService).
 * TODO(Fase 2): búsqueda real por nombre y código (hoy el input no filtra).
 * TODO(Fase 2): filtrado real por categoría (hoy los chips son solo visuales).
 * TODO(Fase 2): pantalla de detalle de producto.
 * TODO(Fase 2): mostrar precios A/B/C en el detalle.
 */
export default function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    // En la Fase 2 esto llamará al backend y necesitará estados de
    // carga y error. Con mocks, resuelve al instante.
    getProducts().then(setProducts);
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title="Catálogo" subtitle="Productos, precios y stock" />

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar producto, código..."
        placeholderTextColor={colors.gray}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CATEGORIES.map((category) => (
          <CategoryChip
            key={category}
            label={category}
            selected={category === selectedCategory}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
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
  chipsRow: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
});
