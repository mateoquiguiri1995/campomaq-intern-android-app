import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { styles } from '@/theme/styles/app_login';
import { useAuth } from '@/features/auth/AuthProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Paleta de colores oficial adaptada al diseño premium
const COLORS = {
  primary: '#EBD600',       // Amarillo Campo Maq
  white: '#FFFFFF',         // Blanco
  black: '#1A1A1A',         // Casi negro para textos y elementos oscuros
  headerBg: '#121212',      // Negro profundo de fondo de la cabecera
  grayWarm: '#6B6660',      // Gris cálido para etiquetas e iconos secundarios
  grayText: '#8A8A8A',      // Gris para textos secundarios y pie de página
  grayLight: '#E5E5E5',     // Gris claro para bordes no enfocados y separadores
  danger: '#D64545',        // Rojo para errores
  pillBg: 'rgba(255, 255, 255, 0.12)', // Fondo de la píldora de sucursal
};

export default function LoginScreen() {
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de foco para el estilo premium de los inputs
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animación del halo / brillo y el tamaño del logo
  const [pulseAnim] = useState(() => new Animated.Value(0));

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleFocus = (field: 'email' | 'password') => {
    setFocusedField(field);
    setTimeout(() => {
      // Elevamos la pantalla a y: 220 para empujar ambos campos (Usuario y Contraseña)
      // por encima del teclado, manteniéndolos visibles simultáneamente.
      scrollViewRef.current?.scrollTo({ y: 220, animated: true });
    }, 100);
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Interpolación de escala para todo el conjunto (logo + brillo)
  const logoScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.06],
  });

  // Interpolación de opacidad para el brillo difuminado
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.20, 0.45],
  });

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;
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

  const handleQRLogin = () => {
    Alert.alert(
      'Ingreso con Código QR',
      'La autenticación por código QR no está configurada para este entorno. Por favor, ingresa con tus credenciales de usuario y contraseña.',
      [{ text: 'Entendido' }]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Para recuperar tu clave, por favor contacta al administrador de TI de Campo Maq.',
      [{ text: 'Aceptar' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.container,
            keyboardHeight > 0 && { paddingBottom: keyboardHeight + 80 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera Negra con Formas Decorativas */}
          <View style={styles.blackBand}>
            {/* Formas decorativas curvas grises con opacidad muy baja */}
            <View style={styles.curve1} />
            <View style={styles.curve2} />
            <View style={styles.curve3} />

            {/* Contenedor Animado para el Logo y el Brillo (titilar/respirar juntos) */}
            <Animated.View style={[
              styles.logoGroupContainer,
              {
                transform: [{ scale: logoScale }],
              }
            ]}>
              {/* Brillo amarillo pulsante y difuminado detrás del logo */}
              <Animated.View style={[
                styles.glowWrapper,
                {
                  opacity: glowOpacity,
                }
              ]}>
                <Image
                  source={require('@/assets/images/logo-glow.png')}
                  style={styles.glowImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Logo de Campo Maq centrado */}
              <Image
                source={require('@/assets/images/campomaq/campomaq.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Textos y Pill alineados abajo a la izquierda */}
            <View style={styles.heroTextContainer}>
              <Text style={styles.subtitleLeft}>PORTAL DE VENTAS</Text>
              <Text style={styles.titleLeft}>
                Bienvenido de vuelta,{"\n"}vendedor.
              </Text>
              
              <View style={styles.branchPill}>
                <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
                <Text style={styles.branchText}>Cayambe - Pichincha</Text>
                <Ionicons name="chevron-forward-sharp" size={11} color="rgba(255, 255, 255, 0.5)" />
              </View>
            </View>
          </View>

          {/* Formulario en Tarjeta Blanca */}
          <View style={styles.formContainer}>
            
            {/* Campo 1: Usuario */}
            <Text style={styles.fieldLabel}>USUARIO</Text>
            <Pressable 
              onPress={() => emailInputRef.current?.focus()}
              style={[
                styles.inputBox,
                focusedField === 'email' && styles.inputBoxFocused
              ]}
            >
              <Ionicons 
                name="person-outline" 
                size={18} 
                color={focusedField === 'email' ? COLORS.primary : COLORS.grayWarm} 
              />
              <TextInput
                ref={emailInputRef}
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="m.salinas@campomaq.ec"
                placeholderTextColor={COLORS.grayText}
                onFocus={() => handleFocus('email')}
                onBlur={() => setFocusedField(null)}
              />
            </Pressable>

            {/* Campo 2: Contraseña */}
            <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
            <Pressable 
              onPress={() => passwordInputRef.current?.focus()}
              style={[
                styles.inputBox,
                focusedField === 'password' && styles.inputBoxFocused
              ]}
            >
              <Ionicons 
                name="lock-closed-outline" 
                size={18} 
                color={focusedField === 'password' ? COLORS.primary : COLORS.grayWarm} 
              />
              <TextInput
                ref={passwordInputRef}
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholder="••••••••••••"
                placeholderTextColor={COLORS.grayText}
                onSubmitEditing={canSubmit ? handleSubmit : undefined}
                onFocus={() => handleFocus('password')}
                onBlur={() => setFocusedField(null)}
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
            </Pressable>

            {/* Fila Recordarme & Olvidaste Contraseña */}
            <View style={styles.rememberRow}>
              <Pressable
                onPress={() => setRememberMe((prev) => !prev)}
                style={styles.checkboxContainer}
                hitSlop={8}
              >
                <View style={[
                  styles.checkbox, 
                  rememberMe && styles.checkboxChecked
                ]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color={COLORS.black} />}
                </View>
                <Text style={styles.checkboxText}>Mantener sesión</Text>
              </Pressable>

              <Pressable onPress={handleForgotPassword} hitSlop={8}>
                <Text style={styles.forgotText}>¿Olvidaste tu clave?</Text>
              </Pressable>
            </View>

            {/* Caja de Error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Botón Iniciar Sesión (Amarillo) */}
            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
                pressed && !isSubmitting && styles.submitButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.black} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>INICIAR SESIÓN</Text>
              )}
            </Pressable>

            {/* Separador "o" */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>o</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Botón Código QR */}
            <Pressable
              onPress={handleQRLogin}
              style={({ pressed }) => [
                styles.qrButton,
                pressed && styles.qrButtonPressed,
              ]}
            >
              <Ionicons name="qr-code-outline" size={18} color={COLORS.black} />
              <Text style={styles.qrButtonText}>Ingresar con código QR</Text>
            </Pressable>
          </View>

          {/* Pie de Página */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>v2.4.1 · Cayambe - Pichincha</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

