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

      <View style={styles.header}>

        <Text style={styles.code}>
          {product.code}
        </Text>

        {product.isNew && (
          <Badge
            label="Nuevo"
            backgroundColor={colors.primary}
            textColor={colors.black}
          />
        )}

      </View>

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

      <Text style={styles.category}>
        {product.category}
      </Text>

      <Badge
        label="Stock pendiente"
        backgroundColor={colors.warning}
      />

      <View style={styles.priceContainer}>

        <Text style={styles.priceLabel}>
          Precio contado
        </Text>

        <Text style={styles.price}>
          {formatCurrency(product.priceA)}
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,

    justifyContent:'space-between',
  },

  header:{
    flexDirection:'row',

    justifyContent:'space-between',

    alignItems:'center',
  },

  code:{
    ...typography.caption,

    color:colors.gray,

    fontWeight:'600',
  },

  name:{
    ...typography.subtitle,

    color:colors.black,

    fontWeight:'700',

    marginTop:spacing.xs,
  },

  brandRow:{
    flexDirection:'row',

    alignItems:'center',

    gap:spacing.xs,

    marginTop:spacing.sm,
  },

  logo:{
    width:24,

    height:24,
  },

  brand:{
    ...typography.body,

    color:colors.grayDark,

    fontWeight:'600',
  },

  category:{
    ...typography.caption,

    color:colors.gray,
  },

  priceContainer:{
    marginTop:spacing.md,
  },

  priceLabel:{
    ...typography.caption,

    color:colors.grayDark,
  },

  price:{
    fontSize:22,

    fontWeight:'700',

    color:colors.black,
  },

});