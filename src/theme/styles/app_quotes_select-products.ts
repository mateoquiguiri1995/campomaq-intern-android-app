import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados para select-products.tsx. */
export const styles = StyleSheet.create({
  /** Contiene barra, filtros y listado; referencia del panel de sugerencias. */
  searchArea: {
    flex: 1,
    gap: spacing.md,
  },
  searchContainer: {
    gap: spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
    height: 46,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    height: '100%',
    paddingVertical: 0,
  },
  clearIcon: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    height: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    minWidth: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchButtonLoading: {
    backgroundColor: colors.primaryDark,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFBE6',
    borderWidth: 1,
    borderColor: '#FFE58F',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: 2,
  },
  loadingBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#874D00',
  },
  listWrapper: {
    flex: 1,
  },
  listWrapperDimmed: {
    opacity: 0.55,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryCount: {
    ...typography.caption,
    color: colors.grayDark,
  },
  summaryTotal: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  summaryButton: {
    minWidth: 160,
  },
});
