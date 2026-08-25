import type { Client } from '../types';
import { getClientsFromApi } from '../api/clientApi';
import { mapApiClient } from './clientMapper';

export type { ApiClient } from '../api/clientApi';
export { mapApiClient };

export interface GetClientsParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface ClientsResult {
  clients: Client[];
  page: number;
  total?: number;
}

export async function getClients(params: GetClientsParams = {}): Promise<ClientsResult> {
  const result = await getClientsFromApi({
    q: params.q,
    page: params.page,
    pageSize: params.pageSize,
  });

  return {
    clients: result.items.map(mapApiClient),
    page: params.page ?? 1,
    total: result.total ?? result.items.length,
  };
}

/**
 * Cartera completa de clientes, para filtrar por búsqueda/estado en el
 * cliente. Sin `page`, el backend devuelve todos los clientes asignados.
 */
export async function getAllClients(): Promise<Client[]> {
  const result = await getClientsFromApi();
  return result.items.map(mapApiClient);
}

/**
 * Busca clientes por nombre, RUC o datos de contacto.
 */
export async function searchClients(query: string): Promise<Client[]> {
  if (!query.trim()) {
    return getAllClients();
  }

  const result = await getClientsFromApi({ q: query });
  return result.items.map(mapApiClient);
}
