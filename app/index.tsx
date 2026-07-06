import { Redirect } from 'expo-router';

/**
 * Ruta inicial de la app: siempre manda al login.
 *
 * TODO(Fase 1): cuando exista el AuthProvider, redirigir a /(tabs) si hay
 * una sesión guardada válida, y a /login si no la hay.
 */
export default function Index() {
  return <Redirect href="/login" />;
}
