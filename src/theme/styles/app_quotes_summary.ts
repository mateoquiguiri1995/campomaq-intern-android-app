import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados para $file. Uso: se importan desde esta pantalla/componente; editar aquí preserva el diseño. */
export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.grayDark,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.grayDark,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary, // Borde amarillo Campo Maq
    padding: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  clientText: {
    flex: 1,
    gap: 2,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
  },
  clientSubtitle: {
    fontSize: 12,
    color: colors.grayDark,
  },
  productsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.sm,
  },
  addBtnIcon: {
    fontWeight: '700',
  },
  addProductsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },
  itemsList: {
    gap: spacing.sm,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  productCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    paddingRight: spacing.sm,
  },
  productLineTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  productLineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  productCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productUnitSubtitle: {
    fontSize: 12,
    color: colors.grayDark,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtnMinus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  counterBtnPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsRowFinal: {
    marginTop: spacing.xs,
  },
  totalsDivider: {
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    marginVertical: spacing.xs,
  },
  totalsLabel: {
    fontSize: 13,
    color: colors.grayDark,
  },
  totalsValue: {
    fontSize: 13,
    color: colors.black,
  },
  totalLabelFinal: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '700',
  },
  totalValueFinal: {
    fontSize: 18,
    color: colors.black,
    fontWeight: '700',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btnDraft: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDraftText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  btnSend: {
    flex: 1.5,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSendText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  draftActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  duplicateDraftText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.grayDark,
  },
  deleteDraftText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
});
