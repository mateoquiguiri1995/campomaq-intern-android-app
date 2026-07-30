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
  const score = api.score || 'B';
  const purchasesByScore: Record<string, number> = {
    'A+': 6320,
    'A': 1250,
    'B': 980,
  };
  const datesByScore: Record<string, string> = {
    'A+': '2026-04-12',
    'A': '2026-01-05',
    'B': '2026-02-18',
  };

  return {
    id: api.id,
    name: api.name,
    ruc: api.id,
    email: api.email || undefined,
    phone: api.phonePrimary || api.phoneSecondary || undefined,
    location: api.address || undefined,
    score: score as ClientScore,
    hasPendingCredit: api.hasPendingCredit ?? false,
    totalPurchases: purchasesByScore[score] ?? 540,
    lastPurchaseDate: datesByScore[score] ?? '2025-11-30',
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
