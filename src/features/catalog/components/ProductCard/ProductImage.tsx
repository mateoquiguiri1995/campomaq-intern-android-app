import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ProductImageProps {
  code: string;
  imageUrl?: string;
  isNew?: boolean;
}

export function ProductImage({
  code,
  imageUrl,
  isNew,
}: ProductImageProps) {
  return (
    <View style={styles.container}>
      <Text
        numberOfLines={1}
        style={styles.code}
      >
        {code}
      </Text>

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

        {isNew && (
          <View style={styles.tags}>
            <Badge
              label="Nuevo"
              backgroundColor={colors.stockd}
              textColor={colors.black}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 128,
  },

  code: {
    ...typography.caption,

    color: colors.gray,

    fontWeight: '600',

    marginBottom: spacing.xs,
  },

  imageWrapper: {
    width: 128,
    height: 128,

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

  tags: {
    position: 'absolute',

    top: spacing.xs,

    left: spacing.xs,
  },
});
