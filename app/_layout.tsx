import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { AppBootstrapProvider, useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { LoadingScreen } from '@/components/common/LoadingScreen';

/**
 * Layout raíz de la app.
 *
 * Rutas protegidas con Stack.Protected: qué pantalla se monta depende de
 * si hay sesión (session) o no. Al iniciar sesión o cerrar sesión, el
 * AuthProvider actualiza `session` y el Stack cambia de rama solo — no
 * hace falta navegar manualmente a /login o /(tabs).
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppBootstrapProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppBootstrapProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, isLoading, hasSession } = useAuth();
  const { isLoading: isBootstrapping, error, reload } = useAppBootstrap();

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

  if (hasSession && (isLoading || isBootstrapping)) {
    return (
      <LoadingScreen
        title="Bienvenido"
        subtitle="Preparando productos y clientes"
        detail="Estamos cargando la información inicial para que entres más rápido."
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
