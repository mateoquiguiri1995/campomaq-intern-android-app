import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/**
 * Pantalla de carga inicial (splash) al abrir la app.
 *
 * FASE ACTUAL: placeholder visual únicamente. Todavía NO está conectada
 * a la navegación — `app/_layout.tsx` sigue abriendo directo en /login.
 *
 * TODO: mostrarla al iniciar la app por un máximo de 3s (temporizador, o
 *   hasta que termine una carga real de sesión, lo que ocurra primero) y
 *   luego navegar a /login o /(tabs) según si hay una sesión guardada.
 */
export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.brandCircle}>
        <Text style={styles.brandInitials}>CM</Text>
      </View>
      <Text style={styles.appName}>Campo Maq Ventas</Text>
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
});
