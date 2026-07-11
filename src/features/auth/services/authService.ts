import type { AuthSession, LoginCredentials } from '../types';

/**
 * Servicio de autenticación.
 *
 * FASE ACTUAL: loginWithPassword es mock y devuelve una sesión falsa.
 * Cuando exista el backend, se reemplaza por la llamada real sin que el
 * AuthProvider ni las pantallas se enteren.
 */

/** Deriva un nombre "humano" a partir de la parte local del email, solo para el mock. */
function deriveNameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const words = localPart.split(/[._+-]+/).filter(Boolean);
  if (words.length === 0) return 'Vendedor Demo';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function mockSession(email?: string): Promise<AuthSession> {
  // Simula la latencia de una petición de red.
  await new Promise((resolve) => setTimeout(resolve, 300));

  const resolvedEmail = email || 'vendedor@campomaq.ec';
  const name = deriveNameFromEmail(resolvedEmail);

  return {
    user: {
      id: 'mock-user-1',
      name,
      email: resolvedEmail,
      role: 'vendedor',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name).replace(/%20/g, '+')}&background=F5B800&color=1A1A1A&size=128&bold=true`,
    },
    token: 'mock-token',
  };
}

/**
 * TODO(Fase 1): POST /auth/login con email + password contra la tabla de
 *   usuarios real, vía apiClient (src/api/client.ts).
 */
export async function loginWithPassword(credentials: LoginCredentials): Promise<AuthSession> {
  return mockSession(credentials.email);
}

/**
 * TODO(Fase 1): notificar al backend para invalidar la sesión del lado
 *   del servidor (el borrado del token local lo hace el AuthProvider).
 */
export async function logout(): Promise<void> {
  // Mock: no hay nada que limpiar del lado del servidor todavía.
}