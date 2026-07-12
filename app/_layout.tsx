import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';

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
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    // TODO: mostrar aquí LoadingScreen (src/components/common/LoadingScreen.tsx)
    // en vez de una pantalla en blanco (ver TODO en ese archivo).
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}
