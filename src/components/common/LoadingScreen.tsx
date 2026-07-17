import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/common/Button';
import { spacing } from '@/theme/spacing';

interface LoadingScreenProps {
  title: string;
  subtitle?: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  progress?: number;
  onComplete?: () => void;
}

const TRACK_WIDTH = 240;
const SHIMMER_WIDTH = 70;

const getProgressMessage = (pct: number) => {
  if (pct <= 15) return 'Preparando el terreno...';
  if (pct <= 30) return 'Encendiendo motores de maquinaria...';
  if (pct <= 50) return 'Cargando catálogo de repuestos y motocultores...';
  if (pct <= 70) return 'Estableciendo conexión con el campo...';
  if (pct <= 85) return 'Sembrando datos en la aplicación...';
  if (pct <= 95) return 'Abonando configuración local...';
  return '¡Cosecha lista! Abriendo aplicación...';
};

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
  progress: progressProp,
  onComplete,
}: LoadingScreenProps) {
  const [progressState, setProgressState] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (progressProp !== undefined) {
      // Si recibimos el progreso por prop, no iniciamos simulación
      return;
    }
    if (actionLabel && onAction) {
      // No animar progreso en pantallas de error
      return;
    }

    // Simular progreso fluido de carga
    let interval: any;
    const duration = 1800; // 1.8 segundos (completa antes del temporizador de 2s)
    const step = 30; // cada 30ms
    const totalSteps = duration / step;
    let currentStep = 0;

    interval = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setProgressState(100);
        if (onComplete) {
          // Pequeño retraso de 150ms para que se registre visualmente el "100%" y el mensaje final
          setTimeout(() => {
            onComplete();
          }, 150);
        }
      } else {
        const ratio = currentStep / totalSteps;
        // Curva de aceleración/deceleración suave (cubic out)
        const easeOut = 1 - Math.pow(1 - ratio, 2.5);
        const nextProgress = Math.min(Math.round(easeOut * 100), 99);
        setProgressState(nextProgress);
      }
    }, step);

    return () => clearInterval(interval);
  }, [actionLabel, onAction, progressProp]);

  useEffect(() => {
    if (actionLabel && onAction) return;

    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();

    return () => loop.stop();
  }, [actionLabel, onAction, shimmerAnim]);

  const displayProgress = progressProp !== undefined ? progressProp : progressState;

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-TRACK_WIDTH, TRACK_WIDTH * 2],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.titleText}>{title}</Text>
        {!onAction && <Text style={styles.subtitleText}>MERCADO AGRÍCOLA</Text>}
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../../assets/images/campomaq/hero-ilustracion.png')}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      <View style={styles.bottomSection}>
        <Image
          source={require('../../../assets/images/campomaq/campomaq_logo_cropped.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {actionLabel && onAction ? (
          <View style={styles.actionContainer}>
            {subtitle ? <Text style={styles.errorSubtitle}>{subtitle}</Text> : null}
            {detail ? <Text style={styles.errorText}>{detail}</Text> : null}
            <View style={styles.buttonWrapper}>
              <Button label={actionLabel} variant="primary" onPress={onAction} />
            </View>
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressTrack} />
              <View style={[styles.progressFillWrapper, { width: `${displayProgress}%` }]}>
                <LinearGradient
                  colors={['#d9c400', '#efd800']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressFill}
                />
              </View>
              <Animated.View
                pointerEvents="none"
                style={[styles.shimmer, { transform: [{ translateX: shimmerTranslateX }] }]}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.65)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressText}>
              {getProgressMessage(displayProgress)} ({displayProgress}%)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f6',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: spacing.md,
  },
  titleText: {
    fontFamily: 'Barlow_600SemiBold',
    fontSize: 31,
    color: '#282420',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  subtitleText: {
    fontFamily: 'Barlow_600SemiBold',
    fontSize: 11,
    color: '#e9d802', // Mismo tono de amarillo que el logo
    letterSpacing: 3,
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  illustrationContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: 20,
    paddingHorizontal: spacing.md,
  },
  logo: {
    width: 206,
    height: 206 / 3.85,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  buttonWrapper: {
    width: '60%',
  },
  errorSubtitle: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 14,
    color: '#6b665d',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  errorText: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 12,
    color: '#D64545',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: TRACK_WIDTH,
    height: 8,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(40,36,32,0.10)',
    borderRadius: 99,
  },
  progressFillWrapper: {
    height: '100%',
    borderRadius: 99,
    overflow: 'hidden',
    shadowColor: 'rgba(233,210,0,0.55)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  progressFill: {
    flex: 1,
    borderRadius: 99,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
  },
  progressText: {
    fontFamily: 'Barlow_500Medium',
    fontSize: 13,
    color: '#6b665d',
    textAlign: 'center',
  },
});
