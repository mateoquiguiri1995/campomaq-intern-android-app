import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function OfflineBanner() {
  const { isOfflineMode } = useAppBootstrap();

  if (!isOfflineMode) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={15} color="#856404" />
      <Text style={styles.text}>Modo sin conexión · Usando copia local</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFF3CD',
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEEBA',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
});
