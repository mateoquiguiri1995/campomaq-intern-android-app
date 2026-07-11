/**
 * Cliente HTTP central de la aplicación.
 *
 * Toda comunicación con el backend pasa por este archivo.
 * Ningún feature debe usar fetch() directamente.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'https://api-campomaq-ec.azurewebsites.net';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('[API]', options.method ?? 'GET', url);

    const response = await fetch(url, config);

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `HTTP ${response.status}: ${body || response.statusText}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('[API ERROR]', error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('No fue posible conectar con el servidor.');
  }
}

/**
 * GET
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint);
}