import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados. Uso: src/features/clients/components/ClientCard.tsx. */
export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
    fontSize: 15,
    flexShrink: 1,
  },
  scoreBadge: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FBEEC8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: spacing.xs,
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B25E00',
  },
  subtitle: {
    ...typography.caption,
    color: colors.grayDark,
    fontSize: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: spacing.xs,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
  },
});
