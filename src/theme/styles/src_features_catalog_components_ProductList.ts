import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados. Uso: src/features/catalog/components/ProductList.tsx. */
export const styles = StyleSheet.create({
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
