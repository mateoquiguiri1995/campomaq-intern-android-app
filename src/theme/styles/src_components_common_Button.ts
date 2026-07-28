import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados. Uso: src/components/common/Button.tsx. */
export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryLabel: {
    ...typography.button,
    color: colors.onPrimary,
  },
  ghostLabel: {
    ...typography.button,
    color: colors.black,
  },
});
