import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import * as authService from './services/authService';
import type { AuthSession, LoginCredentials } from './types';

const SESSION_KEY = 'campomaq-auth-session';

interface AuthContextValue {
  session: AuthSession | null;
  /** true mientras se revisa si hay una sesión guardada al abrir la app. */
  isLoading: boolean;
  loginWithPassword: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Actualiza la foto de perfil solo en caché local (SecureStore), sin
   * llamar al backend: por ahora la app únicamente consulta datos.
   */
  updateAvatar: (uri: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sesión global de autenticación. Envuelve toda la app en app/_layout.tsx.
 *
 * FASE ACTUAL: el token y el usuario se guardan juntos en SecureStore y se
 * restauran tal cual al abrir la app.
 *
 * TODO(Fase 1): cuando exista el backend real, restaurar la sesión con
 *   GET /auth/me usando el token guardado, en vez de confiar en los datos
 *   tal como quedaron guardados (el token pudo haber expirado).
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(SESSION_KEY).then((stored) => {
      if (stored) {
        setSession(JSON.parse(stored) as AuthSession);
      }
      setIsLoading(false);
    });
  }, []);

  async function persistSession(next: AuthSession) {
    setSession(next);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
  }

  async function loginWithPassword(credentials: LoginCredentials) {
    await persistSession(await authService.loginWithPassword(credentials));
  }

  async function logout() {
    await authService.logout();
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setSession(null);
  }

  async function updateAvatar(uri: string) {
    if (!session) return;
    await persistSession({ ...session, user: { ...session.user, avatar: uri } });
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, loginWithPassword, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return ctx;
}
