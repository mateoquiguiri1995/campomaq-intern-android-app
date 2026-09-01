import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface BadgeProps {
  label: string;

  backgroundColor?: string;

  textColor?: string;
}

export function Badge({
  label,
  backgroundColor = colors.success,
  textColor = colors.surface,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

import { styles } from '@/theme/styles/src_components_common_Badge';
