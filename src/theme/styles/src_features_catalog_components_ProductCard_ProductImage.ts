import { StyleSheet } from 'react-native';

/** Estilos centralizados. Uso: src/features/catalog/components/ProductCard/ProductImage.tsx. */
export const styles = StyleSheet.create({
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  codeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 0.5,
    borderColor: '#EAEAEA',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  codeText: {
    color: '#8E8E93',
    fontSize: 7.5,
    fontWeight: '700',
  },
});
