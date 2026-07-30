import type { User } from '@/features/auth/types';
import { formatCurrency } from '@/utils/currency';

import type { Quote } from '../../types';
import { getLineTotal, getUnitPrice } from '../quoteCalculations';

export function escapeHtml(value: string): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function cleanAndTruncateDescription(descText: string, maxLength: number = 140): string {
  if (!descText) return '';
  const stripped = descText.replace(/<[^>]*>/g, ' ');
  const normalized = stripped.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, maxLength) + '...';
}

export function formatQuoteDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function buildClientHtml(quote: Quote): string {
  if (quote.client.kind === 'registered') {
    const c = quote.client.client;
    return `
      <div class="info-box">
        <div class="info-box-title">Información del Cliente</div>
        <div class="info-grid">
          ${c.name ? `<div class="info-label">Cliente:</div><div class="info-val" style="font-weight: 700;">${escapeHtml(c.name)}</div>` : ''}
          ${c.ruc ? `<div class="info-label">Identificación:</div><div class="info-val">${escapeHtml(c.ruc)}</div>` : ''}
          ${c.location ? `<div class="info-label">Dirección:</div><div class="info-val">${escapeHtml(c.location)}</div>` : ''}
          ${c.phone ? `<div class="info-label">Teléfono:</div><div class="info-val">${escapeHtml(c.phone)}</div>` : ''}
          ${c.email ? `<div class="info-label">Correo:</div><div class="info-val">${escapeHtml(c.email)}</div>` : ''}
        </div>
      </div>
    `;
  } else {
    const c = quote.client.client;
    return `
      <div class="info-box">
        <div class="info-box-title">Información del Cliente</div>
        <div class="info-grid">
          ${c.name ? `<div class="info-label">Cliente:</div><div class="info-val" style="font-weight: 700;">${escapeHtml(c.name)}</div>` : ''}
          ${c.contact ? `<div class="info-label">Contacto:</div><div class="info-val">${escapeHtml(c.contact)}</div>` : ''}
        </div>
      </div>
    `;
  }
}

export function buildSellerHtml(seller?: User): string {
  if (seller) {
    const sellerName = seller.name || 'Asesor Comercial';
    const sellerEmail = seller.email || '';
    return `
      <div class="info-box">
        <div class="info-box-title">Información del Vendedor</div>
        <div class="info-grid">
          <div class="info-label">Asesor Comercial:</div>
          <div class="info-val" style="font-weight: 700;">${escapeHtml(sellerName)}</div>
          <div class="info-label">Sucursal:</div>
          <div class="info-val">Cayambe</div>
          ${sellerEmail ? `<div class="info-label">Correo:</div><div class="info-val">${escapeHtml(sellerEmail)}</div>` : ''}
        </div>
      </div>
    `;
  } else {
    return `
      <div class="info-box">
        <div class="info-box-title">Información de Sucursal</div>
        <div class="info-grid">
          <div class="info-label">Sucursal:</div>
          <div class="info-val">Cayambe</div>
          <div class="info-label">Contacto:</div>
          <div class="info-val">ventas@campomaq.com.ec</div>
        </div>
      </div>
    `;
  }
}

export function buildTableRows(quote: Quote): string {
  return quote.items
    .map((item) => {
      const unitPrice = getUnitPrice(item.product, item.priceTier);
      const discountText = item.discountPct ? `${item.discountPct}%` : '-';
      const lineTotal = getLineTotal(item);
      
      const hasImage = !!item.product.imageUrl;
      const imgCellContent = hasImage
        ? `<div class="img-cell"><img src="${escapeHtml(item.product.imageUrl!)}" alt="Product Image" /></div>`
        : `
          <div class="img-cell">
            <div class="img-placeholder">
              <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: #8A8A8A;">
                <path d="M19,19H5V5H19M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3Z" />
              </svg>
              <span>Sin Imagen</span>
            </div>
          </div>
        `;

      const prodName = escapeHtml(item.product.name);
      const prodCode = escapeHtml(item.product.code);
      const prodBrand = escapeHtml(item.product.brand);
      
      const prodDesc = item.product.description 
        ? escapeHtml(cleanAndTruncateDescription(item.product.description, 140))
        : '';

      return `
        <tr>
          <td class="col-center">${imgCellContent}</td>
          <td>
            <div class="prod-name">${prodName}</div>
            <div class="prod-meta">
              <span><strong>Cód:</strong> ${prodCode}</span> &nbsp;&middot;&nbsp; 
              <span><strong>Marca:</strong> ${prodBrand}</span>
            </div>
            ${prodDesc ? `<div class="prod-desc">${prodDesc}</div>` : ''}
          </td>
          <td class="col-center num-value">${item.quantity}</td>
          <td class="col-center">Und.</td>
          <td class="col-right num-value">${formatCurrency(unitPrice)}</td>
          <td class="col-center num-value">${discountText}</td>
          <td class="col-center num-value">15%</td>
          <td class="col-right num-value">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');
}
