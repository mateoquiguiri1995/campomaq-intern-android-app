import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ProductImageCarouselProps {
  images: string[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const IMAGE_HEIGHT = 260;

/** Carrusel de imágenes del producto, con puntos de paginación. */
export function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / SLIDE_WIDTH
    );
    setActiveIndex(index);
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(item, index) => `${item}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SLIDE_WIDTH }]}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        )}
      />

      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((image, index) => (
            <View
              key={image}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },

  dotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },
});
