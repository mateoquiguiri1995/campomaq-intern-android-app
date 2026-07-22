import { StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { Badge } from '@/components/common/Badge';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { formatCurrency } from '@/utils/currency';

import type { Product } from '../../types';

interface Props {
  product: Product;
}

export function ProductInfo({
  product,
}: Props) {
  return (
    <View style={styles.container}>

      <Text
        numberOfLines={2}
        style={styles.name}
      >
        {product.name}
      </Text>

      <View style={styles.brandRow}>

        {product.brandLogo && (

          <Image
            style={styles.logo}
            source={{
              uri: product.brandLogo,
            }}
            contentFit="contain"
          />

        )}

        <Text style={styles.brand}>
          {product.brand}
        </Text>

      </View>

      <Text
        numberOfLines={1}
        style={styles.category}
      >
        {product.category}
      </Text>

      <View style={styles.priceRow}>

        <View style={styles.priceContainer}>

          <Text style={styles.priceLabel}>
            Precio contado
          </Text>

          <Text style={styles.price}>
            {formatCurrency(product.priceA)}
          </Text>

        </View>

        <Badge
          label="1"
          backgroundColor={colors.primary}
        />

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,

    justifyContent:'space-between',
  },

  name:{
    fontSize:14,

    fontWeight:'700',

    lineHeight:18,

    color:colors.black,
  },

  brandRow:{
    flexDirection:'row',

    alignItems:'center',

    gap:spacing.xs,

    marginTop:spacing.xs,
  },

  logo:{
    width:18,

    height:18,
  },

  brand:{
    fontSize:12,

    fontWeight:'600',

    color:colors.grayDark,
  },

  category:{
    ...typography.caption,

    color:colors.gray,

    marginTop:2,
  },

  priceRow:{
    flexDirection:'row',

    alignItems:'center',

    justifyContent:'space-between',

    gap:spacing.sm,

    marginTop:spacing.sm,
  },

  priceContainer:{
    flexShrink:1,
  },

  priceLabel:{
    ...typography.caption,

    color:colors.grayDark,
  },

  price:{
    fontSize:20,

    fontWeight:'700',

    color:colors.black,
  },

});
