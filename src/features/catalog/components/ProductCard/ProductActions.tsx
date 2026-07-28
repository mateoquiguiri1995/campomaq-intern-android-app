import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '@/theme/styles/src_features_catalog_components_ProductCard_ProductActions';
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

