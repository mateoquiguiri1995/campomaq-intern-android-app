import type { ApiClient } from '../api/clientApi';
import type { Client } from '../types';

export function mapApiClient(apiClient: ApiClient): Client {
  return {
    id: apiClient.id,
    name: apiClient.name,
    ruc: apiClient.id,
    email: apiClient.email,
    phone: apiClient.phonePrimary ?? apiClient.phoneSecondary ?? undefined,
    phoneSecondary: apiClient.phoneSecondary ?? undefined,
    location: apiClient.address,
    score: apiClient.score,
    hasPendingCredit: apiClient.hasPendingCredit,
    totalPurchases: apiClient.totalSalesLast6Months ?? 0,
    lastPurchaseDate: apiClient.lastPurchaseDate,
    daysSinceLastPurchase: apiClient.daysSinceLastPurchase,
    frequencyClassification: apiClient.frequencyClassification,
    purchaseMonthsLast6Months: apiClient.purchaseMonthsLast6Months,
    recencyStatus: apiClient.recencyStatus,
    salesCountLast6Months: apiClient.salesCountLast6Months ?? 0,
    recentInvoices: apiClient.recentInvoices?.map((invoice) => ({
      id: `${apiClient.id}-${invoice.invoiceNumber}`,
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
