import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Layout raíz de la app.
 *
 * Flujo actual: login (mock) -> (tabs).
 *
 * TODO(Fase 1): envolver la app en un AuthProvider y redirigir a /login
 *   automáticamente cuando no haya sesión válida (rutas protegidas).
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
