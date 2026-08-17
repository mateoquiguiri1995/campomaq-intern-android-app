import type { Client } from '../types';
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
    phoneSecondary: api.phoneSecondary || undefined,
    location: api.address || undefined,
    totalPurchases: api.totalSalesLast6Months ?? 0,
    lastPurchaseDate: api.lastPurchaseDate,
    daysSinceLastPurchase: api.daysSinceLastPurchase,
    frequencyClassification: api.frequencyClassification,
    purchaseMonthsLast6Months: api.purchaseMonthsLast6Months,
    recencyStatus: api.recencyStatus,
    salesCountLast6Months: api.salesCountLast6Months ?? 0,
    recentInvoices: api.recentInvoices?.map((invoice) => ({
      id: `${api.id}-${invoice.invoiceNumber}`,
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.invoiceDate,
      code: `Factura #${invoice.invoiceNumber}`,
      name: 'Factura de venta',
      itemCount: invoice.itemCount,
      paymentMethod: invoice.paymentType,
      total: invoice.total,
    })) ?? [],
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
