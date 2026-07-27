import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export function ProductInfo({
  product,
}: Props) {
  const isLowStock = product.stockQty <= 12;
  const stockText = isLowStock ? `Stock - ${product.stockQty}` : `Disponible - ${product.stockQty}`;

  const isNew = product.isNew;
  // Determinamos dinámicamente si el producto está en oferta para el demo
  const isPromo = product.name.toLowerCase().includes('arranque') || 
                  product.code.includes('0009') || 
                  product.code.includes('157') || 
                  product.name.toLowerCase().includes('nylon');

  return (
    <View style={styles.container}>
      {/* Categoría */}
      <Text style={styles.category} numberOfLines={1}>
        {product.category}
      </Text>

      {/* Nombre del Producto */}
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Stock Badge */}
      <View style={styles.stockBadgeRow}>
        <View style={isLowStock ? styles.badgeLowStock : styles.badgeInStock}>
          <Text style={isLowStock ? styles.badgeLowStockText : styles.badgeInStockText}>
            {stockText}
          </Text>
        </View>
      </View>

      {/* Fila Inferior: Precio y Badge de Estado */}
      <View style={styles.bottomRow}>
        <View style={styles.priceCol}>
          <Text style={styles.priceText}>
            {formatCurrency(product.priceA)}
          </Text>
          <Text style={styles.priceSub}>
            PVP · IVA incl.
          </Text>
        </View>

        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>Nuevo</Text>
          </View>
        )}

        {isPromo && !isNew && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>Oferta</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
