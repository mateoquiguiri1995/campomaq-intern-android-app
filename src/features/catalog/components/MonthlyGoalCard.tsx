import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/theme/styles/src_features_catalog_components_MonthlyGoalCard';
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

