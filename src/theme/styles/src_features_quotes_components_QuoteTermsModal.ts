import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '92%',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.black,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.grayDark,
    marginTop: 2,
    fontSize: 12,
  },
  scrollArea: {
    marginVertical: spacing.xs,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.black,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionRequiredBadge: {
    backgroundColor: '#FEF7E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FEEFC3',
  },
  sectionRequiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B06000',
    textTransform: 'uppercase',
  },
  sectionSavedBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  sectionSavedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#137333',
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.sm,
    fontSize: 12,
  },

  /* Card resumen de vendedor activo */
  sellerSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF0',
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: 4,
  },
  sellerSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  sellerAvatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sellerSummaryInfo: {
    flex: 1,
  },
  sellerSummaryName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.black,
    fontSize: 14,
  },
  sellerSummaryDetails: {
    ...typography.caption,
    color: colors.grayDark,
    fontSize: 11,
    marginTop: 2,
  },
  sellerChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  sellerChangeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },

  /* Lista de Radio Buttons */
  radioList: {
    gap: spacing.xs,
    marginTop: 4,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  radioCardSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: '#FFFDF0',
    borderWidth: 1.5,
  },
  radioCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInfo: {
    flex: 1,
  },
  radioName: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
  },
  radioNameSelected: {
    color: colors.black,
  },
  radioDetails: {
    ...typography.caption,
    fontSize: 11,
    color: colors.gray,
    marginTop: 1,
  },
  sellerHelpText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.grayDark,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },

  /* Opciones de checkboxes */
  optionsList: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  checkboxRowSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: '#FFFDF0',
  },
  checkboxIcon: {
    marginTop: 1,
  },
  checkboxText: {
    ...typography.body,
    fontSize: 12.5,
    color: colors.black,
    flex: 1,
    lineHeight: 17,
  },
  checkboxTextSelected: {
    fontWeight: '600',
  },
  customInputLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.grayDark,
    marginTop: spacing.xs,
    marginBottom: 4,
    fontSize: 11.5,
  },
  customInput: {
    ...typography.body,
    fontSize: 12.5,
    color: colors.black,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    minHeight: 52,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1.6,
  },
});
