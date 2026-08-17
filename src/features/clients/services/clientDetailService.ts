import type { Client, ClientDetail } from '../types';

/**
 * Obtiene la ficha del cliente.
 *
 * /clients ya incluye los datos agregados y las facturas recientes, por lo
 * que esta función únicamente adapta el resumen al modelo de la ficha.
 */
export async function getClientDetail(client: Client): Promise<ClientDetail> {
  return {
    ...client,
    totalPurchases: client.totalPurchases ?? 0,
    purchaseCount: client.salesCountLast6Months ?? 0,
    scoreLabel: getFrequencyLabel(client.frequencyClassification),
    notes: [],
    invoices: client.recentInvoices ?? [],
  };
}

function getFrequencyLabel(value?: string): string {
  if (value === 'Highly recurrent') return 'Muy recurrente';
  if (value === 'Recurrent') return 'Recurrente';
  if (value === 'Occasional') return 'Ocasional';
  if (value === 'One-time') return 'Una vez';
  return 'Sin clasificación';
}
