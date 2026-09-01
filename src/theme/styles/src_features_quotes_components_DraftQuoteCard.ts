import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados para $file. Uso: se importan desde esta pantalla/componente; editar aquí preserva el diseño. */
export const styles = StyleSheet.create({
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

