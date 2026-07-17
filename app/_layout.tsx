import { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';

import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { AppBootstrapProvider, useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { SalesLoadingScreen } from '@/components/common/SalesLoadingScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Layout raíz de la app.
 *
 * Rutas protegidas con Stack.Protected: qué pantalla se monta depende de
 * si hay sesión (session) o no. Al iniciar sesión o cerrar sesión, el
 * AuthProvider actualiza `session` y el Stack cambia de rama solo — no
 * hace falta navegar manualmente a /login o /(tabs).
 */
const SESSION_MOUNT_KEY = Math.random().toString();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppBootstrapProvider>
        <StatusBar style="dark" />
        <RootNavigator key={SESSION_MOUNT_KEY} />
      </AppBootstrapProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, isLoading, hasSession } = useAuth();
  const { isLoading: isBootstrapping, progress: bootstrapProgress, error, reload } = useAppBootstrap();
  const [showSplash, setShowSplash] = useState(true);
  const [showSalesSplash, setShowSalesSplash] = useState(false);
  const prevHasSession = useRef(hasSession);

  useEffect(() => {
    if (hasSession && !prevHasSession.current) {
      setShowSalesSplash(true);
    }
    prevHasSession.current = hasSession;
  }, [hasSession]);

  if (showSplash) {
    return (
      <LoadingScreen
        title="Bienvenido"
        onComplete={() => setShowSplash(false)}
      />
    );
  }

  // Arranque en frío (sin sesión todavía confirmada por Supabase): validando
  // si hay una sesión guardada.
  if (isLoading && !hasSession) {
    return (
      <LoadingScreen
        title="Campo Maq"
        subtitle="Validando tu sesión"
        detail="Un momento, estamos preparando el acceso."
      />
    );
  }

  // hasSession ya es true (login recién hecho o sesión persistida): a partir
  // de acá /auth/me y la precarga de productos/clientes corren en paralelo,
  // así que se muestra una sola pantalla de carga hasta que ambos terminen.
  if (hasSession && error) {
    return (
      <LoadingScreen
        title="No pudimos preparar la app"
        subtitle="Revisa tu conexión e inténtalo de nuevo."
        detail={error}
        actionLabel="Reintentar"
        onAction={reload}
      />
    );
  }

  if (hasSession && (showSalesSplash || isLoading || isBootstrapping)) {
    // Cálculo de progreso combinado:
    // - Si el perfil de usuario (/auth/me) aún carga, aporta 0%, si ya cargó aporta 30%
    // - El bootstrap de datos (productos y clientes) aporta el otro 70% proporcionalmente
    const combinedProgress = Math.round((isLoading ? 0 : 30) + (bootstrapProgress * 0.7));

    return (
      <SalesLoadingScreen
        progress={combinedProgress}
        onComplete={() => setShowSalesSplash(false)}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="quotes" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}
