import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';
import { getStockColor, getStockLabel } from '@/utils/stock';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

/**
 * Tarjeta de producto del catálogo.
 *
 * TODO(Fase 2): al tocar la tarjeta, navegar a la pantalla de detalle
 *   del producto (precios A/B/C, imagen, stock actualizado).
 * TODO(Fase 2): cargar la imagen del producto desde imageUrl.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.code}>{product.code}</Text>
        <View style={[styles.stockBadge, { backgroundColor: getStockColor(product.stockQty) }]}>
          <Text style={styles.stockText}>
            {getStockLabel(product.stockQty)} · {product.stockQty}
          </Text>
        </View>
      </View>

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>
        {product.category} · {product.brand}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.price}>{formatCurrency(product.mainPrice)}</Text>
        {product.marginPct !== undefined ? (
          <Text style={styles.margin}>Margen {product.marginPct}%</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    ...typography.caption,
    color: colors.gray,
    fontWeight: '600',
  },
  stockBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  stockText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  name: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '600',
  },
  category: {
    ...typography.caption,
    color: colors.grayDark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  margin: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
