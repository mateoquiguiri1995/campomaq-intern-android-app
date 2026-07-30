import { supabase } from '@/lib/supabase';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'https://api-campomaq-ec.azurewebsites.net';

// Azure App Service puede tardar en "despertar" tras estar inactivo.
// 25s da margen para eso sin dejar al usuario esperando indefinidamente.
const REQUEST_TIMEOUT_MS = 25000;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeader = await getAuthHeader();

  const config: RequestInit = {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort());
    }
  }

  let response: Response;
  try {
    console.log('[API]', options.method ?? 'GET', url);
    response = await fetch(url, { ...config, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'El servidor está tardando demasiado en responder. Verifica tu conexión e inténtalo de nuevo.'
      );
    }

    console.error('[API ERROR]', error);
    throw new Error('No fue posible conectar con el servidor.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && !isRetry) {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      return request<T>(endpoint, options, true);
    }
    await supabase.auth.signOut();
    throw new ApiError(401, 'Sesión expirada.');
  }

  if (!response.ok) {
    const body = await response.text();

    if (response.status === 401) {
      await supabase.auth.signOut();
    }

    throw new ApiError(response.status, body || response.statusText);
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET' });
}
