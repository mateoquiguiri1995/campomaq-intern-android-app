import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl + 20,
    gap: spacing.md,
  },

  // Documento estilo Factura / Comprobante (Receipt Paper Card)
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },

  // Franja superior decorativa amarilla y negra de Campo Maq
  topStripeContainer: {
    flexDirection: 'row',
    height: 6,
    width: '100%',
  },
  topStripeYellow: {
    flex: 3,
    backgroundColor: colors.primary,
  },
  topStripeBlack: {
    flex: 1,
    backgroundColor: colors.black,
  },

  // Cabecera institucional del comprobante
  receiptHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  companyBrand: {
    flex: 1,
  },
  companyName: {
    ...typography.title,
    fontSize: 20,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: -0.5,
  },
  companySubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.grayDark,
    marginTop: 1,
  },
  companyDetails: {
    ...typography.caption,
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
  },

  // Bloque de tipo y número de documento
  documentInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentTypeTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: colors.grayDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  documentNumberText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '800',
    color: colors.black,
  },

  // Divisor perforado tipo ticket de comprobante
  perforatedContainer: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    marginVertical: 2,
  },
  perforatedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginHorizontal: spacing.md,
  },
  leftNotch: {
    position: 'absolute',
    left: -10,
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  rightNotch: {
    position: 'absolute',
    right: -10,
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },

  // Sección de datos del cliente y emisión
  metaSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: colors.grayDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metaGrid: {
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.grayDark,
  },
  metaValue: {
    ...typography.body,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: spacing.sm,
  },
  clientNameValue: {
    fontWeight: '800',
    fontSize: 13,
  },
  paymentPill: {
    backgroundColor: '#FEF7E0',
    borderWidth: 1,
    borderColor: '#FEEFC3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  paymentPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B06000',
  },

  // Divisor fino continuo
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },

  // Detalle de ítems / Productos
  itemsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  tableHeaderText: {
    ...typography.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemMain: {
    flex: 1,
    paddingRight: spacing.sm,
    gap: 2,
  },
  itemDescription: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
    lineHeight: 18,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  codeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  codeText: {
    fontSize: 10,
    color: colors.grayDark,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  calcText: {
    ...typography.caption,
    fontSize: 11.5,
    color: colors.grayDark,
  },
  creditNoteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE8E6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3,
  },
  creditNoteText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.danger,
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemTotalAmount: {
    ...typography.body,
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.black,
  },

  // Totales y Liquidación
  totalsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.xs + 2,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  totalsLabel: {
    ...typography.caption,
    fontSize: 12.5,
    color: colors.grayDark,
  },
  totalsValue: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
  },

  // Tarjeta de Gran Total destacado estilo Campo Maq
  grandTotalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  grandTotalLabel: {
    ...typography.body,
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    ...typography.title,
    fontSize: 20,
    fontWeight: '900',
    color: colors.onPrimary,
  },

  // Pie de página legal
  receiptFooter: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLegalText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 14,
  },
  footerAuthCode: {
    ...typography.caption,
    fontSize: 9.5,
    color: colors.grayLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },

  // Botón flotante/inferior de Compartir Detalle
  actionContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  shareButtonText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
});
