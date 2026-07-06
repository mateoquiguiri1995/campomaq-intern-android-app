import type { AuthSession, LoginCredentials } from '../types';

/**
 * Servicio de autenticación.
 *
 * FASE ACTUAL: mock. Acepta cualquier credencial y devuelve una sesión falsa.
 *
 * TODO(Fase 1): llamar al endpoint real de login del backend Campo Maq
 *   usando apiClient (src/api/client.ts).
 * TODO(Fase 1): guardar el token con expo-secure-store (NUNCA en AsyncStorage
 *   plano ni en variables EXPO_PUBLIC_*).
 * TODO(Fase 1): crear un AuthProvider que exponga la sesión a toda la app
 *   y proteja las rutas de (tabs).
 * TODO(Futuro): login con código QR (por ahora es solo un botón deshabilitado).
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  // Simula la latencia de una petición de red.
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    user: {
      id: 'mock-user-1',
      name: 'Vendedor Demo',
      email: credentials.email || 'vendedor@campomaq.ec',
      role: 'vendedor',
    },
    token: 'mock-token',
  };
}

/**
 * TODO(Fase 1): implementar logout real (borrar token de SecureStore
 * y volver a la pantalla de login).
 */
export async function logout(): Promise<void> {
  // Mock: no hay nada que limpiar todavía.
}
