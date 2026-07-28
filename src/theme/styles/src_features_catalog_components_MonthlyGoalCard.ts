import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/** Estilos centralizados. Uso: src/features/catalog/components/MonthlyGoalCard.tsx. */
export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A', // Tarjeta negra elegante y compacta
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(235, 214, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    gap: 2,
  },
  titleText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 13,
  },
  valuesText: {
    fontSize: 11,
    color: '#A1A1AA',
  },
  progressTrack: {
    width: 70,
    height: 6,
    backgroundColor: '#27272A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
