import { StyleSheet } from 'react-native';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Estilos centralizados. Uso: src/components/common/Badge.tsx. */
export const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,

    paddingVertical: 4,

    borderRadius: radius.pill,

    alignSelf: 'flex-start',
  },

  text: {
    ...typography.caption,

    fontWeight: '600',
  },
});
