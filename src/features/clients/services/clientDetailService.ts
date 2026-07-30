import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Client, ClientDetail, ClientInvoice } from '../types';

/**
 * Obtiene la ficha del cliente.
 */
export async function getClientDetail(client: Client): Promise<ClientDetail> {
  return {
    ...client,
    totalPurchases: 0,
    purchaseCount: 0,
    scoreLabel: client.score ?? 'B',
    contactName: undefined,
    notes: [],
    invoices: [],
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
