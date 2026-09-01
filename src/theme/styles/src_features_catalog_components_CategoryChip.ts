import { StyleSheet } from 'react-native';
import { radius } from '@/theme/spacing';

/** Estilos centralizados. Uso: src/features/catalog/components/CategoryChip.tsx. */
export const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  chipSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  label: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
