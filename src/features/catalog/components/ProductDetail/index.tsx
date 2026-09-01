import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { styles } from '@/theme/styles/src_features_catalog_components_ProductDetail_index';
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

