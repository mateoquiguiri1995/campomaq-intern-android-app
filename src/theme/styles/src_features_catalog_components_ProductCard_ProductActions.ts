import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/** Estilos centralizados. Uso: src/features/catalog/components/ProductCard/ProductActions.tsx. */
export const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,

    paddingTop: spacing.xs,

    borderTopWidth: 1,

    borderTopColor: colors.border,
  },

  button: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-end',

    gap: 4,
  },

  text: {
    fontSize: 12,

    color: colors.primaryDark,

    fontWeight: '600',
  },
});
