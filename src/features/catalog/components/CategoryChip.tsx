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
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.body,
    fontSize: 13,
    color: colors.grayDark,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
