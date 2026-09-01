import { StyleSheet } from 'react-native';

/** Estilos centralizados. Uso: src/features/catalog/components/ProductCard/index.tsx. */
export const styles = StyleSheet.create({
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
