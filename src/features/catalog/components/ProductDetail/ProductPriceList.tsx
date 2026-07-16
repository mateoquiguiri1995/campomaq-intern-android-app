import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';

import type { Product } from '../../types';

interface ProductPriceListProps {
  product: Product;
}

const TIERS: {
  key: 'priceA' | 'priceB' | 'priceC';
  label: string;
  hint: string;
}[] = [
  { key: 'priceA', label: 'Contado', hint: 'Precio de contado' },
  { key: 'priceB', label: 'Tarjeta', hint: 'Precio con tarjeta' },
  { key: 'priceC', label: 'Crédito', hint: 'Precio a crédito' },
];

/** Lista de precios A/B/C del producto. */
export function ProductPriceList({ product }: ProductPriceListProps) {
  return (
    <View style={styles.container}>
      {TIERS.map(({ key, label, hint }, index) => (
        <View
          key={key}
          style={[styles.row, index === 0 && styles.rowFirst]}
        >
          <View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.hint}>{hint}</Text>
          </View>

          <Text style={styles.price}>{formatCurrency(product[key])}</Text>
        </View>
      ))}

      {product.marginPct != null && (
        <View style={styles.marginRow}>
          <Text style={styles.marginText}>
            Margen: {product.marginPct}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  rowFirst: {
    borderTopWidth: 0,
  },

  label: {
    ...typography.body,
    color: colors.black,
    fontWeight: '600',
  },

  hint: {
    ...typography.caption,
    color: colors.gray,
  },

  price: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },

  marginRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },

  marginText: {
    ...typography.caption,
    color: colors.grayDark,
  },
});
