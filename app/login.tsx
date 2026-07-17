import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/AuthProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colores oficiales especificados
const COLORS = {
  primary: '#F5B400',       // Amarillo de marca
  white: '#FFFFFF',         // Blanco
  black: '#1A1A1A',         // Casi negro
  grayWarm: '#6B6660',      // Gris cálido para textos secundarios
  amberDark: '#7A5C00',     // Ámbar oscuro para textos sobre amarillo
  fieldBg: '#F7F5F0',       // Fondo de inputs
  fieldBorder: '#ECE8DF',   // Borde de inputs
  amberLink: '#A37A00',     // Ámbar para enlace de ayuda
  grayLight: '#A9A49B',     // Gris claro para pie de página
  danger: '#D64545',        // Rojo para errores
};

export default function LoginScreen() {
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithPassword({ email: email.trim(), password });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No pudimos iniciar sesión. Revisa tus datos e intenta de nuevo.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Banda superior amarilla (~40% de altura) con tractor y branding a la izquierda */}
          <View style={styles.yellowBand}>
            {/* Imagen del tractor en el fondo a la derecha */}
            <Image
              source={require('@/assets/images/campomaq/hero-ilustracion.png')}
              style={styles.tractorImage}
              resizeMode="cover"
            />

            {/* Degradado de mezcla: amarillo suave a la izquierda, desvaneciéndose de forma gradual y fluida hacia la derecha */}
            <LinearGradient
              colors={['rgba(245, 180, 0, 0.72)', 'rgba(245, 180, 0, 0.35)', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0.75, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Textos y Branding alineados a la izquierda */}
            <View style={styles.heroTextContainer}>
              <Image
                source={require('@/assets/images/campomaq/campomaq.png')}
                style={styles.logoLeft}
                resizeMode="contain"
              />
              <Text style={styles.titleLeft}>¡Bienvenido!</Text>
              <Text style={styles.subtitleLeft}>
                Ingresa tus credenciales{"\n"}para continuar
              </Text>
              <View style={styles.shortLine} />
            </View>
          </View>

          {/* Formulario en hoja blanca inferior */}
          <View style={styles.formContainer}>
            {/* Campo 1: Correo/Usuario (sin etiqueta de texto externa) */}
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color={COLORS.grayWarm} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="e-mail@campomaq.ec"
                placeholderTextColor={COLORS.grayWarm}
              />
            </View>

            {/* Campo 2: Contraseña (sin etiqueta de texto externa) */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.grayWarm} />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor={COLORS.grayWarm}
                onSubmitEditing={canSubmit ? handleSubmit : undefined}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={12}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.grayWarm}
                />
              </Pressable>
            </View>

            {/* Fila Recordarme & Olvidaste */}
            <View style={styles.rememberRow}>
              <Pressable
                onPress={() => setRememberMe((prev) => !prev)}
                style={styles.checkboxContainer}
                hitSlop={8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color={COLORS.black} />}
                </View>
                <Text style={styles.checkboxText}>Recordarme</Text>
              </Pressable>

              <Pressable hitSlop={8}>
                <Text style={styles.forgotText}>¿Olvidaste?</Text>
              </Pressable>
            </View>

            {/* Caja de error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Botón Principal */}
            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
                pressed && styles.submitButtonPressed,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
              </Text>
            </Pressable>
          </View>

          {/* Pie de página */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>v1.0 · Cayambe · Ecuador</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
  },
  yellowBand: {
    height: SCREEN_HEIGHT * 0.42,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  tractorImage: {
    position: 'absolute',
    right: -20,
    bottom: 0,
    width: '65%',
    height: '100%',
    opacity: 0.55,
  },
  heroTextContainer: {
    position: 'absolute',
    left: 24,
    bottom: 44,
    right: '42%',
    zIndex: 2,
  },
  logoLeft: {
    width: 175,
    height: 175 / 3.85,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  titleLeft: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 24,
    color: COLORS.black,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitleLeft: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 13,
    color: '#3A362F',
    lineHeight: 17,
  },
  shortLine: {
    width: 32,
    height: 3,
    backgroundColor: COLORS.black,
    marginTop: 12,
    borderRadius: 1.5,
  },
  formContainer: {
    paddingHorizontal: 26,
    paddingTop: 28,
    backgroundColor: COLORS.white,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.fieldBorder,
    backgroundColor: COLORS.fieldBg,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 12,
    fontSize: 14,
    color: COLORS.black,
    fontFamily: 'Barlow_500Medium',
  },
  eyeButton: {
    padding: 6,
    marginRight: -4,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 12,
    color: COLORS.grayWarm,
  },
  forgotText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.amberLink,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  errorText: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 12,
    color: COLORS.danger,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
  footerContainer: {
    marginTop: 'auto',
    paddingVertical: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 11,
    color: COLORS.grayLight,
    textAlign: 'center',
  },
});
