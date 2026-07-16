import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

import type { Product } from '../../types';

import { ProductActions } from './ProductActions';
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
        <ProductImage imageUrl={product.imageUrl} />

        <View style={styles.rightColumn}>
          <ProductInfo product={product} />

          <ProductActions
            onPress={() => onPressDetails?.(product)}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,

    borderRadius: radius.md,

    borderWidth: 1,

    borderColor: colors.border,

    padding: spacing.md,
  },

  cardPressed: {
    backgroundColor: colors.background,
  },

  content: {
    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: spacing.md,
  },

  rightColumn: {
    flex: 1,

    justifyContent: 'space-between',

    minHeight: 112,
  },
});