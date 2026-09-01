import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

interface ProductImageProps {
  code: string;
  imageUrl?: string;
}

export function ProductImage({
  code,
  imageUrl,
}: ProductImageProps) {
  return (
    <View style={styles.imageWrapper}>
      <Image
        source={
          imageUrl
            ? { uri: imageUrl }
            : require('../../../../../assets/images/campomaq/campomaq.png')
        }
        style={styles.image}
        contentFit="contain"
        transition={250}
        cachePolicy="memory-disk"
      />

      {/* Code overlay pill */}
      <View style={styles.codeBadge}>
        <Text style={styles.codeText}>{code}</Text>
      </View>
    </View>
  );
}

import { styles } from '@/theme/styles/src_features_catalog_components_ProductCard_ProductImage';
