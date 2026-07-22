import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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
          size={14}
          color={colors.primaryDark}
        />

        <Text style={styles.text}>
          Ver detalles
        </Text>

        <Ionicons
          name="chevron-forward"
          size={12}
          color={colors.primaryDark}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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