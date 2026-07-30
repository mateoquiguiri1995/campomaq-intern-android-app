import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { User } from '@/features/auth/types';
import { formatCurrency } from '@/utils/currency';

import type { Quote } from '../types';
import { getQuoteTotals, getUnitPrice } from './quoteCalculations';
import images from './pdf/images.json';
import { buildClientHtml, buildSellerHtml, buildTableRows, formatQuoteDate } from './pdf/helpers';
import { getTemplate } from './pdf/template';

function buildHtml(quote: Quote, seller?: User): string {
  const { iva, total } = getQuoteTotals(quote.items);
  
  // Desglose de totales para cumplir con el formato corporativo
  let grossSubtotal = 0;
  let totalDiscount = 0;
  
  quote.items.forEach((item) => {
    const unitPrice = getUnitPrice(item.product, item.priceTier);
    const grossLine = unitPrice * item.quantity;
    const discountLine = item.discountPct ? grossLine * (item.discountPct / 100) : 0;
    grossSubtotal += grossLine;
    totalDiscount += discountLine;
  });

  return getTemplate({
    logoBase64: images.logo,
    brandsBase64: images.brands,
    quoteId: quote.id,
    date: formatQuoteDate(quote.createdAt),
    clientHtml: buildClientHtml(quote),
    sellerHtml: buildSellerHtml(seller),
    rowsHtml: buildTableRows(quote),
    grossSubtotal: formatCurrency(grossSubtotal),
    totalDiscount: formatCurrency(totalDiscount),
    iva: formatCurrency(iva),
    total: formatCurrency(total),
  });
}

/** Genera el PDF en el dispositivo y devuelve la ruta local del archivo. */
export async function generateQuotePdf(quote: Quote, seller?: User): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html: buildHtml(quote, seller) });
  return uri;
}

/** Genera el PDF y abre el share sheet de Android (WhatsApp, correo, etc.). */
export async function shareQuotePdf(quote: Quote, seller?: User): Promise<void> {
  const uri = await generateQuotePdf(quote, seller);

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
