import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { formatCurrency } from '@/utils/currency';

import type { Quote } from '../types';
import { getLineTotal, getQuoteTotals, getUnitPrice } from './quoteCalculations';
import { getClientDisplayName, getClientDisplaySubtitle } from './quoteClient';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml(quote: Quote): string {
  const { subtotal, iva, total } = getQuoteTotals(quote.items);
  const clientName = escapeHtml(getClientDisplayName(quote.client));
  const clientSubtitle = getClientDisplaySubtitle(quote.client);
  const date = new Date(quote.createdAt).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rows = quote.items
    .map((item) => {
      const unitPrice = getUnitPrice(item.product, item.priceTier);
      return `
        <tr>
          <td>${escapeHtml(item.product.code)}</td>
          <td>${escapeHtml(item.product.name)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(unitPrice)}</td>
          <td class="num">${item.discountPct ? `${item.discountPct}%` : '-'}</td>
          <td class="num">${formatCurrency(getLineTotal(item))}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Helvetica, Arial, sans-serif; color: #1A1A1A; padding: 24px; }
          h1 { margin-bottom: 0; }
          .muted { color: #4A4A4A; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { padding: 8px; border-bottom: 1px solid #E5E5E5; font-size: 13px; text-align: left; }
          th { background: #F5F5F5; }
          .num { text-align: right; }
          .totals { margin-top: 16px; width: 260px; margin-left: auto; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .totals-row.total {
            font-weight: 700;
            font-size: 16px;
            border-top: 1px solid #1A1A1A;
            padding-top: 8px;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <h1>Campo Maq</h1>
        <p class="muted">Cotización · ${date}</p>

        <p><strong>Cliente:</strong> ${clientName}</p>
        ${clientSubtitle ? `<p class="muted">${escapeHtml(clientSubtitle)}</p>` : ''}

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th class="num">Cant.</th>
              <th class="num">P. Unit.</th>
              <th class="num">Desc.</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
          <div class="totals-row"><span>IVA (15%)</span><span>${formatCurrency(iva)}</span></div>
          <div class="totals-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
        </div>

        <p class="muted" style="margin-top:32px;">
          Documento generado desde la app de ventas de Campo Maq. No constituye factura.
        </p>
      </body>
    </html>
  `;
}

/** Genera el PDF en el dispositivo y devuelve la ruta local del archivo. */
export async function generateQuotePdf(quote: Quote): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html: buildHtml(quote) });
  return uri;
}

/** Genera el PDF y abre el share sheet de Android (WhatsApp, correo, etc.). */
export async function shareQuotePdf(quote: Quote): Promise<void> {
  const uri = await generateQuotePdf(quote);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Compartir no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartir cotización',
    UTI: 'com.adobe.pdf',
  });
}
