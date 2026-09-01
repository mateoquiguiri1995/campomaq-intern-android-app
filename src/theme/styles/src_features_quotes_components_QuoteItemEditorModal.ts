import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados para $file. Uso: se importan desde esta pantalla/componente; editar aquí preserva el diseño. */
export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  productName: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  productCode: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockOk: {
    color: colors.success,
  },
  stockOut: {
    color: colors.danger,
  },
  tierRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tierChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tierChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tierLabel: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '600',
  },
  tierLabelSelected: {
    color: colors.onPrimary,
  },
  tierPrice: {
    ...typography.body,
    color: colors.black,
    fontWeight: '700',
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  quantityInput: {
    ...typography.subtitle,
    color: colors.black,
    width: 70,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  discountInput: {
    ...typography.body,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  confirmButton: {
    flex: 1,
  },
});

