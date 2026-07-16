import { supabase } from '@/lib/supabase';
import type { LoginCredentials } from '../types';

// =============================================================================
// MODO DESARROLLO: backend aún no expone GET /auth/me, así que el login real
// con Supabase (comentado abajo) no puede completarse todavía (AuthProvider
// necesita /auth/me para armar la sesión). Mientras tanto se usa un login
// mock más abajo para poder seguir desarrollando el resto de la app.
//
// Cuando el backend tenga listo GET /auth/me:
//   1) Borra el bloque "MOCK" de este archivo (más abajo).
//   2) Descomenta el bloque "REAL (Supabase)" de aquí abajo.
//   3) Haz lo mismo en src/features/auth/AuthProvider.tsx (tiene los mismos
//      bloques REAL/MOCK marcados igual).
// =============================================================================

// ---------------------------- REAL (Supabase) -------------------------------
// /**
//  * Inicia sesión contra Supabase Auth. El AuthProvider se entera del login a
//  * través de supabase.auth.onAuthStateChange, no del valor de retorno.
//  */
export async function loginWithPassword(credentials: LoginCredentials): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  if (!error) return;

  if (error.message.includes('Invalid login credentials')) {
    throw new Error('Credenciales inválidas');
  }
  if (error.message.includes('Email not confirmed')) {
    throw new Error('Correo no confirmado');
  }
  throw new Error(error.message);
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('[logout] Error al cerrar sesión en Supabase:', error);
  }
}

// ----------------------- MOCK (temporal, sin backend) ------------------------
// Acepta cualquier correo/password (no valida contra Supabase ni el backend).
// Borrar este bloque cuando /auth/me esté listo y se reactive el de arriba.
// export async function loginWithPassword(credentials: LoginCredentials): Promise<void> {
//   await new Promise((resolve) => setTimeout(resolve, 300));

//   if (!credentials.email.trim() || !credentials.password) {
//     throw new Error('Credenciales inválidas');
//   }
// }

// export async function logout(): Promise<void> {
//   // Mock: no hay nada que limpiar del lado del servidor todavía.
// }
