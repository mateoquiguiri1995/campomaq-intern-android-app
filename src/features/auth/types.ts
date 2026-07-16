export interface User {
  id: string;
  name: string;
  email: string;
  role: 'vendedor';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string; // access_token de Supabase vigente
}