import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';
import type { MonthlyGoal } from '../types';
import { MOCK_MONTHLY_GOAL } from '../services/goalService';

interface MonthlyGoalCardProps {
  goal?: MonthlyGoal | null;
}

/**
 * Componente de tarjeta negra (etiqueta negra) para mostrar la Meta del Mes,
 * porcentaje de avance, margen económico realizado, margen de meta y barra de progreso.
 */
export function MonthlyGoalCard({ goal = MOCK_MONTHLY_GOAL }: MonthlyGoalCardProps) {
  const currentGoal = goal ?? MOCK_MONTHLY_GOAL;

  const {
    title = 'Meta del mes',
    period,
    achievedMargin,
    targetMargin,
    percentage,
  } = currentGoal;

  // Cálculo del porcentaje si no viene predefinido
  const computedPct =
    percentage ?? (targetMargin > 0 ? (achievedMargin / targetMargin) * 100 : 0);
  const clampedPct = Math.min(100, Math.max(0, computedPct));
  const formattedPct = clampedPct.toFixed(1).replace('.0', '');

  return (
    <View style={styles.container}>
      {/* Encabezado: Título/Periodo y Porcentaje de avance */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBadge}>
            <Ionicons name="trending-up" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.titleText}>{title}</Text>
            {period ? <Text style={styles.periodText}>{period}</Text> : null}
          </View>
        </View>

        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{formattedPct}%</Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clampedPct}%` }]} />
      </View>

      {/* Margen económico realizado vs meta */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Realizado</Text>
          <Text style={[styles.metricValue, styles.achievedValue]}>
            {formatCurrency(achievedMargin)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Meta</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(targetMargin)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181B', // Tarjeta/etiqueta negra elegante
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(235, 214, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 14,
  },
  periodText: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: -2,
  },
  percentageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  percentageText: {
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#242427',
    borderRadius: radius.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#3F3F46',
    marginHorizontal: spacing.sm,
  },
  metricLabel: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  achievedValue: {
    color: colors.primary, // Resaltado en amarillo de la marca
  },
});
