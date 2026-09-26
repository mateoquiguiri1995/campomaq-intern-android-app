import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

/** Estilos centralizados. Uso: src/features/catalog/components/SearchSuggestionsPanel.tsx. */
export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(26,26,26,0.18)',
    borderRadius: radius.md,
  },

  card: {
    flexShrink: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  // flexShrink permite que el ScrollView respete el alto máximo de la
  // tarjeta; sin esto toma el alto de todo su contenido y no desplaza.
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.gray,
  },

  sectionAction: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },

  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowIconPrimary: {
    backgroundColor: colors.primary,
  },

  submitText: {
    flex: 1,
    fontSize: 14,
    color: colors.grayDark,
  },

  submitQuery: {
    fontWeight: '700',
    color: colors.black,
  },

  recentText: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
  },

  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  thumbImage: {
    width: '100%',
    height: '100%',
  },

  productText: {
    flex: 1,
    gap: 2,
  },

  productName: {
    fontSize: 13,
    color: colors.grayDark,
  },

  productNameMatch: {
    fontWeight: '700',
    color: colors.black,
  },

  productMeta: {
    fontSize: 11,
    color: colors.gray,
  },

  offlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },

  offlineTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.grayDark,
  },

  emptyText: {
    fontSize: 12,
    color: colors.gray,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm + 2,
    lineHeight: 17,
  },
});
