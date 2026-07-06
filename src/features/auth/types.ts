/** Tipos del módulo de autenticación. */

export interface User {
  id: string;
  name: string;
  email: string;
  /** Rol del usuario. Por ahora solo hay vendedores. */
  role: 'vendedor';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  /** Token JWT del backend. Mock en esta fase. */
  token: string;
}
