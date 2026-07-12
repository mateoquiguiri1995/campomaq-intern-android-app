import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';

interface ProductImageProps {
  imageUrl?: string;
}

export function ProductImage({
  imageUrl,
}: ProductImageProps) {
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 112,
    height: 112,

    borderRadius: radius.md,

    backgroundColor: colors.surface,

    justifyContent: 'center',

    alignItems: 'center',

    overflow: 'hidden',
  },

  image: {
    width: '92%',

    height: '92%',
  },
});