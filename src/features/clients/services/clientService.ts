import type { Client, ClientScore } from '../types';
import { getClientsFromApi, type ApiClient } from '../api/clientApi';

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

export function mapApiClient(api: ApiClient): Client {
  return {
    id: api.id,
    name: api.name,
    ruc: api.id,
    email: api.email || undefined,
    phone: api.phonePrimary || api.phoneSecondary || undefined,
    location: api.address || undefined,
    score: api.score as ClientScore,
    hasPendingCredit: api.hasPendingCredit ?? false,
    totalPurchases: undefined,
    lastPurchaseDate: undefined,
  };
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
