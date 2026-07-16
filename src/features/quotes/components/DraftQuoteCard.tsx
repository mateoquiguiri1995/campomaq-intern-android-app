import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';

import { getQuoteTotals } from '../services/quoteCalculations';
import { getClientDisplayName } from '../services/quoteClient';
import type { Quote } from '../types';

interface DraftQuoteCardProps {
  quote: Quote;
  onPress: () => void;
  onDelete: () => void;
}

export function DraftQuoteCard({ quote, onPress, onDelete }: DraftQuoteCardProps) {
  const { total } = getQuoteTotals(quote.items);
  const date = new Date(quote.updatedAt).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {getClientDisplayName(quote.client)}
        </Text>
        <Text style={styles.meta}>
          {quote.items.length} producto(s) · {date}
        </Text>
        <Text style={[styles.status, quote.status === 'generated' ? styles.statusGenerated : styles.statusDraft]}>
          {quote.status === 'generated' ? 'PDF generado' : 'Borrador'}
        </Text>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: colors.grayDark,
  },
  status: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusDraft: {
    color: colors.warning,
  },
  statusGenerated: {
    color: colors.success,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  total: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
