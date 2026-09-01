import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados. Uso: src/features/catalog/components/ProductDetail/ProductPriceList.tsx. */
export const styles = StyleSheet.create({
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
