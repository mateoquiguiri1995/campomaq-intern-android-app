import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/features/auth/AuthProvider';

interface SalesLoadingScreenProps {
  progress?: number;
  onComplete?: () => void;
}

const getProgressMessage = (pct: number) => {
  if (pct < 26) return 'Inicializando Campomaq';
  if (pct <= 51) return 'Cargando inventario';
  if (pct <= 77) return 'Sincronizando ventas';
  if (pct <= 99) return 'Ya casi terminamos';
  return '¡Todo listo!';
};

export function SalesLoadingScreen({ progress: progressProp, onComplete }: SalesLoadingScreenProps) {
  const { session } = useAuth();
  const [progressState, setProgressState] = useState(0);
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Animación del saludo 👋
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [waveAnim]);

  // Rotaciones: 16° / -8° / 14° / -4°
  const rotation = waveAnim.interpolate({
    inputRange: [0, 0.12, 0.24, 0.36, 0.48, 0.60, 1],
    outputRange: ['0deg', '16deg', '-8deg', '14deg', '-4deg', '0deg', '0deg'],
  });

  // Efecto para llamar a onComplete en caso de progreso real por prop
  useEffect(() => {
    if (progressProp === 100 && onComplete) {
      const t = setTimeout(() => {
        onComplete();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [progressProp, onComplete]);

  // Simulación local de progreso en caso de que no venga la prop (útil para pruebas)
  useEffect(() => {
    if (progressProp !== undefined) {
      return;
    }

    const duration = 2200; // Duración exacta de la pantalla de bienvenida (2.2 segundos)
    const step = 30; // cada 30ms
    const totalSteps = duration / step;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setProgressState(100);
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 150);
        }
      } else {
        const ratio = currentStep / totalSteps;
        // Curva cubic out: arranca rápido, desacelera al final
        const easeOut = 1 - Math.pow(1 - ratio, 2.5);
        const nextProgress = Math.min(Math.round(easeOut * 100), 99);
        setProgressState(nextProgress);
      }
    }, step);

    return () => clearInterval(interval);
  }, [progressProp, onComplete]);

  const displayProgress = progressProp !== undefined ? progressProp : Math.round(progressState);

  // Generamos los 20 ticks
  const activeTicksCount = Math.round((displayProgress / 100) * 20);
  const ticks = Array.from({ length: 20 }, (_, i) => i < activeTicksCount);

  // Nombre del vendedor (obtenido dinámicamente y con fallback de correo para evitar "Vendedor X")
  const getSellerName = () => {
    if (session?.user?.name && session.user.name.trim().length > 0) {
      return session.user.name;
    }
    if (session?.user?.email) {
      const email = session.user.email;
      const localPart = email.split('@')[0] ?? '';
      const words = localPart.split(/[._+-]+/).filter(Boolean);
      if (words.length > 0) {
        return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }
    return 'Vendedor';
  };

  const sellerName = getSellerName();

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      {/* 1. Cabecera */}
      <View style={styles.header}>
        <Text style={styles.label}>PANEL DE VENTAS</Text>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Hola, {sellerName}</Text>
          <Animated.View style={[styles.emojiContainer, { transform: [{ rotate: rotation }] }]}>
            <Text style={styles.emoji}>👋</Text>
          </Animated.View>
        </View>

        {/* Borde inferior diagonal (banda blanca) */}
        <View style={[styles.topTriangle, { borderLeftWidth: screenWidth }]} />
      </View>

      {/* 2. Imagen */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/images/tienda.png')}
          style={styles.image}
          contentFit="cover"
          contentPosition={{ top: '48%', left: '50%' }}
        />
        
        {/* Corte diagonal inferior en blanco */}
        <View style={[styles.bottomTriangle, { borderRightWidth: screenWidth }]} />
      </View>

      {/* 3. Pie / barra de progreso */}
      <View style={styles.pie}>
        {/* Fila superior: logo y porcentaje */}
        <View style={styles.pieHeader}>
          <Image
            source={require('../../../assets/images/campomaq.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>{displayProgress}</Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>

        {/* Barra segmentada */}
        <View style={styles.ticksContainer}>
          {ticks.map((isActive, index) => (
            <View
              key={index}
              style={[
                styles.tick,
                { backgroundColor: isActive ? '#F5B800' : '#ececec' }
              ]}
            />
          ))}
        </View>

        {/* Fila inferior: mensaje de estado y garantía */}
        <View style={styles.pieFooter}>
          <Text style={styles.messageText}>{getProgressMessage(displayProgress)}</Text>
          <Text style={styles.guaranteeText}>GARANTIZAMOS NUESTRO SERVICIO</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#F5B800',
    paddingTop: 64, // Ajustado para dar más margen superior nativo (SafeArea)
    paddingHorizontal: 28,
    paddingBottom: 38,
    position: 'relative',
    zIndex: 2,
  },
  label: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: '#8a7100',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'Barlow_700Bold', // Usamos el Barlow cargado en la app
    fontSize: 28,
    color: '#141414',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  emojiContainer: {
    marginLeft: 8,
    transformOrigin: ['70%', '70%', 0],
  },
  emoji: {
    fontSize: 26,
    lineHeight: 34,
  },
  topTriangle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 26,
    borderLeftColor: 'transparent',
    borderBottomWidth: 26,
    borderBottomColor: '#ffffff',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f5f7',
    marginTop: -26, // Se solapa para que el triángulo superior de la cabecera corte la imagen
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomTriangle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 30,
    borderRightColor: 'transparent',
    borderBottomWidth: 30,
    borderBottomColor: '#ffffff',
    zIndex: 2,
  },
  pie: {
    backgroundColor: '#ffffff',
    paddingTop: 14,
    paddingHorizontal: 28,
    paddingBottom: 40, // Más padding inferior para el área segura de dispositivos sin barra de inicio
    position: 'relative',
    zIndex: 3,
  },
  pieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: {
    width: 132,
    height: 132 / 3.85,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentageText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 32,
    color: '#17181a',
    lineHeight: 32,
  },
  percentSymbol: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 16,
    color: '#c99f00',
    marginLeft: 1,
  },
  ticksContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 12,
    marginBottom: 16,
    width: '100%',
  },
  tick: {
    flex: 1,
    height: 12,
    borderRadius: 3,
  },
  pieFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    gap: 12,
  },
  messageText: {
    fontFamily: 'Barlow_600SemiBold',
    fontSize: 13.5,
    color: '#4a4b4d',
    flex: 1,
    lineHeight: 18,
  },
  guaranteeText: {
    fontFamily: 'Barlow_600SemiBold',
    fontSize: 9.5,
    letterSpacing: 2,
    color: '#bcb489',
    width: 130,
    textAlign: 'right',
    textTransform: 'uppercase',
    lineHeight: 13,
  },
});
