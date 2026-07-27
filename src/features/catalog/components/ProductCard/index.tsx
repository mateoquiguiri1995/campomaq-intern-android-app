import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import type { Product } from '../../types';

import { ProductImage } from './ProductImage';
import { ProductInfo } from './ProductInfo';

interface ProductCardProps {
  product: Product;
  onPressDetails?: (product: Product) => void;
}

export function ProductCard({
  product,
  onPressDetails,
}: ProductCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPressDetails?.(product)}
    >
      <View style={styles.content}>
        <ProductImage
          code={product.code}
          imageUrl={product.imageUrl}
        />

        <View style={styles.rightColumn}>
          <ProductInfo product={product} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 10,
  },
  cardPressed: {
    backgroundColor: '#FAFAFA',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightColumn: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
});