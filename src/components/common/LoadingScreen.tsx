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
  const [shimmerAnim] = useState(() => new Animated.Value(0));

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

import { styles } from '@/theme/styles/src_components_common_LoadingScreen';
