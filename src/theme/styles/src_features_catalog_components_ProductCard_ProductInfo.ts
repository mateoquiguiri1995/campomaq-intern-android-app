import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

/** Estilos centralizados. Uso: src/features/catalog/components/ProductCard/ProductInfo.tsx. */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 1.5,
  },
  category: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
    lineHeight: 16,
    marginTop: 1,
  },
  stockBadgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  badgeLowStock: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeLowStockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
  },
  badgeInStock: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeInStockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#137333',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 3,
  },
  priceCol: {
    gap: 0,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  priceSub: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: -1,
  },
  newBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#000000',
  },
  promoBadge: {
    backgroundColor: '#FCE8E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  promoBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C5221F',
  },
});
