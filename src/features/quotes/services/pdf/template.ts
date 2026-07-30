import { getStyles } from './styles';

interface TemplateParams {
  logoBase64: string;
  brandsBase64: string;
  quoteId: string;
  date: string;
  clientHtml: string;
  sellerHtml: string;
  rowsHtml: string;
  grossSubtotal: string;
  totalDiscount: string;
  iva: string;
  total: string;
}

export function getTemplate({
  logoBase64,
  brandsBase64,
  quoteId,
  date,
  clientHtml,
  sellerHtml,
  rowsHtml,
  grossSubtotal,
  totalDiscount,
  iva,
  total,
}: TemplateParams): string {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          ${getStyles()}
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Banner Superior Curvado Pulido y Estilizado -->
          <div class="header-curves-banner">
            <svg viewBox="0 0 800 45" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block;">
              <!-- Curva amarilla principal de Campo Maq -->
              <path d="M0,0 L800,0 L800,30 Q600,45 400,25 T0,35 Z" fill="#EBD600" />
              <!-- Curva negra superior -->
              <path d="M0,0 L800,0 L800,15 Q600,28 400,12 T0,20 Z" fill="#1A1A1A" />
            </svg>
          </div>

          <!-- Header -->
          <header class="header-container">
            <div class="logo-area">
              ${logoBase64 ? `<img class="company-logo" src="data:image/png;base64,${logoBase64}" alt="Campo Maq Logo"/>` : `<div style="font-weight: 900; font-size: 24px; color: #1a1a1a;">CAMPO MAQ</div>`}
              <div class="company-details">
                <div class="company-name">Campo Maq</div>
                <div><strong>Matriz:</strong> Calle Venezuela No. OE464, Sec. La Patarata</div>
                <div>Cayambe - Ecuador</div>
                <div><strong>Teléfonos:</strong> 022110537 &nbsp;&middot;&nbsp; 0980582555 &nbsp;&middot;&nbsp; 0993559986</div>
                <div><strong>Correos:</strong> ventas@campomaq.com.ec &nbsp;&middot;&nbsp; ventasalex@campomaq.com.ec</div>
                <div><strong>Web:</strong> www.campomaq.com.ec</div>
              </div>
            </div>
            <div class="quote-meta">
              <h1 class="quote-title">Proforma</h1>
              <div class="quote-number">N° COT-${quoteId.toUpperCase()}</div>
              <div class="meta-grid">
                <div class="meta-label">Fecha Emisión:</div>
                <div class="meta-value">${date}</div>
                <div class="meta-label">Vigencia:</div>
                <div class="meta-value">30 días</div>
                <div class="meta-label">R.U.C.:</div>
                <div class="meta-value">1792456789001</div>
              </div>
            </div>
          </header>

          <!-- Separador sólido y recto amarillo de Campo Maq -->
          <div style="width: 100%; height: 4px; background-color: #EBD600; margin-bottom: 20px; border-radius: 2px;"></div>

          <!-- Client & Seller Info -->
          <section class="info-container">
            ${clientHtml}
            ${sellerHtml}
          </section>

          <!-- Products Table -->
          <main class="table-container">
            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 8%;" class="col-center">Imagen</th>
                  <th style="width: 50%;">Detalle del Producto</th>
                  <th style="width: 6%;" class="col-center">Cant.</th>
                  <th style="width: 6%;" class="col-center">Unidad</th>
                  <th style="width: 10%;" class="col-right">P. Unit.</th>
                  <th style="width: 10%;" class="col-center">Desc.</th>
                  <th style="width: 5%;" class="col-center">IVA</th>
                  <th style="width: 10%;" class="col-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </main>

          <!-- Footer Area / Totals & Notes -->
          <section class="footer-container">
            <div class="notes-section">
              <div class="note-card yellow-accent">
                <div class="note-title">Observaciones</div>
                <div class="note-text">
                  El precio especial de la proforma incluye el primer mantenimiento preventivo gratuito a las 50 horas de uso. Las entregas se realizarán directamente en las bodegas del cliente sin costo adicional de transporte dentro del perímetro urbano.
                </div>
              </div>
              
              <div class="note-card">
                <div class="note-title">Términos y Acuerdos Comerciales</div>
                <div class="note-text">
                  1. <strong>Forma de Pago:</strong> Contra entrega o crédito autorizado previo.<br/>
                  2. <strong>Garantía:</strong> 1 año de garantía total contra defectos de fabricación en talleres autorizados.<br/>
                  3. <strong>Repuestos:</strong> Stock de repuestos originales garantizado por 5 años.
                </div>
              </div>
            </div>
            
            <div class="totals-box">
              <div class="totals-row">
                <span class="label">Subtotal Bruto</span>
                <span class="val">${grossSubtotal}</span>
              </div>
              <div class="totals-row">
                <span class="label">Descuento</span>
                <span class="val">-${totalDiscount}</span>
              </div>
              <div class="totals-row">
                <span class="label">I.V.A. (15%)</span>
                <span class="val">${iva}</span>
              </div>
              <div class="totals-row final-total">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          </section>

          <!-- Banner Inferior Curvado amarillo y negro estilizado antes del footer -->
          <div style="width: 100%; height: 25px; margin-top: 25px; margin-bottom: 5px;">
            <svg viewBox="0 0 800 25" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block;">
              <path d="M0,25 Q200,5 500,20 T800,15 L800,25 L0,25 Z" fill="#EBD600" />
              <path d="M0,25 Q250,15 450,22 T800,20 L800,25 L0,25 Z" fill="#1A1A1A" />
            </svg>
          </div>

          <!-- Footer -->
          <footer class="page-footer">
            <div class="legal-notice">
              Esta proforma constituye únicamente una cotización comercial y no representa una factura ni un comprobante tributario válido.
            </div>
            <div class="brands-section">
              <div class="brands-title">Distribuidor Autorizado de las mejores marcas del mundo</div>
              <div class="brands-container">
                ${brandsBase64 ? `<img class="brands-strip" src="data:image/png;base64,${brandsBase64}" alt="Marcas Aliadas" />` : ''}
              </div>
            </div>
            <div class="page-number-container">
              Página 1 de 1
            </div>
          </footer>
        </div>
      </body>
    </html>
  `;
}
