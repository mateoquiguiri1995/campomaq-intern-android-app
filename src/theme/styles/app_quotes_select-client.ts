import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados para $file. Uso: se importan desde esta pantalla/componente; editar aquí preserva el diseño. */
export const styles = StyleSheet.create({
  searchRow: {
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm + spacing.xs,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.xl + spacing.xs,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: 15,
    color: colors.black,
  },
  manualToggle: {
    alignSelf: 'flex-start',
  },
  manualToggleText: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  manualForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  manualHint: {
    ...typography.caption,
    color: colors.grayDark,
  },
  list: {
    gap: spacing.md,
  },
  center: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    color: colors.grayDark,
  },
  emptyText: {
    ...typography.body,
    color: colors.grayDark,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
});

