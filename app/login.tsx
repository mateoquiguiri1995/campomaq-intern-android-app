import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * Pantalla de login.
 *
 * Único método soportado: usuario/correo + contraseña. authService.loginWithPassword
 * es mock por ahora (ver authService.ts) pero ya pasa por el AuthProvider real,
 * así que no hace falta navegar a mano: al guardar la sesión, las rutas
 * protegidas muestran (tabs) solas.
 */
export default function LoginScreen() {
  const { loginWithPassword } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithPassword({ email: email.trim(), password });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No pudimos iniciar sesión. Revisa tus datos e intenta de nuevo.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Image
              source={require('@/assets/images/campomaq/campomaq.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <TextField
                label="Usuario o correo"
                placeholder="e-mail@campomaq.ec"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                icon={<Ionicons name="mail-outline" size={18} color={colors.gray} />}
              />
              <TextField
                label="Contraseña"
                placeholder="0000"
                secureTextEntry={!showPassword}
                autoComplete="password"
                keyboardType="default"
                value={password}
                onChangeText={setPassword}
                onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
                onSubmitEditing={canSubmit ? handleSubmit : undefined}
                icon={<Ionicons name="lock-closed-outline" size={18} color={colors.gray} />}
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.gray}
                    />
                  </Pressable>
                }
              />

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                label={isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
                disabled={!canSubmit}
                onPress={handleSubmit}
              />
            </View>
          </View>

          <Text style={styles.footer}>v1.0 · Cayambe · Ecuador</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + spacing.lg,
  },
  logo: {
    width: 240,
    height: 240 / 2.605,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.onPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.onPrimary,
    opacity: 0.75,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  form: {
    gap: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FBEAEA',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    flex: 1,
  },
  footer: {
    ...typography.caption,
    color: colors.onPrimary,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
