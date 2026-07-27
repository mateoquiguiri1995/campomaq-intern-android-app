import type { ApiClient } from '../api/clientApi';
import type { Client } from '../types';

export function mapApiClient(apiClient: ApiClient): Client {
  return {
    id: apiClient.id,
    name: apiClient.name,
    ruc: apiClient.id,
    email: apiClient.email,
    phone: apiClient.phonePrimary,
    location: apiClient.address,
    score: apiClient.score,
    hasPendingCredit: apiClient.hasPendingCredit,
  };
}
