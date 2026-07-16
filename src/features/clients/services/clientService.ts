import { getClientsFromApi, type GetClientsFromApiParams } from '../api/clientApi';
import type { Client } from '../types';
import { mapApiClient } from './clientMapper';

export interface GetClientsParams extends GetClientsFromApiParams {}

export interface ClientsResult {
  clients: Client[];
  page: number;
  /** Puede no venir si el backend todavía no soporta paginación real. */
  total?: number;
}

/**
 * Obtiene clientes desde la API, paginados y con búsqueda opcional (params.q).
 */
export async function getClients(params: GetClientsParams = {}): Promise<ClientsResult> {
  const data = await getClientsFromApi(params);

  return {
    clients: data.items.map(mapApiClient),
    page: params.page ?? 1,
    total: data.total,
  };
}
