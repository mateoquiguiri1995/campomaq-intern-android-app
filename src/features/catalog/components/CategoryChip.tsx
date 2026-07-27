import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Chip de categoría del catálogo (Todos, Cultivadores, etc.). */
export function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
