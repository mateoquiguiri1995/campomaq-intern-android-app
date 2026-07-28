import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

/** Estilos centralizados para ClientAvatar. */
export const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
  },
});
