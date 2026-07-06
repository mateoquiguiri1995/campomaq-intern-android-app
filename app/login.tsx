import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * Pantalla de login (versión mínima).
 *
 * TODO(Fase 1): conectar el login al endpoint real del backend usando
 *   authService.login() (src/features/auth/services/authService.ts).
 * TODO(Fase 1): guardar el token con expo-secure-store y crear AuthProvider.
 * TODO(Futuro): habilitar el ingreso con código QR (hoy es solo placeholder).
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    // Sin autenticación real en esta fase: navega directo a las pestañas.
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>Campo Maq Ventas</Text>
          <Text style={styles.portal}>Portal de ventas</Text>
          <Text style={styles.welcome}>Bienvenido de vuelta, vendedor.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Usuario o correo"
            placeholderTextColor={colors.gray}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.gray}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </Pressable>

          <Pressable style={styles.qrButton} disabled>
            <Text style={styles.qrButtonText}>
              Ingresar con código QR — Próximamente
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>v0.1.0 · Quito · Ecuador</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.black,
  },
  portal: {
    ...typography.subtitle,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  welcome: {
    ...typography.body,
    color: colors.grayDark,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    fontSize: 16,
    color: colors.black,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loginButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  qrButton: {
    backgroundColor: colors.grayLight,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    opacity: 0.6,
  },
  qrButtonText: {
    ...typography.body,
    color: colors.grayDark,
    fontWeight: '500',
  },
  footer: {
    ...typography.caption,
    color: colors.gray,
    textAlign: 'center',
  },
});
