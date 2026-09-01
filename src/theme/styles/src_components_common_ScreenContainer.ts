import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/** Estilos centralizados. Uso: src/components/common/ScreenContainer.tsx. */
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.md,
  },

  nonScrollContent: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
});
