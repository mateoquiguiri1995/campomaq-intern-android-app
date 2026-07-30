import * as authService from '../services/authService';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

describe('authService tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loginWithPassword successfully signs in with password', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });

    await expect(
      authService.loginWithPassword({ email: 'test@example.com', password: 'password123' })
    ).resolves.not.toThrow();

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  test('loginWithPassword throws error on invalid credentials', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    await expect(
      authService.loginWithPassword({ email: 'test@example.com', password: 'wrongpassword' })
    ).rejects.toThrow('Credenciales inválidas');
  });

  test('logout signs out from supabase', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    await authService.logout();

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
