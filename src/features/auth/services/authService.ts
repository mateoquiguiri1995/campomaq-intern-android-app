import { supabase } from '@/lib/supabase';
import type { LoginCredentials } from '../types';

/**
 * Inicia sesión contra Supabase Auth. El AuthProvider se entera del login a
 * través de supabase.auth.onAuthStateChange, no del valor de retorno.
 */
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

