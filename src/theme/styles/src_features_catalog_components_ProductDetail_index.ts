import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados. Uso: src/features/catalog/components/ProductDetail/index.tsx. */
export const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },

  placeholderWrapper: {
    height: 260,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderImage: {
    width: '60%',
    height: '60%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  code: {
    ...typography.caption,
    color: colors.gray,
    fontWeight: '600',
  },

  name: {
    ...typography.title,
    fontSize: 20,
    color: colors.black,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  brandLogo: {
    width: 20,
    height: 20,
  },

  brand: {
    ...typography.body,
    color: colors.grayDark,
    fontWeight: '600',
  },

  category: {
    ...typography.body,
    color: colors.gray,
  },

  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.sm,
  },
});
