import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Platform, StyleSheet } from 'react-native';

/**
 * Estilos centralizados para QuoteItemEditorModal.
 *
 * Arquitectura de capas:
 * - `modalRoot`: Ocupa toda la pantalla y alinea el sheet al fondo.
 * - `backdrop`: Capa absoluta 100% fija (rgba) que nunca se deforma ni se corta con el teclado.
 * - `sheet`: Bottom sheet redondeado con sombra suave y scroll interno amplio.
 * - `stickyFooter`: Resumen de total y utilidad fijado en la parte inferior, visible mientras se escribe.
 */
export const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  keyboardAvoider: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    maxHeight: '95%',
    paddingTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 18 },
    }),
  },
  // Indicador de arrastre tipo bottom sheet
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4.5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs + 2,
    gap: 2,
  },
  productName: {
    ...typography.subtitle,
    fontSize: 17,
    color: colors.black,
    fontWeight: '700',
  },
  productMeta: {
    ...typography.caption,
    color: colors.gray,
    fontSize: 11.5,
  },
  scrollArea: {
    flexShrink: 1,
    minHeight: 340,
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl + 12,
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs + 2,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 11.5,
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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    gap: 3,
  },
  tierChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  tierLabel: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '600',
    fontSize: 11,
  },
  tierLabelSelected: {
    color: colors.onPrimary,
  },
  tierPrice: {
    ...typography.body,
    color: colors.black,
    fontWeight: '700',
    fontSize: 13.5,
  },
  tierUtilityPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  tierUtilityPillSelected: {
    backgroundColor: 'rgba(26, 26, 26, 0.12)',
  },
  tierUtilityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Colores de utilidad por rango
  utilityBadgeNeutral: {
    backgroundColor: colors.background,
  },
  utilityBadgeRed: {
    backgroundColor: 'rgba(214, 69, 69, 0.12)',
  },
  utilityBadgeOrange: {
    backgroundColor: 'rgba(230, 126, 34, 0.12)',
  },
  utilityBadgeGreen: {
    backgroundColor: 'rgba(46, 158, 79, 0.12)',
  },
  utilityTextNeutral: {
    color: colors.gray,
  },
  utilityTextRed: {
    color: colors.danger,
  },
  utilityTextOrange: {
    color: colors.orange,
  },
  utilityTextGreen: {
    color: colors.success,
  },
  customPriceCostHint: {
    ...typography.caption,
    fontSize: 11,
    color: colors.gray,
  },

  // Acordeón para precio personalizado con amarillo Campo Maq
  customTierCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  customTierCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: { elevation: 2 },
    }),
  },
  customTierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  customTierHeaderSelected: {
    backgroundColor: colors.primary,
  },
  customTierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customTierTitle: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '600',
    fontSize: 12.5,
  },
  customTierTitleSelected: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  customTierRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customTierPrice: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 13.5,
    color: colors.onPrimary,
  },
  customTierActionText: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '600',
    fontSize: 11.5,
  },
  customPriceExpandedArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFDF0',
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 163, 0, 0.25)',
    gap: spacing.xs,
  },
  fieldRowError: {
    borderColor: colors.danger,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: 'rgba(214, 69, 69, 0.08)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  errorAlertText: {
    ...typography.caption,
    flex: 1,
    color: colors.danger,
    fontWeight: '600',
    fontSize: 11,
  },

  // Cajoncitos para último costo y costo promedio
  costInfoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  costPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },
  costPillLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.grayDark,
    fontWeight: '600',
  },
  costPillValue: {
    ...typography.caption,
    fontSize: 12.5,
    color: colors.black,
    fontWeight: '700',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepButtonText: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
    fontSize: 20,
  },
  quantityInput: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.black,
    fontWeight: '700',
    width: 64,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  discountModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    padding: 2,
  },
  discountModeSegment: {
    minWidth: 38,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountModeSegmentSelected: {
    backgroundColor: colors.primary,
  },
  discountModeSegmentText: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '700',
    fontSize: 11,
  },
  discountModeSegmentTextSelected: {
    color: colors.onPrimary,
  },
  discountFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  discountFieldSymbol: {
    ...typography.body,
    color: colors.grayDark,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  discountFieldInput: {
    ...typography.body,
    flex: 1,
    color: colors.black,
    fontWeight: '600',
    paddingVertical: spacing.xs + 3,
    fontSize: 15,
  },

  // Punto B: Footer Sticky con Resumen en Vivo + Botones
  stickyFooter: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs + 3,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    gap: spacing.xs + 3,
  },
  stickySummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stickySummaryLeft: {
    flexDirection: 'column',
  },
  stickySummaryLabel: {
    ...typography.caption,
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.grayDark,
    letterSpacing: 0.5,
  },
  stickySummaryPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  stickySummaryTotal: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '800',
    color: colors.black,
  },
  stickySummaryDiscount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.danger,
  },
  utilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  utilityBadgePct: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confirmButton: {
    flex: 1.5,
  },
});
