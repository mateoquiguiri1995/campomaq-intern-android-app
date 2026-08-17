import { apiGet } from '@/api/client';

/**
 * Modelo EXACTO que devuelve el backend.
 * No debe modificarse para adaptarlo a la UI.
 */
export interface ApiClient {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phonePrimary?: string;
  phoneSecondary?: string | null;
  score?: 'A+' | 'A' | 'B';
  hasPendingCredit?: boolean;
  daysSinceLastPurchase?: number;
  frequencyClassification?: string;
  lastPurchaseDate?: string;
  purchaseMonthsLast6Months?: number;
  recencyStatus?: string;
  recentInvoices?: ApiClientInvoice[];
  salesCountLast6Months?: number;
  totalSalesLast6Months?: number;
}

export interface ApiClientInvoice {
  invoiceDate: string;
  invoiceNumber: number;
  itemCount: number;
  paymentType: string;
  total: number;
}

export interface ApiClientsPage {
  items: ApiClient[];
  /** Puede no venir: no está confirmado que el backend lo soporte todavía. */
  total?: number;
}

export interface GetClientsFromApiParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Obtiene clientes, con búsqueda opcional (?q=).
 *
 * Igual que /products, no hay contrato confirmado con el backend: puede
 * devolver el array plano directamente o envuelto en { items, total }. Se
 * normaliza acá para que el resto de la app no dependa de ese detalle.
 */
export async function getClientsFromApi(
  params: GetClientsFromApiParams = {}
): Promise<ApiClientsPage> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const query = searchParams.toString();
  const data = await apiGet<ApiClient[] | ApiClientsPage>(
    `/clients${query ? `?${query}` : ''}`
  );

  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }

  return { items: data.items ?? [], total: data.total };
}
