import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ProductActionsProps {
  onPress: () => void;
}

export function ProductActions({
  onPress,
}: ProductActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Ionicons
          name="eye-outline"
          size={18}
          color={colors.primaryDark}
        />

        <Text style={styles.text}>
          Ver detalles
        </Text>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.primaryDark}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,

    paddingTop: spacing.sm,

    borderTopWidth: 1,

    borderTopColor: colors.border,
  },

  button: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-end',

    gap: spacing.xs,
  },

  text: {
    ...typography.body,

    color: colors.primaryDark,

    fontWeight: '600',
  },
});