import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
const IMAGE_HEIGHT = 260;

/** Estilos centralizados. Uso: src/features/catalog/components/ProductDetail/ProductImageCarousel.tsx. */
export const styles = StyleSheet.create({
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
