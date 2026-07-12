import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { Product } from '../../types';
import { ProductDescription } from './ProductDescription';
import { ProductImageCarousel } from './ProductImageCarousel';
import { ProductPriceList } from './ProductPriceList';

interface ProductDetailProps {
  product: Product;
}

/** Vista completa de detalle de un producto del catálogo. */
export function ProductDetail({ product }: ProductDetailProps) {
  const hasStock = product.stockQty > 0;

  return (
    <View style={styles.container}>
      {product.images && product.images.length > 0 ? (
        <ProductImageCarousel images={product.images} />
      ) : (
        <View style={styles.placeholderWrapper}>
          <Image
            source={require('../../../../../assets/images/campomaq/campomaq.png')}
            style={styles.placeholderImage}
            contentFit="contain"
          />
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.code}>{product.code}</Text>

        {product.isNew && (
          <Badge
            label="Nuevo"
            backgroundColor={colors.primary}
            textColor={colors.black}
          />
        )}
      </View>

      <Text style={styles.name}>{product.name}</Text>

      <View style={styles.brandRow}>
        {product.brandLogo && (
          <Image
            source={{ uri: product.brandLogo }}
            style={styles.brandLogo}
            contentFit="contain"
          />
        )}

        <Text style={styles.brand}>{product.brand}</Text>

        <Text style={styles.category}>· {product.category}</Text>
      </View>

      <Badge
        label={hasStock ? `${product.stockQty} en stock` : 'Sin stock'}
        backgroundColor={hasStock ? colors.success : colors.danger}
      />

      <Text style={styles.sectionTitle}>Precios</Text>
      <ProductPriceList product={product} />

      {product.description && (
        <>
          <Text style={styles.sectionTitle}>Ficha técnica</Text>
          <ProductDescription html={product.description} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },

  placeholderWrapper: {
    height: 260,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderImage: {
    width: '60%',
    height: '60%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  code: {
    ...typography.caption,
    color: colors.gray,
    fontWeight: '600',
  },

  name: {
    ...typography.title,
    fontSize: 20,
    color: colors.black,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  brandLogo: {
    width: 20,
    height: 20,
  },

  brand: {
    ...typography.body,
    color: colors.grayDark,
    fontWeight: '600',
  },

  category: {
    ...typography.body,
    color: colors.gray,
  },

  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.sm,
  },
});
