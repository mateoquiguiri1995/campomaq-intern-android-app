import { ApiError, apiGet } from '@/api/client';
import { supabase } from '@/lib/supabase';
import * as secureStore from '@/utils/secureStore';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import * as authService from './services/authService';
import type { AuthSession, LoginCredentials } from './types';

const AVATAR_OVERRIDE_KEY = 'campomaq-avatar-override';
const MOCK_SESSION_KEY = 'campomaq-mock-session';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  /**
   * true en cuanto Supabase confirma credenciales válidas, incluso antes de
   * que /auth/me termine de traer el perfil. Sirve para arrancar la
   * precarga de productos/clientes en paralelo con /auth/me en lugar de
   * esperar a que `session` (perfil completo) esté listo.
   */
  hasSession: boolean;
  loginWithPassword: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
}

interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: 'vendedor';
  avatarUrl?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// MODO DESARROLLO: backend aún no expone GET /auth/me, así que el AuthProvider
// real (comentado más abajo, íntegro) no puede completar el login. Mientras
// tanto se usa el AuthProvider MOCK de aquí abajo para poder seguir
// desarrollando el resto de la app sin backend.
//
// Cuando el backend tenga listo GET /auth/me:
//   1) Borra la función AuthProvider "MOCK" de aquí abajo.
//   2) Descomenta la función AuthProvider "REAL (Supabase + /auth/me)" que
//      está comentada al final de este archivo.
//   3) Revierte src/features/auth/services/authService.ts al bloque REAL
//      (mismo tipo de marcador ahí).
// =============================================================================

// ----------------------- AuthProvider (MOCK, activo) -------------------------
// Login sin backend: cualquier correo/password entra y se guarda una sesión
// falsa en SecureStore para no perderla al recargar la app.
// export function AuthProvider({ children }: PropsWithChildren) {
//   const [session, setSession] = useState<AuthSession | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true;

//     SecureStore.getItemAsync(MOCK_SESSION_KEY).then((stored) => {
//       if (!isMounted) return;
//       if (stored) setSession(JSON.parse(stored) as AuthSession);
//       setIsLoading(false);
//     });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   async function loginWithPassword(credentials: LoginCredentials) {
//     await authService.loginWithPassword(credentials);

//     const email = credentials.email.trim() || 'vendedor@campomaq.ec';
//     const localPart = email.split('@')[0] ?? '';
//     const words = localPart.split(/[._+-]+/).filter(Boolean);
//     const name =
//       words.length > 0
//         ? words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
//         : 'Vendedor Demo';

//     const avatarOverride = await SecureStore.getItemAsync(AVATAR_OVERRIDE_KEY);

//     const mockSession: AuthSession = {
//       user: {
//         id: 'mock-user-1',
//         name,
//         email,
//         role: 'vendedor',
//         avatar:
//           avatarOverride ??
//           `https://ui-avatars.com/api/?name=${encodeURIComponent(name).replace(/%20/g, '+')}&background=F5B800&color=1A1A1A&size=128&bold=true`,
//       },
//       token: 'mock-token',
//     };

//     setSession(mockSession);
//     await SecureStore.setItemAsync(MOCK_SESSION_KEY, JSON.stringify(mockSession));
//   }

//   async function logout() {
//     await authService.logout();
//     await SecureStore.deleteItemAsync(MOCK_SESSION_KEY);
//     setSession(null);
//   }

//   async function updateAvatar(uri: string) {
//     if (!session) return;
//     await SecureStore.setItemAsync(AVATAR_OVERRIDE_KEY, uri);
//     const next = { ...session, user: { ...session.user, avatar: uri } };
//     setSession(next);
//     await SecureStore.setItemAsync(MOCK_SESSION_KEY, JSON.stringify(next));
//   }

//   return (
//     <AuthContext.Provider value={{ session, isLoading, loginWithPassword, logout, updateAvatar }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// -------------------- AuthProvider (REAL - Supabase + /auth/me) --------------
// Descomentar esta función completa (y borrar la función AuthProvider MOCK de
// arriba) cuando el backend tenga listo GET /auth/me.
//
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProfile(accessToken: string) {
    try {
      const me = await apiGet<MeResponse>('/auth/me');
      const avatarOverride = await secureStore.getItemAsync(AVATAR_OVERRIDE_KEY);

      setSession({
        user: {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          avatar: avatarOverride ?? me.avatarUrl,
        },
        token: accessToken,
      });
    } catch (error) {
      console.warn('[Auth] /auth/me falló:', error);
      // Token sin cuenta de vendedor activa (403) o inválido (401): no hay
      // forma de continuar, se cierra la sesión. Otros errores (red, 500)
      // ya fueron manejados/reintentados por el cliente HTTP.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await supabase.auth.signOut();
      }
      setSession(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      if (!newSession) {
        setHasSession(false);
        setSession(null);
        setIsLoading(false);
        return;
      }

      // Credenciales ya válidas para Supabase: establecemos una sesión preliminar
      // rápida con los datos de Supabase Auth (como el email) para que la pantalla
      // de carga pueda mostrar el nombre del vendedor desde el 0%.
      setSession({
        user: {
          id: newSession.user.id,
          name: '',
          email: newSession.user.email ?? '',
          role: 'vendedor',
        },
        token: newSession.access_token,
      });

      setHasSession(true);
      setIsLoading(true);
      await loadProfile(newSession.access_token);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function loginWithPassword(credentials: LoginCredentials) {
    await authService.loginWithPassword(credentials);
  }

  async function logout() {
    await authService.logout();
  }

  async function updateAvatar(uri: string) {
    if (!session) return;
    await secureStore.setItemAsync(AVATAR_OVERRIDE_KEY, uri);
    setSession({ ...session, user: { ...session.user, avatar: uri } });
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, hasSession, loginWithPassword, logout, updateAvatar }}>
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
