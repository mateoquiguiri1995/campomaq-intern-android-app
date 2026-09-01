import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados. Uso: src/features/catalog/components/BrandSelect.tsx. */
export const styles = StyleSheet.create({
  trigger: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  triggerActive: {
    backgroundColor: colors.primary,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.4)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    maxHeight: '60%',
  },

  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },

  sheetTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.xs,
  },

  sheetList: {
    flexGrow: 0,
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + spacing.xs,
  },

  optionText: {
    ...typography.body,
    color: colors.black,
  },

  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
