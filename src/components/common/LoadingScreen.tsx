import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface LoadingScreenProps {
  title: string;
  subtitle?: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Pantalla de carga reutilizable para validación de sesión y precarga
 * de datos internos.
 */
export function LoadingScreen({
  title,
  subtitle,
  detail,
  actionLabel,
  onAction,
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandCircle}>
        <Text style={styles.brandInitials}>CM</Text>
      </View>
      <Text style={styles.appName}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} variant="ghost" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  brandCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onPrimary,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.grayDark,
  },
  detail: {
    textAlign: 'center',
    color: colors.gray,
  },
  action: {
    marginTop: spacing.sm,
  },
});
