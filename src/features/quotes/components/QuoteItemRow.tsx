import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';

import { getLineTotal, getUnitPrice } from '../services/quoteCalculations';
import type { QuoteItem } from '../types';

const TIER_LABELS: Record<QuoteItem['priceTier'], string> = {
  A: 'Contado',
  B: 'Tarjeta',
  C: 'Crédito',
};

interface QuoteItemRowProps {
  item: QuoteItem;
  onEdit: () => void;
  onRemove: () => void;
}

export function QuoteItemRow({ item, onEdit, onRemove }: QuoteItemRowProps) {
  const unitPrice = getUnitPrice(item.product, item.priceTier);

  return (
    <Pressable style={styles.card} onPress={onEdit}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>

      <Text style={styles.meta}>
        {item.quantity} × {formatCurrency(unitPrice)} · {TIER_LABELS[item.priceTier]}
        {item.discountPct ? ` · -${item.discountPct}%` : ''}
      </Text>

      <Text style={styles.total}>{formatCurrency(getLineTotal(item))}</Text>
    </Pressable>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  name: {
    ...typography.body,
    color: colors.black,
    fontWeight: '600',
    flex: 1,
  },
  meta: {
    ...typography.caption,
    color: colors.grayDark,
  },
  total: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
});
