import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { formatCurrency } from '@/utils/currency';
import type { MonthlyGoal } from '../types';
import { MOCK_MONTHLY_GOAL } from '../services/goalService';

interface MonthlyGoalCardProps {
  goal?: MonthlyGoal | null;
}

export function MonthlyGoalCard({ goal = MOCK_MONTHLY_GOAL }: MonthlyGoalCardProps) {
  const currentGoal = goal ?? MOCK_MONTHLY_GOAL;

  const {
    achievedMargin,
    targetMargin,
    percentage,
  } = currentGoal;

  const computedPct =
    percentage ?? (targetMargin > 0 ? (achievedMargin / targetMargin) * 100 : 0);
  const clampedPct = Math.min(100, Math.max(0, computedPct));
  const formattedPct = Math.round(clampedPct);

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.iconBadge}>
          <Ionicons name="trending-up" size={14} color={colors.primary} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.titleText}>Meta del mes - {formattedPct}%</Text>
          <Text style={styles.valuesText}>
            {formatCurrency(Math.round(achievedMargin))} / {formatCurrency(Math.round(targetMargin))} USD
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clampedPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
