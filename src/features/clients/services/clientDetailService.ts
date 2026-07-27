import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Client, ClientDetail, ClientInvoice } from '../types';

function buildMockInvoices(clientId: string): ClientInvoice[] {
  return [
    {
      id: `${clientId}-invoice-1`,
      issuedAt: '2026-07-11',
      code: 'FAC-001-002-000184',
      name: 'Compra de maquinaria y repuestos',
      itemCount: 4,
      paymentMethod: 'Transferencia bancaria',
      status: 'paid',
      total: 2450,
    },
    {
      id: `${clientId}-invoice-2`,
      issuedAt: '2026-04-24',
      code: 'FAC-001-002-000129',
      name: 'Repuestos y mantenimiento',
      itemCount: 2,
      paymentMethod: 'Tarjeta',
      status: 'paid',
      total: 980.5,
    },
    {
      id: `${clientId}-invoice-3`,
      issuedAt: '2025-10-03',
      code: 'FAC-001-002-000071',
      name: 'Implementos agrícolas',
      itemCount: 6,
      paymentMethod: 'Crédito',
      status: 'pending',
      total: 620,
    },
  ];
}

/**
 * Obtiene la ficha del cliente.
 *
 * Por ahora usa datos mock. Cuando el backend exponga el detalle, reemplazar
 * este bloque por la llamada comentada sin cambiar la pantalla.
 */
export async function getClientDetail(client: Client): Promise<ClientDetail> {
  // const data = await apiGet<ApiClientDetail>(`/clients/${encodeURIComponent(client.id)}`);
  // return mapApiClientDetail(data);

  const invoices = buildMockInvoices(client.id);

  return {
    ...client,
    totalPurchases: invoices.reduce((total, invoice) => total + invoice.total, 0),
    purchaseCount: invoices.length,
    scoreLabel: 'A+',
    notes: [
      'Prefiere confirmar entregas por llamada telefónica.',
      'Cliente frecuente de repuestos e implementos agrícolas.',
    ],
    invoices,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Genera localmente un PDF de demostración de una factura mock. */
export async function downloadMockInvoicePdf(invoice: ClientInvoice, clientName: string): Promise<void> {
  const html = `
    <html>
      <body style="font-family: Arial; padding: 32px; color: #1A1A1A;">
        <h1>Factura ${escapeHtml(invoice.code)}</h1>
        <p><strong>Cliente:</strong> ${escapeHtml(clientName)}</p>
        <p><strong>Fecha de emisión:</strong> ${escapeHtml(invoice.issuedAt)}</p>
        <p><strong>Concepto:</strong> ${escapeHtml(invoice.name)}</p>
        <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
        <p>Documento de demostración generado localmente.</p>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error('El PDF fue generado, pero compartir no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Guardar o compartir factura',
    UTI: 'com.adobe.pdf',
  });
}
