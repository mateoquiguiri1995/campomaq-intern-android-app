/**
 * Cliente HTTP central de la app.
 *
 * IMPORTANTE: la app NUNCA se conecta directamente a Postgres.
 * Toda la data pasa por el backend API de Campo Maq:
 *
 *   Pantalla -> hook/servicio -> apiClient -> Backend API -> Postgres
 *
 * En esta fase (esqueleto) NO se hacen peticiones reales.
 * Los servicios de cada feature devuelven datos mock.
 */

// TODO(Fase 1): leer la URL base desde process.env.EXPO_PUBLIC_API_BASE_URL
//   (ver .env.example). Nunca poner secretos en variables EXPO_PUBLIC_*.
// TODO(Fase 1): agregar el header "Authorization: Bearer <token>" con el
//   token guardado en SecureStore después del login real.
// TODO(Fase 1): manejo de errores centralizado (red caída, 401, 500, timeout)
//   con mensajes claros en español para el vendedor.
// TODO(Fase 1): manejo de refresh token / re-login cuando el token expire.

export const API_BASE_URL = 'https://api.example.com'; // placeholder

/**
 * Placeholder del cliente API. En la Fase 1 esto se reemplaza por una
 * función que use fetch() contra el backend real.
 */
export async function apiGet<T>(_path: string): Promise<T> {
  throw new Error(
    'apiGet aún no está implementado. En esta fase usa los servicios mock de cada feature.'
  );
}
